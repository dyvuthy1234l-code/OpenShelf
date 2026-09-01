import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, LogOut, Bookmark, Bell, User, Clock, Building2, Settings, Moon, Sun, LayoutDashboard, ShieldCheck, Home, BookOpen, Layers, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import OpenShelfBrand from '../common/OpenShelfBrand';
import { getAvatarUrl } from '../../utils/imageUrl';
import { useNotifications } from '../../hooks/queries/useNotifications';
import { DROPDOWN_MOTION_VARIANTS, BACKDROP_MOTION_VARIANTS } from '../../constants/motionTokens';

import SearchModal from './SearchModal';
import SettingsDrawer from './SettingsDrawer';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Shared TanStack Query for notifications (Updates instantly on optimistic mutations)
  const isMember = isAuthenticated && user?.role === 'member';
  const { data: notifData } = useNotifications('member', isMember);

  const notifList = Array.isArray(notifData?.data) ? notifData.data : (Array.isArray(notifData) ? notifData : []);
  const unreadCount = notifData?.unread_count ?? notifList.filter((n) => !n.read_at && !n.is_read).length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Libraries', path: '/libraries', icon: Building2 },
    { name: 'Books', path: '/books', icon: BookOpen },
    { name: 'Categories', path: '/categories', icon: Layers },
    { name: 'For Librarians', path: '/become-librarian', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-brand-border dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo */}
          <Link to="/" className="shrink-0">
            <OpenShelfBrand role="member" size="sm" />
          </Link>

          {/* Combined Navigation Links & Right Actions - Grouped close together */}
          <div className="hidden md:flex items-center gap-4 lg:gap-5 xl:gap-6">
            {/* Desktop Navigation Links (positioned right next to Search) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const isForLibrarians = link.name === 'For Librarians';

                if (isForLibrarians) {
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className="relative overflow-hidden px-3.5 py-1.5 rounded-xl text-sm font-extrabold text-sky-950 bg-sky-100/90 hover:bg-sky-200/90 border border-sky-300/80 shadow-2xs transition-all duration-300 flex items-center group cursor-pointer"
                    >
                      {/* Shimmering light beam sweeping top-to-bottom back and forth */}
                      <motion.div
                        animate={{ x: ['-120%', '220%'], y: ['-120%', '220%'] }}
                        transition={{ repeat: Infinity, repeatType: 'reverse', duration: 2.2, ease: 'easeInOut' }}
                        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/85 to-transparent -rotate-45 pointer-events-none"
                      />
                      <span className="relative z-10">{link.name}</span>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-navy-800 bg-navy-50 font-extrabold border border-brand-border'
                        : 'text-slate-500 hover:text-navy-800 hover:bg-navy-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Search + Member Shortcuts + User Avatar */}
            <div className="flex items-center gap-2 lg:gap-2.5">
              {/* Search Input Trigger */}
              <button
                onClick={() => setSearchModalOpen(true)}
                aria-label="Search books and authors"
                className="relative w-11 lg:w-44 xl:w-52 h-11 lg:h-9 flex items-center justify-center lg:justify-start bg-slate-100/80 hover:bg-amber-50 border border-slate-200/80 hover:border-amber-400 rounded-xl lg:pl-3 lg:pr-2 text-left transition-all shadow-2xs cursor-pointer"
              >
                <Search className="w-4 h-4 text-slate-500 lg:mr-2 shrink-0" />
                <span className="hidden lg:block text-xs font-semibold text-slate-500 flex-1 truncate">Search books or authors...</span>
                <div className="hidden xl:flex items-center gap-0.5 opacity-70 shrink-0">
                  <kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9px] font-sans font-bold text-slate-600 shadow-2xs">⌘K</kbd>
                </div>
              </button>
              <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  {/* Staff Workspace Direct Shortcut Button */}
                  {user?.role === 'librarian' && (
                    <Link
                      to="/librarian"
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-xs font-black shadow-2xs hover:from-amber-400 hover:to-amber-300 transition-all cursor-pointer"
                      title="Open Librarian Workspace"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Workspace</span>
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 dark:bg-slate-800 text-white text-xs font-black shadow-2xs hover:bg-slate-800 transition-all cursor-pointer"
                      title="Open Admin Portal"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Admin</span>
                    </Link>
                  )}

                  {/* Favorites Shortcut Icon */}
                  <Link
                    to="/member/favorites"
                    title="My Favorites"
                    className="flex h-11 w-11 items-center justify-center text-slate-600 hover:text-amber-600 bg-slate-100/80 hover:bg-amber-50 rounded-xl border border-slate-200/80 transition-colors lg:h-9 lg:w-9"
                  >
                    <Bookmark className="w-4 h-4" />
                  </Link>

                  {/* Notifications Bell Icon */}
                  <Link
                    to="/member/notifications"
                    title="Notifications"
                    className="relative flex h-11 w-11 items-center justify-center text-slate-600 hover:text-amber-600 bg-slate-100/80 hover:bg-amber-50 rounded-xl border border-slate-200/80 transition-colors lg:h-9 lg:w-9"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Profile Avatar -> Enlarged Fully Rounded Circular Avatar */}
                  <Link
                    to={`/${user?.role || 'member'}/profile`}
                    title={user.name || 'My Profile'}
                    className="w-11 h-11 lg:w-10 lg:h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-base overflow-hidden shrink-0 border-2 border-slate-200 hover:border-amber-500 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {getAvatarUrl(user.avatar_url || user.avatar, 120) ? (
                      <img
                        src={getAvatarUrl(user.avatar_url || user.avatar, 120)}
                        alt={user.name}
                        loading="eager"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      user.name ? user.name[0].toUpperCase() : 'U'
                    )}
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="os-btn-ghost px-3 lg:px-4 text-xs font-semibold whitespace-nowrap"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="os-btn-primary px-3 lg:px-4 py-1.5 text-xs font-bold whitespace-nowrap"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Settings Cog Icon Button placed AFTER user avatar with Floating Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSettingsOpen(!settingsOpen)}
                title="Settings & Menu"
                aria-label="Open settings menu"
                className="flex h-11 w-11 lg:h-10 lg:w-10 items-center justify-center text-slate-600 hover:text-amber-600 bg-slate-100/80 hover:bg-amber-50 rounded-xl border border-slate-200/80 transition-colors shrink-0 cursor-pointer group"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                  className="flex items-center justify-center"
                >
                  <Settings className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence>
                {settingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: -6 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 28 }}
                    style={{ transformOrigin: 'top right' }}
                    className="absolute right-0 mt-2.5 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-2xl shadow-slate-900/10 p-2.5 z-50 overflow-hidden"
                    onMouseLeave={() => setSettingsOpen(false)}
                  >
                    {/* Top Accent Gold Bar */}
                    <div className="h-0.5 -mx-2.5 -mt-2.5 mb-2 bg-gradient-to-r from-amber-400 via-gold-500 to-amber-400" />

                    {isAuthenticated && user ? (
                      <>
                        {user?.role === 'librarian' && (
                          <Link
                            to="/librarian"
                            onClick={() => setSettingsOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-extrabold text-amber-700 hover:bg-amber-50 rounded-xl transition-all duration-200 group"
                          >
                            <LayoutDashboard className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                            <span>Librarian Workspace</span>
                          </Link>
                        )}

                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setSettingsOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-extrabold text-navy-800 hover:bg-slate-100 rounded-xl transition-all duration-200 group"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                            <span>Admin Portal</span>
                          </Link>
                        )}

                        <Link
                          to="/member/borrowings"
                          onClick={() => setSettingsOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-extrabold text-navy-800 hover:text-gold-600 hover:bg-amber-50/80 rounded-xl transition-all duration-200 group"
                        >
                          <Clock className="w-4 h-4 text-gold-600 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                          <span>My Borrowings</span>
                        </Link>

                        <Link
                          to="/member/favorites"
                          onClick={() => setSettingsOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-extrabold text-navy-800 hover:text-gold-600 hover:bg-amber-50/80 rounded-xl transition-all duration-200 group"
                        >
                          <Bookmark className="w-4 h-4 text-gold-600 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                          <span>Saved Favorites</span>
                        </Link>

                        <Link
                          to="/member/notifications"
                          onClick={() => setSettingsOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-extrabold text-navy-800 hover:text-gold-600 hover:bg-amber-50/80 rounded-xl transition-all duration-200 group"
                        >
                          <Bell className="w-4 h-4 text-gold-600 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                          <span>Notifications</span>
                        </Link>

                        <Link
                          to={`/${user?.role || 'member'}/profile`}
                          onClick={() => setSettingsOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-extrabold text-navy-800 hover:text-gold-600 hover:bg-amber-50/80 rounded-xl transition-all duration-200 group"
                        >
                          <User className="w-4 h-4 text-gold-600 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                          <span>My Profile</span>
                        </Link>

                        {/* Night Mode Switch Option */}
                        <button
                          type="button"
                          onClick={toggleDarkMode}
                          className="flex items-center justify-between w-full px-3.5 py-2.5 text-xs font-extrabold text-navy-800 hover:text-gold-600 hover:bg-amber-50/80 rounded-xl transition-all duration-200 group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            {darkMode ? (
                              <Sun className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                            ) : (
                              <Moon className="w-4 h-4 text-gold-600 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                            )}
                            <span>{darkMode ? 'Light Mode' : 'Night Mode'}</span>
                          </div>
                          
                          {/* Toggle Switch */}
                          <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${darkMode ? 'bg-amber-500' : 'bg-slate-300'}`}>
                            <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${darkMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
                          </div>
                        </button>

                        <div className="my-1.5 border-t border-slate-100" />

                        <button
                          onClick={async () => {
                            setSettingsOpen(false);
                            await logout();
                            navigate('/login');
                          }}
                          className="flex items-center gap-3 w-full text-left px-3.5 py-2.5 text-xs font-extrabold text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 group cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <div className="p-1 space-y-1">
                        <Link
                          to="/login"
                          onClick={() => setSettingsOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-extrabold text-navy-800 hover:text-gold-600 hover:bg-amber-50/80 rounded-xl transition-all duration-200 group"
                        >
                          <User className="w-4 h-4 text-gold-600 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                          <span>Sign In</span>
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setSettingsOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-extrabold text-navy-800 hover:text-gold-600 hover:bg-amber-50/80 rounded-xl transition-all duration-200 group"
                        >
                          <Bookmark className="w-4 h-4 text-gold-600 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                          <span>Register</span>
                        </Link>

                        <div className="my-1 border-t border-slate-100" />

                        <button
                          type="button"
                          onClick={toggleDarkMode}
                          className="flex items-center justify-between w-full px-3.5 py-2.5 text-xs font-extrabold text-navy-800 hover:text-gold-600 hover:bg-amber-50/80 rounded-xl transition-all duration-200 group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            {darkMode ? (
                              <Sun className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                            ) : (
                              <Moon className="w-4 h-4 text-gold-600 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                            )}
                            <span>{darkMode ? 'Light Mode' : 'Night Mode'}</span>
                          </div>
                          
                          <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${darkMode ? 'bg-amber-500' : 'bg-slate-300'}`}>
                            <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${darkMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
                          </div>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
               className="os-btn-secondary h-11 w-11 px-0 items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              {...BACKDROP_MOTION_VARIANTS}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[80] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed top-0 right-0 h-[100dvh] w-[86vw] max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200/90 dark:border-slate-800 shadow-2xl z-[90] lg:hidden flex flex-col justify-between overflow-y-auto"
            >
              {/* Top Header */}
              <div>
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/60 backdrop-blur-md">
                  {isAuthenticated && user ? (
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-md shadow-amber-500/20 overflow-hidden shrink-0 ring-2 ring-amber-400/40">
                        {getAvatarUrl(user.avatar_url || user.avatar) ? (
                          <img
                            src={getAvatarUrl(user.avatar_url || user.avatar)}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{user.name ? user.name[0].toUpperCase() : 'U'}</span>
                        )}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white truncate leading-tight tracking-tight">
                          {user.name}
                        </h4>
                        {user.email && (
                          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate leading-none">
                            {user.email}
                          </p>
                        )}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/15 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <OpenShelfBrand role="member" size="sm" />
                  )}

                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close navigation menu"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all cursor-pointer shrink-0 shadow-2xs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content body */}
                <div className="p-4 sm:p-5 space-y-5">
                  {/* Search bar inside mobile menu */}
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search catalogue, libraries, authors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Search books"
                      className="w-full h-11 pl-10 pr-4 text-xs font-semibold bg-slate-100 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all shadow-2xs"
                    />
                  </form>

                  {/* Explore & Directory Section (Distinct from Bottom Nav) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3">
                      Explore OpenShelf
                    </span>
                    <nav className="space-y-1 pt-1">
                      <Link
                        to="/libraries"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                          location.pathname.startsWith('/libraries')
                            ? 'bg-amber-500/12 dark:bg-amber-400/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/30 font-black shadow-2xs'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <Building2 className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${location.pathname.startsWith('/libraries') ? 'text-amber-600 dark:text-amber-400' : 'text-amber-500'}`} />
                        <span className="flex-1">Partner Libraries</span>
                      </Link>

                      <Link
                        to="/categories"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                          location.pathname.startsWith('/categories')
                            ? 'bg-amber-500/12 dark:bg-amber-400/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/30 font-black shadow-2xs'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <Layers className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${location.pathname.startsWith('/categories') ? 'text-amber-600 dark:text-amber-400' : 'text-amber-500'}`} />
                        <span className="flex-1">Book Categories</span>
                      </Link>

                      {isAuthenticated && user?.role === 'member' && (
                        <Link
                          to="/member/favorites"
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                            location.pathname.startsWith('/member/favorites')
                              ? 'bg-amber-500/12 dark:bg-amber-400/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/30 font-black shadow-2xs'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                        }`}
                        >
                          <Bookmark className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${location.pathname.startsWith('/member/favorites') ? 'text-amber-600 dark:text-amber-400' : 'text-amber-500'}`} />
                          <span className="flex-1">Saved Wishlist</span>
                        </Link>
                      )}

                      <Link
                        to="/become-librarian"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                          location.pathname.startsWith('/become-librarian')
                            ? 'bg-amber-500/12 dark:bg-amber-400/15 text-amber-900 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/30 font-black shadow-2xs'
                            : 'text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40'
                        }`}
                      >
                        <Sparkles className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${location.pathname.startsWith('/become-librarian') ? 'text-amber-600 dark:text-amber-400' : 'text-sky-500'}`} />
                        <span className="flex-1">For Librarians</span>
                      </Link>
                    </nav>
                  </div>

                  {/* Special Workspaces (For Librarian / Admin) */}
                  {isAuthenticated && (user?.role === 'librarian' || user?.role === 'admin') && (
                    <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-3">
                        Staff Workspaces
                      </span>
                      <div className="space-y-1 pt-1">
                        {user?.role === 'librarian' && (
                          <Link
                            to="/librarian"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all"
                          >
                            <LayoutDashboard className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="flex-1">Librarian Workspace</span>
                          </Link>
                        )}

                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-200 dark:hover:bg-slate-750 transition-all"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                            <span className="flex-1">Admin Portal</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Guest Login/Register Buttons */}
                  {!isAuthenticated && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center h-10 bg-gradient-to-r from-amber-400 via-gold-500 to-amber-500 hover:brightness-105 text-navy-950 text-xs font-black rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                      >
                        Get Started Free
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Footer: Dark Mode Toggle & Logout */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 space-y-2.5 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                {/* Dark Mode Switcher */}
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="flex items-center justify-between w-full px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {darkMode ? (
                      <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
                  </div>
                  
                  <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${darkMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${darkMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
                  </div>
                </button>

                {/* Sign Out Button */}
                {isAuthenticated && (
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                      navigate('/login');
                    }}
                    className="flex items-center justify-center gap-2 w-full h-10 font-bold text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all border border-rose-200/80 dark:border-rose-900/40 cursor-pointer shadow-2xs"
                  >
                    <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
