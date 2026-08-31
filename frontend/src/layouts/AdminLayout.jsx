import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Building2, Users, CreditCard, DollarSign, 
  Bell, LogOut, Menu, X, ChevronRight, UserCircle, ShieldCheck, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import OpenShelfBrand from '../components/common/OpenShelfBrand';
import { SIDEBAR_SLIDE_VARIANTS, BACKDROP_MOTION_VARIANTS, DROPDOWN_MOTION_VARIANTS } from '../constants/motionTokens';
import { useNotifications } from '../hooks/queries/useNotifications';
import { useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../hooks/queries/useNotificationMutations';

// Prefetch all admin page chunks on layout mount so navigation is instant
const ADMIN_CHUNKS = [
  () => import('../pages/admin/AdminDashboard'),
  () => import('../pages/admin/AdminLibraries'),
  () => import('../pages/admin/AdminLibraryDetails'),
  () => import('../pages/admin/AdminLibrarians'),
  () => import('../pages/admin/AdminLibrarianDetails'),
  () => import('../pages/admin/AdminMembers'),
  () => import('../pages/admin/AdminMemberDetails'),
  () => import('../pages/admin/AdminSubscriptions'),
  () => import('../pages/admin/AdminSubscriptionDetails'),
  () => import('../pages/admin/AdminPayments'),
  () => import('../pages/admin/AdminPaymentDetails'),
  () => import('../pages/admin/AdminNotifications'),
  () => import('../pages/admin/AdminProfile'),
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Prefetch all admin route chunks in background after initial paint
  useEffect(() => {
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
    idle(() => { ADMIN_CHUNKS.forEach((load) => load().catch(() => {})); });
  }, []);

  // Isolate Admin Workspace: do not inherit member night mode toggle
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const wasDark = root.classList.contains('dark') || localStorage.getItem('theme') === 'dark';

    root.classList.remove('dark');
    body.classList.remove('dark', 'bg-slate-950', 'text-slate-100');
    body.style.backgroundColor = '#F8FAFC';
    body.style.color = '#0F172A';

    return () => {
      // Restore public website theme preference on unmount
      if (wasDark || localStorage.getItem('theme') === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark', 'bg-slate-950', 'text-slate-100');
        body.style.backgroundColor = '#040C16';
        body.style.color = '#F8FAFC';
      } else {
        body.style.backgroundColor = '';
        body.style.color = '';
      }
    };
  }, []);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // TanStack Query for reactive notifications state across header, sidebar, and notification pages
  const { data: notifData, refetch: fetchNotifs } = useNotifications('admin', Boolean(user));
  const markNotifReadMutation = useMarkNotificationAsRead('admin');
  const markAllNotifsReadMutation = useMarkAllNotificationsAsRead('admin');

  const notifList = Array.isArray(notifData?.data) ? notifData.data : (Array.isArray(notifData) ? notifData : []);
  const unreadCount = notifData?.unread_count ?? notifList.filter((n) => !n.read_at && !n.is_read).length;

  // Conceptually grouped navigation items for System Administration visual hierarchy
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      title: 'NETWORK MANAGEMENT',
      items: [
        { name: 'Libraries', path: '/admin/libraries', icon: Building2 },
        { name: 'Librarians', path: '/admin/librarians', icon: ShieldCheck },
        { name: 'Members', path: '/admin/members', icon: Users },
      ],
    },
    {
      title: 'BILLING & ACCESS',
      items: [
        { name: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
        { name: 'Payments', path: '/admin/payments', icon: DollarSign },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Notifications', path: '/admin/notifications', icon: Bell },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { name: 'My Profile', path: '/admin/profile', icon: UserCircle },
      ],
    },
  ];

  const allNavItems = navSections.flatMap((section) => section.items);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Compute current page title for breadcrumb
  const sortedItems = [...allNavItems].sort((a, b) => b.path.length - a.path.length);
  const currentNav = sortedItems.find((item) =>
    item.path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(item.path)
  );
  const pageTitle = location.pathname === '/admin/profile' ? 'My Profile' : (currentNav?.name || 'Workspace');

  return (
    <div className="h-screen w-full bg-slate-100 flex overflow-hidden font-sans text-slate-900 antialiased selection:bg-gold-400 selection:text-slate-950">
      <div className="flex flex-1 w-full h-full relative overflow-hidden">
        {/* DESKTOP FIXED SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-navy-950 text-white border-r border-navy-800 shrink-0 select-none z-20 overflow-hidden">
          {/* Brand Header (~100px) */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 h-[100px]">
            <Link to="/admin" className="shrink-0">
              <OpenShelfBrand role="admin" size="md" dark />
            </Link>
          </div>

          {/* Sidebar Navigation Links with Conceptual Grouping */}
          <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto min-h-0 scrollbar-none">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 pt-1 pb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path === '/admin'
                    ? location.pathname === '/admin'
                    : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ease-out motion-reduce:transition-none ${
                        isActive
                          ? 'bg-navy-800 text-white border-l-4 border-gold-500 shadow-sm font-extrabold translate-x-0.5'
                          : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-0.5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                      <span className="flex-1 truncate transition-all duration-200">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer User Card */}
          <div className="p-4 border-t border-white/10 bg-navy-950 shrink-0">
            <div className="flex items-center justify-between gap-2 p-2.5 bg-navy-800/70 border border-navy-800 rounded-xl">
              <Link to="/admin/profile" className="flex items-center gap-2.5 min-w-0 flex-1 group">
                <div className="w-9 h-9 rounded-xl bg-gold-500 text-navy-950 font-black text-xs flex items-center justify-center overflow-hidden shrink-0 border border-white/20 transition-transform duration-200 group-hover:scale-[1.03]">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : 'A'
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate group-hover:text-gold-500 transition-colors duration-200">{user?.name || 'Administrator'}</p>
                  <span className="inline-block text-[9px] uppercase tracking-widest font-extrabold text-gold-500">
                    SYSTEM ADMIN
                  </span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-600/10 rounded-lg transition-all duration-200 group/logout shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4 transition-transform duration-200 group-hover/logout:translate-x-0.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* MOBILE SIDEBAR DRAWER OVERLAY */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <motion.div
                {...BACKDROP_MOTION_VARIANTS}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-navy-950/50 backdrop-blur-sm"
              />

              <motion.aside
                {...SIDEBAR_SLIDE_VARIANTS}
                className="relative w-72 bg-navy-950 text-white flex flex-col h-full z-10 shadow-2xl border-r border-navy-800"
              >
                <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0 h-[100px]">
                  <Link to="/admin" onClick={() => setMobileSidebarOpen(false)} className="shrink-0">
                    <OpenShelfBrand role="admin" size="md" dark />
                  </Link>

                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
                  {navSections.map((section) => (
                    <div key={section.title} className="space-y-1">
                      <div className="px-3 pt-1 pb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                        {section.title}
                      </div>
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.path === '/admin'
                          ? location.pathname === '/admin'
                          : location.pathname.startsWith(item.path);

                        return (
                          <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setMobileSidebarOpen(false)}
                            className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ease-out ${
                              isActive
                                ? 'bg-navy-800 text-white border-l-4 border-gold-500 shadow-sm font-bold'
                                : 'text-slate-300 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span className="flex-1 truncate">{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </nav>

                <div className="p-4 border-t border-white/10 bg-navy-950 shrink-0">
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-navy-800/70 border border-navy-800 rounded-xl">
                    <Link
                      to="/admin/profile"
                      onClick={() => setMobileSidebarOpen(false)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gold-500 text-navy-950 font-extrabold text-xs flex items-center justify-center overflow-hidden shrink-0 border border-white/20">
                        {user?.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user?.name ? user.name[0].toUpperCase() : 'A'
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">
                          {user?.name || 'Administrator'}
                        </p>
                        <span className="text-[9px] uppercase tracking-widest font-extrabold text-gold-500 block">
                          SYSTEM ADMIN
                        </span>
                      </div>
                    </Link>

                    <button
                      onClick={() => {
                        setMobileSidebarOpen(false);
                        handleLogout();
                      }}
                      title="Log Out"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-600/10 rounded-lg transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* MAIN WORKSPACE WRAPPER */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F7FAFD] overflow-hidden">
          {/* ADMIN TOP HEADER */}
          <header className="h-14 bg-white border-b border-brand-border px-4 sm:px-5 lg:px-6 flex items-center justify-between gap-4 shrink-0 shadow-xs z-10">
            {/* Left Header Info + Mobile Menu Trigger */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 text-navy-500 hover:bg-navy-50 rounded-xl transition-colors"
                title="Toggle Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-bold text-navy-400 truncate">
                <span className="hidden sm:inline text-navy-800 font-extrabold">Administrator</span>
                <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-400" />
                <span className="text-navy-500 font-black truncate">{pageTitle}</span>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors relative cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Popover Dropdown */}
                <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    {...DROPDOWN_MOTION_VARIANTS}
                    style={{ transformOrigin: 'top right' }}
                    className="absolute right-0 mt-2 w-[calc(100vw-24px)] md:w-80 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 overflow-hidden text-xs"
                  >
                    <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">Unread Alerts</span>
                      {unreadCount > 0 ? (
                        <span className="text-[10px] bg-gold-100 text-gold-600 font-extrabold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">
                          0 unread
                        </span>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifList.filter((n) => !n.is_read).length === 0 ? (
                        <div className="p-6 text-center text-slate-400 font-medium italic text-xs">
                          No unread notifications.
                        </div>
                      ) : (
                        notifList.filter((n) => !n.is_read).slice(0, 5).map((n) => (
                          <Link
                            key={n.id}
                            to={n.target_url || '/admin/notifications'}
                            onClick={async () => {
                              setNotifOpen(false);
                              if (!n.is_read && n.is_persistent !== false) {
                                try {
                                  await adminService.markNotificationAsRead(n.id);
                                  fetchNotifs();
                                  window.dispatchEvent(new Event('notificationsRead'));
                                } catch {
                                  // Silent catch
                                }
                              }
                            }}
                            className="p-3 flex items-start gap-2.5 hover:bg-slate-50 transition-colors block bg-gold-100/30"
                          >
                            <span className="text-base shrink-0">
                              {n.type === 'library' ? '🏛️' : n.type === 'subscription' ? '⏳' : n.type === 'payment' ? '💳' : '🔔'}
                            </span>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-bold text-slate-900 truncate">{n.title}</p>
                                <span className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-2">{n.message}</p>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>

                    <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                      <Link
                        to="/admin/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="text-xs font-extrabold text-gold-600 hover:underline transition-colors"
                      >
                        View All Notifications →
                      </Link>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>

              {/* Header User Identity Pill */}
              <Link to="/admin/profile" className="flex items-center gap-2 pl-2 border-l border-slate-200/80 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-xl bg-gold-500 text-slate-950 font-extrabold text-xs flex items-center justify-center overflow-hidden shrink-0 border border-white shadow-xs">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : 'A'
                  )}
                </div>

                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{user?.name || 'Administrator'}</p>
                  <span className="text-[10px] font-bold text-gold-600 uppercase tracking-wider block">Administrator</span>
                </div>
              </Link>
            </div>
          </header>

          {/* MAIN WORKSPACE CONTENT VIEWPORT */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col min-h-0 h-full w-full">
            <React.Suspense fallback={<div className="flex-1 flex items-center justify-center p-12"><div className="w-8 h-8 border-3 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>}>
              <Outlet />
            </React.Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
