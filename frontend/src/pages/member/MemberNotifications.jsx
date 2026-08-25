import { useState } from 'react';
import { Bell, CheckCheck, CheckCircle2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotifications } from '../../hooks/queries/useNotifications';
import { useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../../hooks/queries/useNotificationMutations';
import memberService from '../../services/memberService';
import { formatNotificationTime } from '../../utils/dateUtils';
import { PAGE_MOTION_VARIANTS, LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';
import LoadingState from '../../components/public/LoadingState';
import EmptyState from '../../components/public/EmptyState';
import ErrorState from '../../components/public/ErrorState';
import Pagination from '../../components/public/Pagination';

export default function MemberNotifications() {
  const [actionMessage, setActionMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // TanStack Query with Optimistic UI updates
  const { data: resData, isLoading: loading, isError, refetch } = useNotifications('member');
  const markReadMutation = useMarkNotificationAsRead('member');
  const markAllReadMutation = useMarkAllNotificationsAsRead('member');

  const notifications = Array.isArray(resData?.data) ? resData.data : (Array.isArray(resData) ? resData : []);
  const meta = resData?.meta || { current_page: 1, last_page: 1, total: notifications.length };
  const error = isError ? 'Failed to load notifications.' : null;

  const handleMarkAsRead = (id) => {
    markReadMutation.mutate(id, {
      onSuccess: () => setActionMessage('Notification marked as read.'),
      onError: () => setActionMessage('Unable to update notification. Rollback applied.'),
    });
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate(undefined, {
      onSuccess: () => setActionMessage('All notifications marked as read.'),
      onError: () => setActionMessage('Unable to mark all as read. Rollback applied.'),
    });
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await memberService.deleteNotification(id);
      refetch();
      setActionMessage('Notification deleted.');
      window.dispatchEvent(new Event('notificationsRead'));
      setTimeout(() => setActionMessage(''), 3000);
    } catch {
      setActionMessage('Failed to delete notification.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await memberService.clearAllNotifications();
      refetch();
      setActionMessage('All notifications cleared.');
      window.dispatchEvent(new Event('notificationsRead'));
      setTimeout(() => setActionMessage(''), 3000);
    } catch {
      setActionMessage('Failed to clear notifications.');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const totalPages = Math.ceil(notifications.length / ITEMS_PER_PAGE) || 1;
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 text-gold-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Activity Inbox</span>
          </div>
          <h1 className="os-section-title">Notifications</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Updates on borrowing requests, due dates, and library activity
            {!loading && notifications.length > 0 && (
              <>
                {' '}· <strong className="font-bold tabular-nums text-navy-800">{notifications.length}</strong> total
                {unreadCount > 0 && (
                  <> · <strong className="font-bold tabular-nums text-gold-600">{unreadCount}</strong> unread</>
                )}
              </>
            )}
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="os-btn-primary min-h-11"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All as Read</span>
              </button>
            )}

            <button
              onClick={handleClearAll}
              className="os-btn-danger min-h-11"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Message Banner */}
      {actionMessage && (
        <div className="px-4 py-2.5 bg-navy-50 border border-brand-border text-navy-800 font-semibold text-xs rounded-xl shadow-xs transition-all animate-in fade-in slide-in-from-top-2">
          {actionMessage}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading your notifications..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="You're all caught up."
          description="There are no notifications in your inbox at this time."
        />
      ) : (
        <motion.div variants={LIST_STAGGER} initial="initial" animate="animate" className="os-panel divide-y divide-slate-100 overflow-hidden">
          {paginatedNotifications.map((n) => {
            const isUnread = !n.read_at;
            const message = n.data?.message || n.message || 'Notification update';
            const title = n.data?.title || n.type?.split('\\').pop() || 'Notice';

            return (
              <motion.div
                key={n.id}
                variants={LIST_ITEM}
                role="button"
                tabIndex={0}
                onClick={() => isUnread && handleMarkAsRead(n.id)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && isUnread) {
                    e.preventDefault();
                    handleMarkAsRead(n.id);
                  }
                }}
                className={`p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer group focus:outline-hidden focus:bg-navy-50 ${
                  isUnread ? 'bg-gold-100/50 hover:bg-gold-100/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  {/* Unread indicator */}
                  <div className="mt-1 shrink-0">
                    {isUnread ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-gold-500 animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold ${isUnread ? 'text-gold-600' : 'text-navy-900'}`}>
                        {title}
                      </h4>
                      <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">
                        {formatNotificationTime(n.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteNotification(e, n.id)}
                  title="Delete notification"
                  aria-label="Delete notification"
                  className="flex h-11 w-11 items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-80 group-hover:opacity-100 shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Pagination
          currentPage={currentPage}
          lastPage={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </motion.div>
  );
}
