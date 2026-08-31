import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Building2, BookOpen, Tag, Inbox, 
  ArrowLeftRight, Users, CreditCard, BarChart3, Bell, 
  LogOut, Menu, X, ChevronRight, UserCircle, ExternalLink 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import librarianService from '../services/librarianService';
import { formatNotificationTime } from '../utils/dateUtils';
import OpenShelfBrand from '../components/common/OpenShelfBrand';
import { SIDEBAR_SLIDE_VARIANTS, BACKDROP_MOTION_VARIANTS, DROPDOWN_MOTION_VARIANTS } from '../constants/motionTokens';
import { useNotifications } from '../hooks/queries/useNotifications';
import { useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../hooks/queries/useNotificationMutations';

const LIST_STAGGER_MOBILE = {
  animate: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
};

const LIST_ITEM_MOBILE = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
};

// Prefetch all librarian page chunks on layout mount so tab navigation is instant
const LIBRARIAN_CHUNKS = [
  () => import('../pages/librarian/Dashboard'),
  () => import('../pages/librarian/Library'),
  () => import('../pages/librarian/Books'),
  () => import('../pages/librarian/BookDetails'),
  () => import('../pages/librarian/Categories'),
  () => import('../pages/librarian/CategoryDetails'),
  () => import('../pages/librarian/BorrowRequests'),
  () => import('../pages/librarian/BorrowRequestDetails'),
  () => import('../pages/librarian/Returns'),
  () => import('../pages/librarian/ReturnDetails'),
  () => import('../pages/librarian/Members'),
  () => import('../pages/librarian/MemberDetails'),
  () => import('../pages/librarian/Subscription'),
  () => import('../pages/librarian/Reports'),
  () => import('../pages/librarian/LibrarianNotifications'),
  () => import('../pages/librarian/LibrarianProfile'),
];

