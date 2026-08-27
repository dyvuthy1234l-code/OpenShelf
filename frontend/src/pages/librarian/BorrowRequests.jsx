import { useState, useEffect, useCallback } from 'react';
import {
  Inbox, CheckCircle2, AlertCircle, RefreshCw,
  ChevronLeft, ChevronRight, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import librarianService from '../../services/librarianService';
import { PAGE_MOTION_VARIANTS, BANNER_MOTION, MOBILE_GRID_VARIANTS, MOBILE_CARD_VARIANTS } from '../../constants/motionTokens';

import PageHeader from '../../components/librarian/common/PageHeader';
import BorrowRequestTable from '../../components/librarian/borrowings/BorrowRequestTable';
import BorrowRequestCard from '../../components/librarian/borrowings/BorrowRequestCard';
import BorrowRequestFilters from '../../components/librarian/borrowings/BorrowRequestFilters';
import ApproveModal from '../../components/librarian/borrowings/ApproveModal';
import RejectModal from '../../components/librarian/borrowings/RejectModal';

export default function BorrowRequestsPage() {
  const [borrowings, setBorrowings] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 5, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Action Modals & Notifications
  const [approvingReq, setApprovingReq] = useState(null);
  const [rejectingReq, setRejectingReq] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const ITEMS_PER_PAGE = 5;

  // 1. Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // 2. Automatically reset page to 1 when search or status changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, status]);

  // 3. Server-side fetch borrowings
  const fetchBorrowRequests = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (status) params.status = status;

      const res = await librarianService.getBorrowings(params);
      setBorrowings(res.data || []);
      if (res.meta) {
        setMeta(res.meta);
      } else {
        const total = res.data?.length || 0;
        setMeta({
          current_page: 1,
          last_page: 1,
          per_page: ITEMS_PER_PAGE,
          total: total,
        });
      }
    } catch (err) {
      if (!isSilent) {
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
        } else if (err.response?.status === 403) {
          setError('Access denied. You do not have permission to view these borrowings.');
        } else if (err.response?.status === 422) {
          setError(err.response?.data?.message || 'Invalid request parameters.');
        } else {
          setError('Unable to load borrowing requests from server.');
        }
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [currentPage, debouncedSearch, status]);

  useEffect(() => {
    fetchBorrowRequests(false);

    // Auto-refresh interval every 30 seconds
    const interval = setInterval(() => {
      fetchBorrowRequests(true);
    }, 30000);

    // Auto-refresh on window focus
    const handleFocus = () => fetchBorrowRequests(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchBorrowRequests]);

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStatus('');
    setCurrentPage(1);
  };

  // Approval Handlers
  const handleApproveSubmit = async (id) => {
    await librarianService.approveBorrowing(id);
    setApprovingReq(null);
    setSuccessMessage('Borrowing request approved successfully.');
    await fetchBorrowRequests();
  };

  const handleRejectSubmit = async (id, reason) => {
    await librarianService.rejectBorrowing(id, reason);
    setRejectingReq(null);
    setSuccessMessage('Borrowing request rejected.');
    await fetchBorrowRequests();
  };

  const handlePickupConfirm = async (id) => {
    await librarianService.pickupBorrowing(id);
    setSuccessMessage('Book pickup confirmed. Loan is now active.');
    await fetchBorrowRequests();
  };

  const totalItems = meta.total ?? borrowings.length;
  const totalPages = meta.last_page ?? 1;
  const startIndex = totalItems > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0;
  const endIndex = Math.min(meta.current_page * meta.per_page, totalItems);

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="flex-1 flex flex-col justify-between min-h-0 space-y-3.5 overflow-y-auto lg:overflow-hidden h-full">
      {/* Header */}
      <PageHeader
        eyebrow="Circulation Operations"
        title="Borrow Requests"
        description="Review, approve, and process book borrowing requests submitted by library members."
      />

      {/* Success Notification Banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div {...BANNER_MOTION} key="success-banner" className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold text-xs">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div {...BANNER_MOTION} key="error-banner" className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={fetchBorrowRequests} className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold shrink-0">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Status Filters Toolbar */}
      <div className="shrink-0">
        <BorrowRequestFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Content Viewport */}
      {loading ? (
        <div className="flex-1 space-y-3 animate-pulse">
          <div className="h-64 bg-white rounded-2xl border border-slate-200" />
        </div>
      ) : borrowings.length === 0 ? (
        <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 bg-navy-50 border border-brand-border text-navy-700 rounded-2xl flex items-center justify-center shadow-2xs">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No requests found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no borrowing requests matching your current search or status filter.
            </p>
          </div>
          {(search || status) && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-slate-950 transition-all shadow-2xs mt-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Search & Filters</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col justify-between space-y-3">
          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <BorrowRequestTable
                borrowings={borrowings}
                onApprove={(req) => setApprovingReq(req)}
                onReject={(req) => setRejectingReq(req)}
                onPickup={(req) => handlePickupConfirm(req.id)}
              />
            </div>

            {/* Mobile Grid View */}
            <motion.div variants={MOBILE_GRID_VARIANTS} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
              {borrowings.map((req) => (
                <motion.div key={req.id} variants={MOBILE_CARD_VARIANTS}>
                  <BorrowRequestCard
                    borrowing={req}
                    onApprove={(r) => setApprovingReq(r)}
                    onReject={(r) => setRejectingReq(r)}
                    onPickup={(r) => handlePickupConfirm(r.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Server-Side Pagination Control Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs shrink-0">
            <span className="text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{startIndex}–{endIndex}</strong> of{' '}
              <strong className="text-slate-900">{totalItems}</strong> requests
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {(() => {
                  const getPages = () => {
                    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
                    const set = new Set([1, totalPages, currentPage]);
                    if (currentPage > 1) set.add(currentPage - 1);
                    if (currentPage < totalPages) set.add(currentPage + 1);
                    const sorted = [...set].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
                    const res = [];
                    sorted.forEach((p, idx) => {
                      if (idx > 0 && p - sorted[idx - 1] > 1) res.push(`ellipsis-${p}`);
                      res.push(p);
                    });
                    return res;
                  };

                  return getPages().map((item) =>
                    typeof item === 'string' ? (
                      <span key={item} className="w-5 text-center text-xs text-slate-400 font-bold">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        disabled={loading}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === item
                            ? 'bg-amber-500 text-slate-950 shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  );
                })()}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Modals */}
      {approvingReq && (
        <ApproveModal
          borrowing={approvingReq}
          onConfirm={handleApproveSubmit}
          onClose={() => setApprovingReq(null)}
        />
      )}

      {rejectingReq && (
        <RejectModal
          borrowing={rejectingReq}
          onConfirm={handleRejectSubmit}
          onClose={() => setRejectingReq(null)}
        />
      )}
    </motion.div>
  );
}
