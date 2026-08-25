import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, LogOut, Bookmark, Bell, User, Clock, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import OpenShelfBrand from '../common/OpenShelfBrand';
import getImageUrl, { getAvatarUrl } from '../../utils/imageUrl';
import { useNotifications } from '../../hooks/queries/useNotifications';

import SearchModal from './SearchModal';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchModalOpen, setSearchModalOpen] = useState(false);

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
    ...(!isAuthenticated ? [{ name: 'For Librarians', path: '/become-librarian' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#DCE6F0] shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo */}
          <Link to="/" className="shrink-0">
            <OpenShelfBrand role="member" size="sm" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-[#123A63] bg-[#F5F8FC] font-extrabold border border-[#DCE6F0]'
                      : 'text-[#64748B] hover:text-[#102A43] hover:bg-[#F5F8FC]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Side: Search + Member Shortcuts / Guest Auth */}
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-3.5">
            {/* Search Input Trigger */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="relative w-48 xl:w-56 h-12 md:h-9 flex items-center bg-[#F5F8FC] hover:bg-[#E2E8F0] border border-[#DCE6F0] hover:border-[#CBD5E1] rounded-xl pl-3 pr-2 text-left transition-all"
            >
              <Search className="w-4 h-4 text-[#94A3B8] mr-2 shrink-0" />
              <span className="text-xs text-[#94A3B8] flex-1">Search...</span>
              <div className="hidden md:flex items-center gap-0.5 opacity-60">
                <kbd className="bg-slate-200 border border-slate-300 rounded px-1 text-[9px] font-sans font-bold text-slate-500 shadow-sm">⌘</kbd>
                <kbd className="bg-slate-200 border border-slate-300 rounded px-1 text-[9px] font-sans font-bold text-slate-500 shadow-sm">K</kbd>
              </div>
            </button>
            <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {/* Favorites Shortcut Icon */}
                <Link
                  to="/member/favorites"
                  title="My Favorites"
                  className="p-2 text-slate-600 hover:text-amber-600 bg-slate-100/80 hover:bg-amber-50 rounded-xl border border-slate-200/80 transition-colors"
                >
                  <Bookmark className="w-4 h-4" />
                </Link>

                {/* Notifications Bell Icon */}
                <Link
                  to="/member/notifications"
                  title="Notifications"
                  className="relative p-2 text-slate-600 hover:text-amber-600 bg-slate-100/80 hover:bg-amber-50 rounded-xl border border-slate-200/80 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 pr-2.5 bg-slate-100/80 border border-slate-200 hover:border-amber-500/50 rounded-xl transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
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
                    </div>
                    <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                      {user.name}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-3 py-2 border-b border-slate-100 mb-1 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
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
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                          <span className="inline-block text-[10px] uppercase tracking-wider font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-0.5 border border-amber-200/60">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      {user.role === 'librarian' && (
                        <Link
                          to="/librarian"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors font-bold my-1 border border-amber-200"
                        >
                          <Building2 className="w-4 h-4 text-amber-600" />
                          Librarian Portal
                        </Link>
                      )}

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors font-bold my-1 border border-amber-200"
                        >
                          <Building2 className="w-4 h-4 text-amber-600" />
                          Admin Portal
                        </Link>
                      )}

                      {user.role === 'member' && (
                        <>
                          <Link
                            to="/member/borrowings"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors font-medium"
                          >
                            <Clock className="w-4 h-4 text-amber-600" />
                            My Borrowings
                          </Link>

                          <Link
                            to="/member/favorites"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors font-medium"
                          >
                            <Bookmark className="w-4 h-4 text-amber-600" />
                            Saved Favorites
                          </Link>

                          <Link
                            to="/member/notifications"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors font-medium"
                          >
                            <Bell className="w-4 h-4 text-amber-600" />
                            Notifications
                          </Link>
                        </>
                      )}

                      <Link
                        to={`/${user?.role || 'member'}/profile`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors font-medium"
                      >
                        <User className="w-4 h-4 text-amber-600" />
                        My Profile
                      </Link>

                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await logout();
                          navigate('/login');
                        }}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium border-t border-slate-100 mt-1 pt-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-slate-700 hover:text-slate-900 bg-slate-100 rounded-xl border border-slate-200"
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-[70] md:hidden flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <span className="font-extrabold text-slate-800 text-sm">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-full"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl h-12 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500"
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
                          ? 'text-amber-700 bg-amber-50 font-bold'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
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
                        className="px-4 flex items-center h-12 bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200"
                      >
                        My Borrowings
                      </Link>
                      <Link
                        to="/member/favorites"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 flex items-center h-12 bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200"
                      >
                        Favorites
                      </Link>
                      <Link
                        to="/member/notifications"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 flex items-center justify-between h-12 bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200"
                      >
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs">{unreadCount}</span>
                        )}
                      </Link>
                      <Link
                        to="/member/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 flex items-center h-12 bg-slate-50 text-slate-800 text-sm font-semibold rounded-xl border border-slate-200"
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={async () => {
                          setMobileMenuOpen(false);
                          await logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center justify-center h-12 bg-rose-50 text-rose-600 font-bold text-sm rounded-xl border border-rose-200 mt-2"
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
