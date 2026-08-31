import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, LogOut, Bookmark, Bell, User, Clock, Building2, Settings, Moon, Sun, LayoutDashboard, ShieldCheck } from 'lucide-react';
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
    { name: 'Home', path: '/' },
    { name: 'Libraries', path: '/libraries' },
    { name: 'Books', path: '/books' },
    { name: 'Categories', path: '/categories' },
    { name: 'For Librarians', path: '/become-librarian' },
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
              className="fixed inset-0 bg-navy-950/50 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="fixed top-0 right-0 h-[100dvh] w-[min(20rem,calc(100vw-1.25rem))] bg-white shadow-2xl z-[70] lg:hidden flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <span className="font-extrabold text-slate-800 text-sm">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="flex h-11 w-11 items-center justify-center text-slate-500 hover:text-slate-800 bg-slate-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-6 flex-1">
                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search books"
                     className="os-input h-12 pl-10"
                  />
                </form>

                {/* Nav Links */}
                <nav className="flex flex-col space-y-1.5">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 flex items-center h-12 rounded-xl text-sm font-medium ${
                        location.pathname === link.path
                          ? 'text-navy-800 bg-navy-50 font-bold'
                          : 'text-slate-600 hover:text-navy-800 hover:bg-navy-50'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>

                {/* Auth Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                  {isAuthenticated && user ? (
                    <>
                       <Link
                         to="/member/borrowings"
                         onClick={() => setMobileMenuOpen(false)}
                         className="os-btn-secondary px-4 flex items-center justify-start h-12 text-sm font-semibold"
                       >
                         My Borrowings
                       </Link>
                       <Link
                         to="/member/favorites"
                         onClick={() => setMobileMenuOpen(false)}
                         className="os-btn-secondary px-4 flex items-center justify-start h-12 text-sm font-semibold"
                       >
                         Favorites
                       </Link>
                       <Link
                         to="/member/notifications"
                         onClick={() => setMobileMenuOpen(false)}
                         className="os-btn-secondary px-4 flex items-center justify-between h-12 text-sm font-semibold"
                       >
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs">{unreadCount}</span>
                        )}
                      </Link>
                       <Link
                         to="/member/profile"
                         onClick={() => setMobileMenuOpen(false)}
                         className="os-btn-secondary px-4 flex items-center justify-start h-12 text-sm font-semibold"
                       >
                         My Profile
                       </Link>
                       <button
                         onClick={async () => {
                           setMobileMenuOpen(false);
                           await logout();
                           navigate('/login');
                         }}
                         className="os-btn-danger w-full h-12 font-bold text-sm mt-2"
                       >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center h-12 bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center h-12 bg-amber-500 text-slate-950 text-sm font-bold rounded-xl shadow-md"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