export default function LibrarianLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const mainRef = useRef(null);

  // Reset scroll position on route change
  useLayoutEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [location.pathname]);

  // Isolate Librarian Workspace: do not inherit member night mode toggle
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

  // Prefetch all librarian route chunks in background after initial paint
  useEffect(() => {
    const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
    idle(() => { LIBRARIAN_CHUNKS.forEach((load) => load().catch(() => {})); });
  }, []);

  // TanStack Query for reactive notifications state across header, sidebar, and notification pages
  const { data: notifResData, refetch: fetchLibrarianNotifications } = useNotifications('librarian', Boolean(user));
  const markNotifReadMutation = useMarkNotificationAsRead('librarian');
  const markAllNotifsReadMutation = useMarkAllNotificationsAsRead('librarian');

  const notifications = Array.isArray(notifResData?.data) ? notifResData.data : (Array.isArray(notifResData) ? notifResData : []);
  const unreadCount = notifResData?.unread_count ?? notifications.filter((n) => !n.read_at && !n.is_read).length;

  const handleMarkNotifRead = (id) => {
    markNotifReadMutation.mutate(id);
  };

  const handleMarkAllNotifsRead = () => {
    markAllNotifsReadMutation.mutate();
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await librarianService.deleteNotification(id);
      fetchLibrarianNotifications();
    } catch {
      // non-critical
    }
  };

  const navSections = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/librarian', icon: LayoutDashboard },
        { name: 'My Library', path: '/librarian/library', icon: Building2 },
      ],
    },
    {
      title: 'Catalogue & Operations',
      items: [
        { name: 'Books', path: '/librarian/books', icon: BookOpen },
        { name: 'Categories', path: '/librarian/categories', icon: Tag },
        { name: 'Borrow Requests', path: '/librarian/borrow-requests', icon: Inbox },
        { name: 'Returns', path: '/librarian/returns', icon: ArrowLeftRight },
        { name: 'Members', path: '/librarian/members', icon: Users },
      ],
    },
    {
      title: 'Insights & Plan',
      items: [
        { name: 'Notifications', path: '/librarian/notifications', icon: Bell, badge: unreadCount },
        { name: 'Subscription', path: '/librarian/subscription', icon: CreditCard },
        { name: 'Reports', path: '/librarian/reports', icon: BarChart3 },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Flatten items for breadcrumb lookup
  const allNavItems = navSections.flatMap((s) => s.items);
  const sortedItems = [...allNavItems, { name: 'My Profile', path: '/librarian/profile', icon: UserCircle }].sort((a, b) => b.path.length - a.path.length);
  const currentNav = sortedItems.find((item) =>
    item.path === '/librarian'
      ? location.pathname === '/librarian'
      : location.pathname.startsWith(item.path)
  );
  const pageTitle = location.pathname === '/librarian/profile' ? 'My Profile' : (currentNav?.name || 'Workspace');

  return (
    <div className="h-screen w-full bg-slate-100 dark:bg-slate-950 flex overflow-hidden font-sans text-slate-900 dark:text-white antialiased selection:bg-amber-400 selection:text-slate-950">
      <div className="flex flex-1 w-full h-full relative overflow-hidden">
        {/* DESKTOP FIXED SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-slate-950 text-white border-r border-slate-800/90 shrink-0 select-none z-20 overflow-hidden shadow-2xl">
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-md">
            <Link to="/librarian" className="shrink-0 group">
              <OpenShelfBrand role="librarian" size="md" dark />
            </Link>
          </div>

          {/* Sidebar Navigation Links with Groupings */}
          <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto scrollbar-none min-h-0">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 pt-1 pb-1 text-[10px] font-black tracking-widest text-slate-500 uppercase flex items-center justify-between">
                  <span>{section.title}</span>
                </div>

                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path === '/librarian'
                    ? location.pathname === '/librarian'
                    : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
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

          {/* My Profile Link */}
          <div className="px-3 pb-2 shrink-0 border-t border-slate-800/80 pt-2 space-y-1">
            <Link
              to="/librarian/profile"
              className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                location.pathname === '/librarian/profile'
                  ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-l-4 border-amber-400 text-amber-300 font-extrabold shadow-sm translate-x-0.5'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06] hover:translate-x-0.5'
              }`}
            >
              <UserCircle className={`w-4 h-4 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110 ${
                location.pathname === '/librarian/profile'
                  ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                  : 'text-slate-400 group-hover:text-amber-400'
              }`} />
              <span className="flex-1">My Profile</span>
            </Link>
          </div>

          {/* Sidebar Footer User Card */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950 shrink-0">
            <div className="group flex items-center gap-3 p-2.5 bg-gradient-to-r from-slate-900/90 to-slate-950/90 border border-slate-800 rounded-2xl transition-all duration-200 hover:border-slate-700 shadow-md">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center overflow-hidden border border-amber-300/30 shadow-xs">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : 'L'
                  )}
                </div>
                {/* Active pulse status dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition-colors duration-200">
                  {user?.name || 'Librarian'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block text-[9px] uppercase tracking-widest font-black text-amber-400">
                    {user?.role || 'LIBRARIAN'}
                  </span>
                </div>
              </div>

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
                  <Link to="/librarian" onClick={() => setMobileSidebarOpen(false)} className="shrink-0">
                    <OpenShelfBrand role="librarian" size="md" dark />
                  </Link>

                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 px-4 py-5 space-y-4 overflow-y-auto">
                  <motion.div variants={LIST_STAGGER_MOBILE} initial="initial" animate="animate" className="space-y-4">
                    {navSections.map((section) => (
                      <div key={section.title} className="space-y-1">
                        <div className="px-3 pt-1 pb-1 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                          {section.title}
                        </div>

                        {section.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = item.path === '/librarian'
                            ? location.pathname === '/librarian'
                            : location.pathname.startsWith(item.path);

                          return (
                            <motion.div variants={LIST_ITEM_MOBILE} key={item.name}>
                              <Link
                                to={item.path}
                                onClick={() => setMobileSidebarOpen(false)}
                                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ease-out ${
                                  isActive
                                    ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-l-4 border-amber-400 text-amber-300 font-black shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                                }`}
                              >
                                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]' : 'text-slate-400 group-hover:text-amber-400'}`} />
                                <span className="flex-1">{item.name}</span>
                                {item.badge > 0 && (
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-amber-500/90 text-slate-950'}`}>
                                    {item.badge > 99 ? '99+' : item.badge}
                                  </span>
                                )}
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                  </motion.div>
                </nav>

                {/* Mobile My Profile Link */}
                <div className="px-4 pb-2 border-t border-slate-800/80 pt-2">
                  <Link
                    to="/librarian/profile"
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ease-out ${
                      location.pathname === '/librarian/profile'
                        ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-l-4 border-amber-400 text-amber-300 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <UserCircle className={`w-4 h-4 shrink-0 ${location.pathname === '/librarian/profile' ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]' : 'text-slate-400 group-hover:text-amber-400'}`} />
                    <span>My Profile</span>
                  </Link>
                </div>

                <div className="p-4 border-t border-slate-800/80 bg-slate-950">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold text-xs rounded-xl transition-all cursor-pointer"
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
        <div className="flex-1 flex flex-col min-w-0 bg-[#F7FAFD] dark:bg-slate-950 overflow-hidden">
          {/* LIBRARIAN TOP HEADER */}
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0 shadow-xs z-10">
            {/* Left Header Info + Mobile Menu Trigger */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Toggle Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 truncate">
                <span className="hidden sm:inline text-slate-700 dark:text-slate-300 font-extrabold">Librarian Workspace</span>
                <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-400" />
                <span className="text-amber-600 dark:text-amber-400 font-black truncate">{pageTitle}</span>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {/* Shortcut: Live Preview Own Public Library (Option 1) */}
              <Link
                to={user?.library?.id || user?.library_id ? `/libraries/${user?.library?.id || user?.library_id}` : '/libraries'}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200/80 transition-all cursor-pointer group"
                title={user?.library?.id || user?.library_id ? `Live Preview: ${user?.library?.name || 'Your Library'}` : 'Browse Public Libraries'}
              >
                <Building2 className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                <span>Public View</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
              </Link>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => {
                    const next = !notifDropdownOpen;
                    setNotifDropdownOpen(next);
                    if (next) fetchLibrarianNotifications();
                  }}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors relative cursor-pointer"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center shadow-2xs">
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
                    className="absolute right-0 mt-2 w-[calc(100vw-24px)] md:w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 space-y-2 text-xs"
                    onMouseLeave={() => setNotifDropdownOpen(false)}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 px-1">
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllNotifsRead}
                          className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
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
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1">
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
                                isUnread ? 'bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/60 dark:hover:bg-amber-950/60' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                              }`}
                            >
                              <div className="min-w-0 space-y-0.5 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`font-extrabold text-xs truncate ${isUnread ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                                    {title}
                                  </span>
                                  <span className="text-[9px] text-slate-400 shrink-0">
                                    {formatNotificationTime(n.created_at)}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">{message}</p>
                              </div>

                              <button
                                onClick={(e) => handleDeleteNotif(e, n.id)}
                                title="Delete"
                                className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                      <Link
                        to="/librarian/notifications"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 hover:underline block py-1"
                      >
                        View All Notifications & Messages →
                      </Link>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>

              {/* Header User Identity Pill - Clickable to Profile */}
              <Link to="/librarian/profile" className="flex items-center gap-2.5 pl-2 border-l border-slate-200/80 dark:border-slate-800 hover:opacity-85 transition-opacity">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center overflow-hidden shrink-0 border border-amber-300/40 shadow-xs">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name[0].toUpperCase() : 'L'
                  )}
                </div>

                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">{user?.name || 'Librarian'}</p>
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block">LIBRARIAN</span>
                </div>
              </Link>
            </div>
          </header>

          {/* MAIN WORKSPACE CONTENT VIEWPORT */}
          <main ref={mainRef} className="flex-1 overflow-y-auto scrollbar-none p-2.5 lg:p-4 flex flex-col min-h-0 h-full w-full">
            <React.Suspense fallback={<div className="flex-1 flex items-center justify-center p-12"><div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}>
              <Outlet />
            </React.Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
