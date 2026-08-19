import { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Building2, Users, CreditCard, DollarSign, 
  Bell, LogOut, Menu, X, ChevronRight, UserCircle, ShieldCheck, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifList, setNotifList] = useState([]);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await adminService.getNotifications();
      setNotifList(res.data || []);
      setUnreadCount(res.unread_count || 0);
    } catch {
      // Silent error fallback
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    const handleNotificationsRead = () => fetchNotifs();
    window.addEventListener('notificationsRead', handleNotificationsRead);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsRead', handleNotificationsRead);
    };
  }, [fetchNotifs]);

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
    <div className="h-screen w-full bg-slate-100 flex overflow-hidden font-sans text-slate-900 antialiased selection:bg-amber-400 selection:text-slate-950">
      <div className="flex flex-1 w-full h-full relative overflow-hidden">
        {/* DESKTOP FIXED SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-[#070D1A] text-[#F8FAFC] border-r border-[#1E293B] shrink-0 select-none z-20 overflow-hidden">
          {/* Brand Header (~100px) */}
          <div className="p-5 border-b border-[#1E293B] flex items-center justify-between shrink-0 h-[100px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0 transition-transform duration-200 hover:scale-105">
                <BookOpen className="w-5.5 h-5.5 text-slate-950" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-extrabold text-lg text-[#F8FAFC] tracking-tight block leading-none">OpenShelf</span>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mt-1 leading-none">
                  ADMIN WORKSPACE
                </span>
                <span className="text-[8px] font-extrabold text-[#64748B] uppercase tracking-wider block mt-1 leading-none">
                  SYSTEM ADMINISTRATION
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Navigation Links with Conceptual Grouping */}
          <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto min-h-0 scrollbar-none">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 pt-1 pb-1 text-[10px] font-bold tracking-widest text-[#64748B] uppercase">
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
                          ? 'bg-[#F59E0B] text-slate-950 shadow-md shadow-amber-500/20 font-extrabold translate-x-0.5 motion-reduce:transform-none'
                          : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-slate-900/90 hover:translate-x-0.5 motion-reduce:transform-none'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:transform-none ${isActive ? 'text-slate-950' : 'text-[#94A3B8] group-hover:text-amber-400'}`} />
                      <span className="flex-1 truncate transition-all duration-200">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer User Card */}
          <div className="p-4 border-t border-[#1E293B] bg-[#070D1A]/80 shrink-0">
            <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-900/90 border border-[#1E293B] rounded-xl">
              <Link to="/admin/profile" className="flex items-center gap-2.5 min-w-0 flex-1 group">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center overflow-hidden shrink-0 border border-white/20 transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:transform-none">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : 'A'
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#F8FAFC] truncate group-hover:text-amber-300 transition-colors duration-200">
                    {user?.name || 'System Admin'}
                  </p>
                  <span className="text-[9px] uppercase tracking-widest font-extrabold text-amber-400 block">
                    ADMINISTRATOR
                  </span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-all duration-200 group/logout shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4 transition-transform duration-200 group-hover/logout:translate-x-0.5 motion-reduce:transform-none" />
              </button>
            </div>
          </div>
        </aside>

        {/* MOBILE SIDEBAR DRAWER OVERLAY */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-[#070D1A]/80 backdrop-blur-xs"
              />

              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative w-72 bg-[#070D1A] text-[#F8FAFC] flex flex-col h-full z-10 shadow-2xl border-r border-[#1E293B]"
              >
                <div className="p-5 border-b border-[#1E293B] flex items-center justify-between shrink-0 h-[100px]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                      <BookOpen className="w-5.5 h-5.5 text-slate-950" strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className="font-extrabold text-lg text-[#F8FAFC] tracking-tight block leading-none">OpenShelf</span>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mt-1 leading-none">
                        ADMIN WORKSPACE
                      </span>
                      <span className="text-[8px] font-extrabold text-[#64748B] uppercase tracking-wider block mt-1 leading-none">
                        SYSTEM ADMINISTRATION
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
                  {navSections.map((section) => (
                    <div key={section.title} className="space-y-1">
                      <div className="px-3 pt-1 pb-1 text-[10px] font-bold tracking-widest text-[#64748B] uppercase">
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
                                ? 'bg-[#F59E0B] text-slate-950 shadow-md font-extrabold'
                                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-slate-900'
                            }`}
                          >
                            <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-slate-950' : 'text-[#94A3B8] group-hover:text-amber-400'}`} />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </nav>

                <div className="p-4 border-t border-[#1E293B] bg-[#070D1A]/80 shrink-0">
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-900/90 border border-[#1E293B] rounded-xl">
                    <Link
                      to="/admin/profile"
                      onClick={() => setMobileSidebarOpen(false)}
                      className="flex items-center gap-2.5 min-w-0 flex-1 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center overflow-hidden shrink-0 border border-white/20">
                        {user?.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user?.name ? user.name[0].toUpperCase() : 'A'
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#F8FAFC] truncate">
                          {user?.name || 'System Admin'}
                        </p>
                        <span className="text-[9px] uppercase tracking-widest font-extrabold text-amber-400 block">
                          ADMINISTRATOR
                        </span>
                      </div>
                    </Link>

                    <button
                      onClick={() => {
                        setMobileSidebarOpen(false);
                        handleLogout();
                      }}
                      title="Log Out"
                      className="p-1.5 text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-all cursor-pointer"
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
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
          {/* ADMIN TOP HEADER */}
          <header className="h-14 bg-white border-b border-slate-200/80 px-4 sm:px-5 lg:px-6 flex items-center justify-between gap-4 shrink-0 shadow-xs z-10">
            {/* Left Header Info + Mobile Menu Trigger */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                title="Toggle Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 truncate">
                <span className="hidden sm:inline text-amber-700">Administrator</span>
                <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900 font-extrabold truncate">{pageTitle}</span>
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
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50 overflow-hidden text-xs">
                    <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">Unread Alerts</span>
                      {unreadCount > 0 ? (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full">
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
                            className="p-3 flex items-start gap-2.5 hover:bg-slate-50 transition-colors block bg-amber-50/20"
                          >
                            <span className="text-base shrink-0">
                              {n.type === 'library' ? '🏛️' : n.type === 'subscription' ? '⏳' : n.type === 'payment' ? '💳' : '🔔'}
                            </span>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-bold text-slate-900 truncate">{n.title}</p>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
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
                        className="text-xs font-extrabold text-amber-700 hover:text-amber-800 transition-colors"
                      >
                        View All Notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Header User Identity Pill */}
              <Link to="/admin/profile" className="flex items-center gap-2 pl-2 border-l border-slate-200/80 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center overflow-hidden shrink-0 border border-white shadow-xs">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : 'A'
                  )}
                </div>

                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{user?.name || 'Administrator'}</p>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Administrator</span>
                </div>
              </Link>
            </div>
          </header>

          {/* MAIN WORKSPACE CONTENT VIEWPORT */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col min-h-0 h-full w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 flex flex-col min-h-0 h-full w-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
