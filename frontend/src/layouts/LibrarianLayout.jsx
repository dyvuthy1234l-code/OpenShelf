import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Building2, BookOpen, Tag, Inbox, 
  ArrowLeftRight, Users, CreditCard, BarChart3, Bell, 
  LogOut, Menu, X, User, ChevronRight, UserCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import librarianService from '../services/librarianService';
import { formatNotificationTime } from '../utils/dateUtils';
import OpenShelfBrand from '../components/common/OpenShelfBrand';
import { SIDEBAR_SLIDE_VARIANTS, BACKDROP_MOTION_VARIANTS, DROPDOWN_MOTION_VARIANTS } from '../constants/motionTokens';

export default function LibrarianLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const fetchLibrarianNotifications = useCallback(async () => {
    if (!user || (user.role !== 'librarian' && user.role !== 'admin')) return;
    try {
      const res = await librarianService.getNotifications();
      const list = res.data || [];
      setNotifications(list);
      setUnreadCount(res.unread_count ?? list.filter((n) => !n.read_at).length);
    } catch {
      // non-critical
    }
  }, [user]);

  useEffect(() => {
    fetchLibrarianNotifications();

    // Auto-refresh every 10 seconds for real-time borrow requests & notifications
    const interval = setInterval(fetchLibrarianNotifications, 10000);

    const handleFocus = () => fetchLibrarianNotifications();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchLibrarianNotifications]);

  const handleMarkNotifRead = async (id) => {
    try {
      await librarianService.markNotificationAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // non-critical
    }
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await librarianService.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      // non-critical
    }
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await librarianService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // non-critical
    }
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/librarian', icon: LayoutDashboard },
    { name: 'My Library', path: '/librarian/library', icon: Building2 },
    { name: 'Books', path: '/librarian/books', icon: BookOpen },
    { name: 'Categories', path: '/librarian/categories', icon: Tag },
    { name: 'Borrow Requests', path: '/librarian/borrow-requests', icon: Inbox },
    { name: 'Returns', path: '/librarian/returns', icon: ArrowLeftRight },
    { name: 'Members', path: '/librarian/members', icon: Users },
    { name: 'Notifications', path: '/librarian/notifications', icon: Bell, badge: unreadCount },
    { name: 'Subscription', path: '/librarian/subscription', icon: CreditCard },
    { name: 'Reports', path: '/librarian/reports', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Compute current page title for breadcrumb (sorting by path length for exact nested matching)
  const sortedItems = [...navigationItems].sort((a, b) => b.path.length - a.path.length);
  const currentNav = sortedItems.find((item) =>
    item.path === '/librarian'
      ? location.pathname === '/librarian'
      : location.pathname.startsWith(item.path)
  );
  const pageTitle = currentNav?.name || 'Workspace';

  return (
    <div className="h-screen w-full bg-slate-100 flex overflow-hidden font-sans text-slate-900 antialiased selection:bg-gold-400 selection:text-slate-950">
      <div className="flex flex-1 w-full h-full relative overflow-hidden">
        {/* DESKTOP FIXED SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-navy-950 text-white border-r border-navy-800 shrink-0 select-none z-20 overflow-hidden">
          {/* Brand Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3 shrink-0">
            <Link to="/librarian" className="shrink-0">
              <OpenShelfBrand role="librarian" size="md" dark />
            </Link>
          </div>

          {/* Sidebar Navigation Links */}
          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto scrollbar-none min-h-0">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/librarian' && location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-out motion-reduce:transition-none ${
                    isActive
                      ? 'bg-navy-800 text-white border-l-4 border-gold-500 shadow-sm font-extrabold translate-x-0.5'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-0.5'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  <span className="flex-1 truncate transition-all duration-200">{item.name}</span>
                  {item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-transform duration-200 group-hover:scale-105 ${isActive ? 'bg-navy-950 text-gold-500' : 'bg-gold-500 text-navy-950'}`}>
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* My Profile Link */}
          <div className="px-3 pb-2 shrink-0">
            <Link
              to="/librarian/profile"
              className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ease-out motion-reduce:transition-none ${
                location.pathname === '/librarian/profile'
                  ? 'bg-navy-800 text-white border-l-4 border-gold-500 shadow-sm font-extrabold translate-x-0.5'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 hover:translate-x-0.5'
              }`}
            >
              <UserCircle className={`w-4 h-4 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110 ${location.pathname === '/librarian/profile' ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span>My Profile</span>
            </Link>
          </div>

          {/* Sidebar Footer User Card */}
          <div className="p-3 border-t border-white/10 bg-navy-950 shrink-0">
            <div className="group flex items-center gap-2.5 p-2 bg-navy-800/70 border border-navy-800 rounded-xl transition-all duration-200 ease-out hover:bg-navy-800/90">
              <div className="w-8 h-8 rounded-xl bg-gold-500 text-navy-950 font-black text-xs flex items-center justify-center overflow-hidden shrink-0 border border-white/20 transition-transform duration-200 group-hover:scale-[1.03]">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name[0].toUpperCase() : 'L'
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate group-hover:text-gold-500 transition-colors duration-200">{user?.name || 'Librarian'}</p>
                <span className="inline-block text-[9px] uppercase tracking-widest font-extrabold text-gold-500">
                  {user?.role || 'LIBRARIAN'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-600/10 rounded-xl transition-all duration-200 group/logout shrink-0 cursor-pointer"
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
                <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                  <Link to="/librarian" onClick={() => setMobileSidebarOpen(false)} className="shrink-0">
                    <OpenShelfBrand role="librarian" size="md" dark />
                  </Link>

                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || (item.path !== '/librarian' && location.pathname.startsWith(item.path));

                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`group flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ease-out ${
                          isActive
                            ? 'bg-navy-800 text-white border-l-4 border-gold-500 shadow-sm font-bold'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="flex-1">{item.name}</span>
                        {item.badge > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-navy-950 text-gold-500' : 'bg-gold-500 text-navy-950'}`}>
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile My Profile Link */}
                <div className="px-4 pb-2">
                  <Link
                    to="/librarian/profile"
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`group flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ease-out ${
                      location.pathname === '/librarian/profile'
                        ? 'bg-navy-800 text-white border-l-4 border-gold-500 shadow-sm font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <UserCircle className={`w-4 h-4 shrink-0 ${location.pathname === '/librarian/profile' ? 'text-white' : 'text-slate-400'}`} />
                    <span>My Profile</span>
                  </Link>
                </div>

                <div className="p-4 border-t border-white/10 bg-navy-950">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-600/30 text-rose-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        {/* MAIN WORKSPACE WRAPPER */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F7FAFD] overflow-hidden">
          {/* LIBRARIAN TOP HEADER */}
          <header className="h-16 bg-white border-b border-brand-border px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0 shadow-xs z-10">
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
                <span className="hidden sm:inline text-navy-800 font-extrabold">Librarian</span>
                <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-400" />
                <span className="text-navy-500 font-black truncate">{pageTitle}</span>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    const next = !notifDropdownOpen;
                    setNotifDropdownOpen(next);
                    if (next) fetchLibrarianNotifications();
                  }}
                  className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors relative cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center shadow-2xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                {notifDropdownOpen && (
                  <motion.div
                    {...DROPDOWN_MOTION_VARIANTS}
                    style={{ transformOrigin: 'top right' }}
                    className="absolute right-0 mt-2 w-[calc(100vw-24px)] md:w-80 sm:w-96 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-3 z-50 space-y-2 text-xs"
                    onMouseLeave={() => setNotifDropdownOpen(false)}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                      <span className="font-extrabold text-slate-900 text-xs">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllNotifsRead}
                          className="text-[11px] font-bold text-gold-600 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 font-medium italic">
                        No notifications in your inbox.
                      </div>
                    ) : (
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
                        {notifications.slice(0, 10).map((n) => {
                          const isUnread = !n.read_at;
                          const message = n.data?.message || n.message || 'New update';
                          const title = n.data?.title || 'Notice';

                          return (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (isUnread) handleMarkNotifRead(n.id);
                                const text = (title + ' ' + message).toLowerCase();
                                if (text.includes('return')) {
                                  navigate('/librarian/returns');
                                } else if (text.includes('borrow') || text.includes('request')) {
                                  navigate('/librarian/borrow-requests');
                                } else {
                                  navigate('/librarian/notifications');
                                }
                                setNotifDropdownOpen(false);
                              }}
                              className={`py-2.5 px-2 rounded-xl transition-colors cursor-pointer flex items-start justify-between gap-2 group ${
                                isUnread ? 'bg-gold-100/60 hover:bg-gold-100' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="min-w-0 space-y-0.5 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`font-extrabold text-xs truncate ${isUnread ? 'text-gold-600' : 'text-slate-900'}`}>
                                    {title}
                                  </span>
                                  <span className="text-[9px] text-slate-400 shrink-0">
                                    {formatNotificationTime(n.created_at)}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">{message}</p>
                              </div>

                              <button
                                onClick={(e) => handleDeleteNotif(e, n.id)}
                                title="Delete"
                                className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 text-center">
                      <Link
                        to="/librarian/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-[11px] font-extrabold text-gold-600 hover:text-gold-600 hover:underline block py-1"
                      >
                        View All Notifications & Messages →
                      </Link>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>

              {/* Header User Identity Pill - Clickable to Profile */}
              <Link to="/librarian/profile" className="flex items-center gap-2 pl-2 border-l border-slate-200/80 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-xl bg-gold-500 text-slate-950 font-extrabold text-xs flex items-center justify-center overflow-hidden shrink-0 border border-white shadow-xs">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : 'L'
                  )}
                </div>

                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{user?.name || 'Librarian'}</p>
                  <span className="text-[10px] font-bold text-gold-600 uppercase tracking-wider block">LIBRARIAN</span>
                </div>
              </Link>
            </div>
          </header>

          {/* MAIN WORKSPACE CONTENT VIEWPORT */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-4 flex flex-col min-h-0">
            <React.Suspense fallback={<div className="flex-1 flex items-center justify-center p-12"><div className="w-8 h-8 border-3 border-gold-500 border-t-transparent rounded-full animate-spin" /></div>}>
              <Outlet />
            </React.Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
