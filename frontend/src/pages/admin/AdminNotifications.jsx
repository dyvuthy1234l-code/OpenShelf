import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, CheckCircle2, RotateCcw, X, Building2, 
  CreditCard, DollarSign, ShieldAlert, CheckCheck, Clock, 
  Search, Eye, ArrowRight, Sparkles, Filter, AlertCircle
} from 'lucide-react';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../utils/errorHandler';
import { PAGE_MOTION_VARIANTS, LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';
import AdminPagination from '../../components/admin/AdminPagination';

export default function AdminNotifications() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all'); // all, library, subscription, payment, system
  const [priorityFilter, setPriorityFilter] = useState('all'); // all, high, medium, low

  // Notification Detail Modal
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, from: null, to: null });
  const [summary, setSummary] = useState({ total: 0, unread: 0, requires_attention: 0, today: 0 });

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getNotifications({
        page: currentPage,
        per_page: perPage,
        status: statusFilter,
        type: typeFilter,
        priority: priorityFilter,
      });
      setNotifications(res.data || []);
      setUnreadCount(res.unread_count || 0);
      setPagination(res.meta || pagination);
      setSummary(res.summary || summary);
      return res;
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, statusFilter, typeFilter, priorityFilter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Mark Individual Notification as Read
  const handleMarkAsRead = async (notif) => {
    if (notif.is_read) return;

    try {
      await adminService.markNotificationAsRead(notif.id);
      const refreshed = await loadNotifications();
      if (!(refreshed?.data || []).length && currentPage > 1) setCurrentPage((page) => page - 1);
      setActionMessage('Notification marked as read.');
      setTimeout(() => setActionMessage(''), 3500);
      window.dispatchEvent(new Event('notificationsRead'));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Mark All Notifications as Read
  const handleMarkAllAsRead = async () => {
    try {
      await adminService.markAllNotificationsAsRead();
      const refreshed = await loadNotifications();
      if (!(refreshed?.data || []).length && currentPage > 1) setCurrentPage((page) => page - 1);
      setActionMessage('All notifications marked as read.');
      setTimeout(() => setActionMessage(''), 3500);
      window.dispatchEvent(new Event('notificationsRead'));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  // Click Item Handler
  const handleItemClick = async (notif) => {
    if (!notif.is_read && notif.is_persistent !== false) {
      handleMarkAsRead(notif);
    }

    if (notif.target_url) {
      navigate(notif.target_url);
    } else {
      setActionMessage('This item is no longer available.');
      setTimeout(() => setActionMessage(''), 3500);
    }
  };

  // Filter items by client-side search query
  const filteredNotifications = useMemo(() => {
    if (!searchQuery.trim()) return notifications;
    const q = searchQuery.toLowerCase();
    return notifications.filter(
      (n) =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.message && n.message.toLowerCase().includes(q)) ||
        (n.type && n.type.toLowerCase().includes(q))
    );
  }, [notifications, searchQuery]);

  const totalItems = pagination.total || 0;
  const totalPages = pagination.last_page || 1;

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPriorityFilter('all');
    setCurrentPage(1);
  };

  // Summary Metrics
  const countTotal = summary.total || totalItems;
  const countUnread = unreadCount;
  const countRequiresAttention = summary.requires_attention || 0;
  const countToday = summary.today || 0;

  // Date Grouping Helper
  const groupNotificationsByDate = (items) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    const groups = { Today: [], Yesterday: [], Earlier: [] };
    items.forEach((item) => {
      const itemDateStr = item.created_at ? new Date(item.created_at).toDateString() : '';
      if (itemDateStr === today) {
        groups.Today.push(item);
      } else if (itemDateStr === yesterday) {
        groups.Yesterday.push(item);
      } else {
        groups.Earlier.push(item);
      }
    });
    return groups;
  };

  const groupedItems = useMemo(
    () => groupNotificationsByDate(filteredNotifications),
    [filteredNotifications]
  );

  // Helper for Action Link Label
  const getActionLabel = (notif) => {
    if (!notif.target_url) return null;
    if (notif.type === 'subscription' || notif.target_url.includes('/subscriptions')) return 'View Subscription →';
    if (notif.type === 'payment' || notif.target_url.includes('/payments')) return 'View Payment →';
    if (notif.type === 'library' || notif.target_url.includes('/libraries')) return 'View Library →';
    if (notif.type === 'librarian' || notif.target_url.includes('/librarians')) return 'View Librarian →';
    if (notif.type === 'member' || notif.target_url.includes('/members')) return 'View Member →';
    return 'View Details →';
  };

  // Helper for Type Icon Component
  const getTypeIcon = (type) => {
    switch (type) {
      case 'library':
        return <Building2 className="w-3.5 h-3.5 text-blue-600" />;
      case 'subscription':
        return <CreditCard className="w-3.5 h-3.5 text-amber-600" />;
      case 'payment':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="flex-1 flex flex-col min-h-0 space-y-2 overflow-y-auto h-full pr-1 pb-1 font-sans">
      {/* 1. PAGE HEADER (COMPACT EXECUTIVE STRIP) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:px-3.5 sm:py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-black tracking-widest text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md inline-block">
              SYSTEM CENTER • {totalItems} ALERTS
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight mt-0.5">Platform Notifications</h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Administrative alerts, subscriber updates, and system activity logs.
          </p>
        </div>

        {/* Mark All As Read Button */}
        <button
          onClick={handleMarkAllAsRead}
          disabled={countUnread === 0}
          className={`inline-flex items-center justify-center gap-1.5 px-3.5 h-8.5 rounded-xl font-black text-xs shadow-2xs transition-all cursor-pointer shrink-0 ${
            countUnread > 0
              ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-md shadow-slate-900/10'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
        >
          <CheckCheck className={`w-3.5 h-3.5 ${countUnread > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between shadow-2xs animate-fadeIn shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage('')} className="text-emerald-700 hover:text-emerald-950 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between shadow-2xs animate-fadeIn shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-950 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. COMPACT 4-COLUMN STAT STRIP (Interactive Click-to-Filter) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0">
        {/* Card 1: All Notifications */}
        <button
          type="button"
          onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            statusFilter === 'all' && priorityFilter === 'all' ? 'ring-2 ring-blue-500/30 border-blue-500 bg-blue-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">All Notifications</span>
            <span className="text-base font-black text-slate-900 leading-none">{countTotal}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Bell className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Card 2: Unread Alerts */}
        <button
          type="button"
          onClick={() => { setStatusFilter('unread'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            statusFilter === 'unread' ? 'ring-2 ring-amber-500/30 border-amber-500 bg-amber-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Unread Alerts</span>
            <span className="text-base font-black text-amber-900 leading-none">{countUnread}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Card 3: Requires Attention */}
        <button
          type="button"
          onClick={() => { setPriorityFilter('high'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-rose-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            priorityFilter === 'high' ? 'ring-2 ring-rose-500/30 border-rose-500 bg-rose-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">High Priority</span>
            <span className="text-base font-black text-rose-900 leading-none">{countRequiresAttention}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Card 4: Received Today */}
        <button
          type="button"
          onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
          className="text-left bg-white border border-slate-200/90 rounded-xl p-2 sm:px-3 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer"
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Received Today</span>
            <span className="text-base font-black text-slate-800 leading-none">{countToday}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* 3. FILTER TOOLBAR (SEARCH + FILTERS) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        {/* Search Primary Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts by title or content..."
            className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Compact Filters & Reset */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="library">Library</option>
            <option value="subscription">Subscription</option>
            <option value="payment">Payment</option>
            <option value="system">System</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Reset Filters Button */}
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 4. NOTIFICATION FEED (TALLER CONTAINER & COMPACT ITEMS) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-4.5 shadow-2xs flex-1 min-h-[460px] lg:min-h-0 flex flex-col justify-between">
        {loading ? (
          <div className="space-y-2 p-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl w-full" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-12 text-center p-6 space-y-3 my-auto">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">
              {statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all' || searchQuery
                ? 'No notifications match your current filters.'
                : "You're all caught up!"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              {statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all' || searchQuery
                ? 'Try adjusting your search term or reset filter parameters.'
                : 'There are no administrative alerts to review right now.'}
            </p>
            {(statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center gap-1 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-2xs"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {Object.entries(groupedItems).map(([groupTitle, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={groupTitle} className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {groupTitle}
                    </span>
                    <div className="h-px bg-slate-100 flex-1" />
                  </div>

                  <div className="space-y-2">
                    {items.map((n) => {
                      const isHigh = n.priority === 'high';
                      const isMed = n.priority === 'medium';
                      const actionLabel = getActionLabel(n);

                      return (
                        <div
                          key={n.id}
                          onClick={() => handleItemClick(n)}
                          className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group relative ${
                            !n.is_read
                              ? 'bg-amber-50/30 border-amber-200/90 shadow-2xs'
                              : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            {/* Type Icon */}
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-105 border ${
                              isHigh
                                ? 'bg-rose-50 border-rose-200 text-rose-700'
                                : isMed
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}>
                              {getTypeIcon(n.type)}
                            </div>

                            {/* Main Content */}
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">{n.title}</h5>
                                
                                {/* Priority Badge */}
                                {isHigh && (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                                    <span className="w-1 h-1 rounded-full bg-rose-600"></span>
                                    HIGH
                                  </span>
                                )}
                                {isMed && (
                                  <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                                    <span className="w-1 h-1 rounded-full bg-amber-500"></span>
                                    MEDIUM
                                  </span>
                                )}

                                {/* Type Pill */}
                                {n.type && (
                                  <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                    {n.type}
                                  </span>
                                )}

                                {/* Unread Dot Badge */}
                                {!n.is_read && (
                                  <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 shadow-2xs">
                                    UNREAD
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] sm:text-xs text-slate-600 font-normal leading-relaxed">
                                {n.message}
                              </p>

                              {/* Related Action Link */}
                              {actionLabel && (
                                <div className="pt-0.5 flex items-center gap-1">
                                  <span className="text-[11px] font-bold text-amber-700 hover:text-amber-900 hover:underline flex items-center gap-1">
                                    {actionLabel}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Side Timestamp & Action Menu */}
                          <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1.5 self-end sm:self-center">
                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                              {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>

                            <div className="flex items-center gap-1">
                              {/* Inspect details button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedNotification(n);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Inspect details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Mark read button */}
                              {!n.is_read && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(n);
                                  }}
                                  className="p-1 text-amber-600 hover:text-amber-800 rounded-md hover:bg-amber-100/60 transition-colors cursor-pointer"
                                  title="Mark as read"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. PAGINATION */}
        <div className="shrink-0">
          <AdminPagination
            currentPage={currentPage}
            lastPage={totalPages}
            total={totalItems}
            from={pagination.from}
            to={pagination.to}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onPerPageChange={(value) => { setPerPage(value); setCurrentPage(1); }}
            label="notifications"
            showDetails={true}
          />
        </div>
      </div>

      {/* 6. NOTIFICATION DETAIL MODAL */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/62 backdrop-blur-xs">
          <div className="w-[calc(100vw-24px)] md:w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-100 font-sans">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  {getTypeIcon(selectedNotification.type)}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">Notification Details</h3>
                  <span className="text-xs text-slate-400 font-medium">
                    {selectedNotification.created_at ? new Date(selectedNotification.created_at).toLocaleString() : ''}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-900 text-sm">{selectedNotification.title}</span>
                {selectedNotification.priority === 'high' && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    High Priority
                  </span>
                )}
                {selectedNotification.type && (
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                    {selectedNotification.type}
                  </span>
                )}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-700 leading-relaxed">
                {selectedNotification.message}
              </div>

              {selectedNotification.target_url && (
                <div className="text-[11px] font-bold text-slate-500">
                  Target Destination: <code className="bg-slate-100 px-2 py-0.5 rounded text-amber-800 font-mono">{selectedNotification.target_url}</code>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 font-bold text-xs">
              {!selectedNotification.is_read && (
                <button
                  type="button"
                  onClick={() => {
                    handleMarkAsRead(selectedNotification);
                    setSelectedNotification((prev) => prev ? { ...prev, is_read: true } : null);
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Mark as Read
                </button>
              )}
              {selectedNotification.target_url && (
                <button
                  type="button"
                  onClick={() => {
                    handleItemClick(selectedNotification);
                    setSelectedNotification(null);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  {getActionLabel(selectedNotification) || 'Navigate →'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
