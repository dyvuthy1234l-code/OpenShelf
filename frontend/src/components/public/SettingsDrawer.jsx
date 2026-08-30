import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Bookmark, Bell, User, LogOut, Moon, Sun, Maximize2, Minimize2, RotateCcw, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getAvatarUrl } from '../../utils/imageUrl';

export default function SettingsDrawer({ isOpen, onClose }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { darkMode, toggleDarkMode, compactView, toggleCompactView } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-slate-950/40 backdrop-blur-xs"
          />

          {/* Slide-over / Settings Menu Panel from Right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 z-[100] w-full max-w-sm bg-white dark:bg-[#121926] text-slate-900 dark:text-white shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0F1622]">
              <h2 className="text-base font-extrabold tracking-tight text-navy-800 dark:text-white flex items-center gap-2">
                <span>Menu & Settings</span>
              </h2>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  title="Refresh page"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-navy-800 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  title="Close settings"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-navy-800 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body / Member Actions & Settings */}
            <div className="p-5 space-y-5 flex-1 overflow-y-auto">
              {/* Logged-in User Profile Summary */}
              {isAuthenticated && user && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1A2332] border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-base overflow-hidden shrink-0 shadow-2xs">
                    {getAvatarUrl(user.avatar_url || user.avatar, 120) ? (
                      <img
                        src={getAvatarUrl(user.avatar_url || user.avatar, 120)}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name ? user.name[0].toUpperCase() : 'U'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-extrabold text-navy-800 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block text-[10px] uppercase tracking-wider font-extrabold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded mt-0.5 border border-amber-200/60 dark:border-amber-500/30">
                      {user.role}
                    </span>
                  </div>
                </div>
              )}

              {/* Member Quick Links matching Screenshot 1 */}
              {isAuthenticated && user ? (
                <div className="space-y-1 bg-white dark:bg-transparent rounded-2xl border border-slate-100 dark:border-slate-800/80 p-2 shadow-2xs">
                  {user.role === 'member' && (
                    <>
                      {/* My Borrowings */}
                      <Link
                        to="/member/borrowings"
                        onClick={onClose}
                        className="flex items-center gap-3.5 px-3.5 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-navy-800 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                      >
                        <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                        <span>My Borrowings</span>
                      </Link>

                      {/* Saved Favorites */}
                      <Link
                        to="/member/favorites"
                        onClick={onClose}
                        className="flex items-center gap-3.5 px-3.5 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-navy-800 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                      >
                        <Bookmark className="w-5 h-5 text-amber-500 shrink-0" />
                        <span>Saved Favorites</span>
                      </Link>

                      {/* Notifications */}
                      <Link
                        to="/member/notifications"
                        onClick={onClose}
                        className="flex items-center gap-3.5 px-3.5 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-navy-800 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                      >
                        <Bell className="w-5 h-5 text-amber-500 shrink-0" />
                        <span>Notifications</span>
                      </Link>
                    </>
                  )}

                  {/* My Profile */}
                  <Link
                    to={`/${user?.role || 'member'}/profile`}
                    onClick={onClose}
                    className="flex items-center gap-3.5 px-3.5 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-navy-800 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
                  >
                    <User className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>My Profile</span>
                  </Link>

                  {/* Librarian / Admin Portal */}
                  {user.role === 'librarian' && (
                    <Link
                      to="/librarian"
                      onClick={onClose}
                      className="flex items-center gap-3.5 px-3.5 py-3 text-sm font-bold text-amber-700 bg-amber-50 dark:bg-amber-500/10 rounded-xl transition-colors border border-amber-200 dark:border-amber-500/30"
                    >
                      <Building2 className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>Librarian Portal</span>
                    </Link>
                  )}

                  {/* Sign Out */}
                  <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3.5 px-3.5 py-3 text-sm font-extrabold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-5 h-5 text-rose-500 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Guest Auth Actions */
                <div className="p-4 bg-slate-50 dark:bg-[#1A2332] rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-center space-y-3">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">Welcome to OpenShelf</p>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      onClick={onClose}
                      className="flex-1 py-2 px-3 text-xs font-extrabold text-navy-800 bg-white border border-slate-200 rounded-xl shadow-2xs text-center"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={onClose}
                      className="flex-1 py-2 px-3 text-xs font-extrabold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl text-center shadow-2xs"
                    >
                      Register
                    </Link>
                  </div>
                </div>
              )}

              {/* Preferences Section: Dark Mode & Compact View */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">Display Preferences</p>

                {/* Dark Mode Toggle Card */}
                <div className="bg-slate-50 dark:bg-[#1A2332] border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-amber-500">
                      {darkMode ? <Moon className="w-4 h-4 fill-amber-400/20" /> : <Sun className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-xs font-extrabold block text-navy-800 dark:text-white">Dark mode</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Switch color theme</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleDarkMode}
                    aria-label="Toggle dark mode"
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                      darkMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <motion.span
                      animate={{ x: darkMode ? 22 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="inline-block w-5 h-5 rounded-full bg-white shadow-md transform"
                    />
                  </button>
                </div>

                {/* Compact View Toggle Card */}
                <div className="bg-slate-50 dark:bg-[#1A2332] border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-amber-500">
                      {compactView ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="text-xs font-extrabold block text-navy-800 dark:text-white">Compact</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Layout density</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleCompactView}
                    aria-label="Toggle compact view"
                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out cursor-pointer ${
                      compactView ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <motion.span
                      animate={{ x: compactView ? 22 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="inline-block w-5 h-5 rounded-full bg-white shadow-md transform"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-400 font-semibold">
              OpenShelf Network Preferences
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
