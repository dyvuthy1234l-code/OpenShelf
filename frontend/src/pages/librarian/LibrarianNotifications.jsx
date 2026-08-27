import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PAGE_MOTION_VARIANTS } from '../../constants/motionTokens';
import { 
  Bell, Inbox, ArrowLeftRight, CheckCircle2, 
  Trash2, RefreshCw, AlertCircle, Sparkles, ExternalLink 
} from 'lucide-react';
import { useNotifications } from '../../hooks/queries/useNotifications';
import { useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../../hooks/queries/useNotificationMutations';
import PageHeader from '../../components/librarian/common/PageHeader';
import { formatNotificationTime } from '../../utils/dateUtils';
import librarianService from '../../services/librarianService';

export default function LibrarianNotificationsPage() {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  // TanStack Query with Optimistic UI updates
  const { data: resData, isLoading: loading, isError, refetch: fetchNotifications } = useNotifications('librarian');
  const markReadMutation = useMarkNotificationAsRead('librarian');
  const markAllReadMutation = useMarkAllNotificationsAsRead('librarian');

  const notifications = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : []);
  const error = isError ? 'Unable to load notifications. Please try again.' : null;

  const handleMarkAsRead = (id) => {
    markReadMutation.mutate(id, {
      onSuccess: () => setSuccessMessage('Notification marked as read.'),
      onError: () => setSuccessMessage('Unable to update notification. Rollback applied.'),
    });
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate(undefined, {
      onSuccess: () => setSuccessMessage('All notifications marked as read.'),
      onError: () => setSuccessMessage('Unable to mark all as read. Rollback applied.'),
    });
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await librarianService.deleteNotification(id);
      fetchNotifications();
    } catch {
      // Non-critical
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await librarianService.clearAllNotifications();
      fetchNotifications();
      setSuccessMessage('All notifications cleared.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch {
      setSuccessMessage('Failed to clear notifications.');
    }
  };

  const handleNavigateToTarget = (notif) => {
    if (!notif.read_at) {
      handleMarkAsRead(notif.id);
    }
    const data = notif.data || {};
    const title = (data.title || '').toLowerCase();
    const message = (data.message || '').toLowerCase();

    if (title.includes('return') || message.includes('return')) {
      navigate('/librarian/returns');
    } else if (title.includes('borrow') || message.includes('borrow') || title.includes('request')) {
      navigate('/librarian/borrow-requests');
    } else {
      // stay or default to dashboard
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read_at;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const getNotifIcon = (title = '', message = '') => {
    const text = (title + ' ' + message).toLowerCase();
    if (text.includes('return')) {
      return <ArrowLeftRight className="w-5 h-5 text-indigo-600" />;
    }
    if (text.includes('borrow') || text.includes('request')) {
      return <Inbox className="w-5 h-5 text-amber-600" />;
    }
    return <Bell className="w-5 h-5 text-slate-600" />;
  };

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="flex-1 flex flex-col justify-between min-h-0 space-y-4 overflow-y-auto lg:overflow-hidden h-full max-w-5xl mx-auto w-full">
      {/* Header */}
      <PageHeader
        eyebrow="Communication Hub"
        title="Notifications & Messages"
        description="Stay updated with borrow requests, return notices, and member activity in real time."
      />

      {/* Action Banner / Alerts */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold text-xs">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => fetchNotifications(false)} className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

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
        <div className="flex-1 space-y-3 animate-pulse">
          <div className="h-24 bg-white rounded-2xl border border-slate-200" />
          <div className="h-24 bg-white rounded-2xl border border-slate-200" />
          <div className="h-24 bg-white rounded-2xl border border-slate-200" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="flex-1 bg-white border border-slate-200/90 rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
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
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredNotifications.map((notif) => {
            const isUnread = !notif.read_at;
            const data = notif.data || {};
            const title = data.title || 'System Notification';
            const message = data.message || 'No details provided.';
            const timeStr = formatNotificationTime(notif.created_at);

            return (
              <div
                key={notif.id}
                onClick={() => handleNavigateToTarget(notif)}
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
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 group-hover:text-amber-800 group-hover:underline">
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Individual Action Buttons */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUnread && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif.id);
                      }}
                      title="Mark as read"
                      className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDelete(e, notif.id)}
                    title="Delete message"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
