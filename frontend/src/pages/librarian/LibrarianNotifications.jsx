import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PAGE_MOTION_VARIANTS, BANNER_MOTION, LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';
import { 
  Bell, Inbox, ArrowLeftRight, CheckCircle2, 
  Trash2, RefreshCw, AlertCircle, Sparkles, ExternalLink, CreditCard, BookOpen, Users, Star
} from 'lucide-react';
import { useNotifications } from '../../hooks/queries/useNotifications';
import { useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../../hooks/queries/useNotificationMutations';
import PageHeader from '../../components/librarian/common/PageHeader';
import { ListSkeleton } from '../../components/librarian/common/Skeleton';
import { formatNotificationTime } from '../../utils/dateUtils';
import librarianService from '../../services/librarianService';

export default function LibrarianNotificationsPage() {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  // TanStack Query for reactive notifications state
  const { data: resData, isLoading: loading, isError, refetch: fetchNotifications } = useNotifications('librarian');
  const markAsReadMutation = useMarkNotificationAsRead('librarian', {
    onError: () => setSuccessMessage('Unable to update notification. Rollback applied.'),
  });
  const markAllAsReadMutation = useMarkAllNotificationsAsRead('librarian', {
    onSuccess: () => setSuccessMessage('All notifications marked as read.'),
  });

  const notifications = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : []);
  const error = isError ? 'Unable to load notifications. Please try again.' : null;

  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = async (id) => {
    try {
      await librarianService.deleteNotification(id);
      fetchNotifications();
    } catch {
      setSuccessMessage('Failed to delete notification.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await librarianService.clearAllNotifications();
      fetchNotifications();
      setSuccessMessage('All notifications cleared.');
    } catch {
      setSuccessMessage('Failed to clear notifications.');
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.read_at) handleMarkAsRead(n.id);

    if (n.data?.target_url) {
      navigate(n.data.target_url);
      return;
    }

    const title = (n.data?.title || n.title || '').toLowerCase();
    const message = (n.data?.message || n.message || '').toLowerCase();
    const type = (n.type || '').toLowerCase();

    if (
      title.includes('subscription') || 
      message.includes('subscription') || 
      type.includes('subscription') || 
      title.includes('premium') || 
      message.includes('premium')
    ) {
      navigate('/librarian/subscription');
    } else if (title.includes('return') || message.includes('return') || type.includes('return')) {
      navigate('/librarian/returns');
    } else if (title.includes('borrow') || message.includes('borrow') || title.includes('request') || message.includes('request')) {
      navigate('/librarian/borrow-requests');
    } else if (title.includes('rating') || title.includes('review') || message.includes('rating') || message.includes('review')) {
      navigate(title.includes('library') ? '/librarian/library' : '/librarian/books');
    } else if (title.includes('book') || message.includes('book')) {
      navigate('/librarian/books');
    } else if (title.includes('category') || message.includes('category')) {
      navigate('/librarian/categories');
    } else if (title.includes('member') || message.includes('member') || title.includes('user') || message.includes('user')) {
      navigate('/librarian/members');
    } else if (title.includes('library') || message.includes('library')) {
      navigate('/librarian/library');
    } else {
      navigate('/librarian/dashboard');
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read_at;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const getNotifIcon = (title = '', message = '') => {
    const text = (title + ' ' + message).toLowerCase();
    if (text.includes('rating') || text.includes('review') || text.includes('star')) {
      return <Star className="w-5 h-5 text-amber-500 fill-amber-400" />;
    }
    if (text.includes('subscription') || text.includes('premium')) {
      return <CreditCard className="w-5 h-5 text-amber-600" />;
    }
    if (text.includes('return')) {
      return <ArrowLeftRight className="w-5 h-5 text-indigo-600" />;
    }
    if (text.includes('borrow') || text.includes('request')) {
      return <Inbox className="w-5 h-5 text-emerald-600" />;
    }
    if (text.includes('member') || text.includes('user')) {
      return <Users className="w-5 h-5 text-blue-600" />;
    }
    if (text.includes('book')) {
      return <BookOpen className="w-5 h-5 text-amber-600" />;
    }
    return <Bell className="w-5 h-5 text-slate-600" />;
  };

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="w-full space-y-4 pb-12 overflow-y-auto">
      {/* Header */}
      <PageHeader
        eyebrow="Communication Hub"
        title="Notifications & Messages"
        description="Stay updated with borrow requests, return notices, and member activity in real time."
      />

      {/* Action Banner / Alerts */}
      <AnimatePresence>
        {successMessage && (
          <motion.div {...BANNER_MOTION} key="success-banner" className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold text-xs cursor-pointer">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div {...BANNER_MOTION} key="error-banner" className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => fetchNotifications(false)} className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toolbar & Filters */}
      <div className="bg-white border border-slate-200/90 p-3.5 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Messages ({notifications.length})
          </button>

          <button
            onClick={() => setFilter('unread')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'unread'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Unread Only</span>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-slate-950 text-amber-400 text-[10px] font-extrabold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Mark all read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear inbox</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List Viewport */}
      {loading ? (
        <ListSkeleton rows={4} className="mt-0" />
      ) : filteredNotifications.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center shadow-xs">
            <Bell className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No notifications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {filter === 'unread'
                ? "You've read all your messages! Check 'All Messages' tab to view past history."
                : 'There are no borrowing or return notifications in your inbox yet.'}
            </p>
          </div>
        </div>
      ) : (
        <motion.div variants={LIST_STAGGER} initial="initial" animate="animate" className="space-y-2.5">
          {filteredNotifications.map((notif) => {
            const isUnread = !notif.read_at;
            const data = notif.data || {};
            const title = data.title || notif.title || 'System Notification';
            const message = data.message || notif.message || 'No details provided.';
            const timeStr = formatNotificationTime(notif.created_at);

            return (
              <motion.div
                variants={LIST_ITEM}
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`group p-4 rounded-2xl border transition-all duration-200 flex items-start gap-4 cursor-pointer relative ${
                  isUnread
                    ? 'bg-amber-50/40 border-amber-300/80 shadow-2xs hover:bg-amber-50/70 hover:border-amber-400'
                    : 'bg-white border-slate-200/90 hover:bg-slate-50/80 hover:border-slate-300'
                }`}
              >
                {/* Icon Badge */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isUnread
                      ? 'bg-white border-amber-300 shadow-2xs'
                      : 'bg-slate-100 border-slate-200'
                  }`}
                >
                  {getNotifIcon(title, message)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-xs font-extrabold ${
                          isUnread ? 'text-amber-950' : 'text-slate-900'
                        }`}
                      >
                        {title}
                      </h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block shrink-0" />
                      )}
                    </div>

                    <span className="text-[10px] font-bold text-slate-400 shrink-0">
                      {timeStr}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {message}
                  </p>

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNotificationClick(notif);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer"
                    >
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Individual Action Buttons */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUnread && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif.id);
                      }}
                      title="Mark as read"
                      className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notif.id);
                    }}
                    title="Delete message"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
