import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Building2, Users, CreditCard, DollarSign, 
  Bell, LogOut, Menu, X, ChevronRight, UserCircle, ShieldCheck, BookOpen, ExternalLink, Activity, Sparkles 
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
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Network Management',
      items: [
        { name: 'Libraries', path: '/admin/libraries', icon: Building2 },
        { name: 'Librarians', path: '/admin/librarians', icon: ShieldCheck },
        { name: 'Members', path: '/admin/members', icon: Users },
      ],
    },
    {
      title: 'Billing & Access',
      items: [
        { name: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
        { name: 'Payments', path: '/admin/payments', icon: DollarSign },
      ],
    },
    {
      title: 'System',
      items: [
        { name: 'Notifications', path: '/admin/notifications', icon: Bell, badge: unreadCount },
      ],
    },
    {
      title: 'Account',
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
    <div className="h-screen w-full bg-slate-100 flex overflow-hidden font-sans text-slate-900 antialiased selection:bg-amber-400 selection:text-slate-950">
      <div className="flex flex-1 w-full h-full relative overflow-hidden">
        {/* DESKTOP FIXED SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-slate-950 text-white border-r border-slate-800/90 shrink-0 select-none z-20 overflow-hidden shadow-2xl">
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-md">
            <Link to="/admin" className="shrink-0 group">
              <OpenShelfBrand role="admin" size="md" dark />
            </Link>
          </div>

          {/* Sidebar Navigation Links with Conceptual Grouping */}
          <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto min-h-0 scrollbar-none">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 pt-1 pb-1 text-[10px] font-black tracking-widest text-slate-500 uppercase flex items-center justify-between">
                  <span>{section.title}</span>
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
                      className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ease-out ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-l-4 border-amber-400 text-amber-300 font-extrabold shadow-sm translate-x-0.5'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.06] hover:translate-x-0.5'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110 ${
                        isActive
                          ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                          : 'text-slate-400 group-hover:text-amber-400'
                      }`} />
                      <span className="flex-1 truncate">{item.name}</span>
                      {item.badge > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-transform duration-200 group-hover:scale-105 ${
                          isActive
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : 'bg-amber-500/90 text-slate-950'
                        }`}>
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer User Card */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950 shrink-0">
            <div className="group flex items-center gap-3 p-2.5 bg-gradient-to-r from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-2xl transition-all duration-200 hover:border-slate-700 shadow-md">
              <Link to="/admin/profile" className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center overflow-hidden border border-amber-300/30 shadow-xs">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : 'A'
                  )}
                </div>
                {/* Active pulse status dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </Link>

              <Link to="/admin/profile" className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition-colors duration-200">
                  {user?.name || 'Administrator'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block text-[9px] uppercase tracking-widest font-black text-amber-400">
                    SYSTEM ADMIN
                  </span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200 group/logout shrink-0 cursor-pointer"
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
                className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
              />

              <motion.aside
                {...SIDEBAR_SLIDE_VARIANTS}
                className="relative w-72 bg-slate-950 text-white flex flex-col h-full z-10 shadow-2xl border-r border-slate-800"
              >
                <div className="p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
                  <Link to="/admin" onClick={() => setMobileSidebarOpen(false)} className="shrink-0">
                    <OpenShelfBrand role="admin" size="md" dark />
                  </Link>

                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 px-4 py-5 space-y-4 overflow-y-auto">
                  {navSections.map((section) => (
                    <div key={section.title} className="space-y-1">
                      <div className="px-3 pt-1 pb-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
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
                                ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-l-4 border-amber-400 text-amber-300 font-black shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                            }`}
                          >
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]' : 'text-slate-400 group-hover:text-amber-400'}`} />
                            <span className="flex-1 truncate">{item.name}</span>
                            {item.badge > 0 && (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-amber-500/90 text-slate-950'}`}>
                                {item.badge > 99 ? '99+' : item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </nav>

                <div className="p-4 border-t border-slate-800/80 bg-slate-950 shrink-0">
                  <div className="flex items-center justify-between gap-3 p-2.5 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl">
                    <Link
                      to="/admin/profile"
                      onClick={() => setMobileSidebarOpen(false)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center overflow-hidden shrink-0 border border-amber-300/30">
                        {user?.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user?.name ? user.name[0].toUpperCase() : 'A'
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate group-hover:text-amber-400">
                          {user?.name || 'Administrator'}
                        </p>
                        <span className="text-[9px] uppercase tracking-widest font-black text-amber-400 block">
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
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
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
          <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0 shadow-xs z-10">
            {/* Left Header Info + Mobile Menu Trigger */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Toggle Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 truncate">
                <span className="hidden sm:inline text-slate-700 font-extrabold">Administrator Workspace</span>
                <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-400" />
                <span className="text-amber-600 font-black truncate">{pageTitle}</span>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {/* Live System Health Badge */}
              <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-black shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>System Healthy</span>
              </div>

              {/* Shortcut: Live Preview Public Site */}
              <Link
                to="/libraries"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200/80 transition-all cursor-pointer group"
                title="Browse Public Network Libraries"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                <span>Public Site</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
              </Link>

              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors relative cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center shadow-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Popover Dropdown */}
                <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    {...DROPDOWN_MOTION_VARIANTS}
                    style={{ transformOrigin: 'top right' }}
                    className="absolute right-0 mt-2 w-[calc(100vw-24px)] md:w-80 sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-3 z-50 space-y-2 text-xs"
                    onMouseLeave={() => setNotifOpen(false)}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                      <span className="font-extrabold text-slate-900 text-xs">Admin Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
                      {notifList.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 font-medium italic">
                          No notifications in system inbox.
                        </div>
                      ) : (
                        notifList.slice(0, 8).map((n) => {
                          const isUnread = !n.read_at && !n.is_read;
                          return (
                            <Link
                              key={n.id}
                              to={n.target_url || '/admin/notifications'}
                              onClick={async () => {
                                setNotifOpen(false);
                                if (isUnread && n.is_persistent !== false) {
                                  try {
                                    await adminService.markNotificationAsRead(n.id);
                                    fetchNotifs();
                                  } catch {
                                    // Silent
                                  }
                                }
                              }}
                              className={`py-2.5 px-2 rounded-xl transition-colors cursor-pointer flex items-start gap-2.5 group ${
                                isUnread ? 'bg-amber-50/60 hover:bg-amber-100/60' : 'hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-base shrink-0 mt-0.5">
                                {n.type === 'library' ? '🏛️' : n.type === 'subscription' ? '⏳' : n.type === 'payment' ? '💳' : '🔔'}
                              </span>
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <div className="flex items-center justify-between gap-1">
                                  <p className={`font-black text-xs truncate ${isUnread ? 'text-amber-900' : 'text-slate-900'}`}>{n.title}</p>
                                  {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                                </div>
                                <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">{n.message}</p>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-center">
                      <Link
                        to="/admin/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="text-[11px] font-extrabold text-amber-600 hover:underline block py-1"
                      >
                        View All System Notifications →
                      </Link>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>

              {/* Header User Identity Pill */}
              <Link to="/admin/profile" className="flex items-center gap-2.5 pl-2 border-l border-slate-200/80 hover:opacity-85 transition-opacity">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center overflow-hidden shrink-0 border border-amber-300/40 shadow-xs">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : 'A'
                  )}
                </div>

                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{user?.name || 'Administrator'}</p>
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block">ADMIN</span>
                </div>
              </Link>
            </div>
          </header>

          {/* MAIN WORKSPACE CONTENT VIEWPORT */}
          <main className="flex-1 overflow-y-auto scrollbar-none p-2.5 lg:p-4 flex flex-col min-h-0 h-full w-full">
            <React.Suspense fallback={<div className="flex-1 flex items-center justify-center p-12"><div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}>
              <Outlet />
            </React.Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
