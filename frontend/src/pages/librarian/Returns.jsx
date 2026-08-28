import { useState, useEffect, useMemo } from 'react';
import {
  CheckCircle2, AlertCircle, RefreshCw, RotateCcw,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import librarianService from '../../services/librarianService';
import { PAGE_MOTION_VARIANTS, BANNER_MOTION, MOBILE_GRID_VARIANTS, MOBILE_CARD_VARIANTS } from '../../constants/motionTokens';
import { useLibrarianReturns } from '../../hooks/queries/useLibrarianQueries';

import PageHeader from '../../components/librarian/common/PageHeader';
import { ListSkeleton } from '../../components/librarian/common/Skeleton';
import ReturnTable from '../../components/librarian/returns/ReturnTable';
import ReturnCard from '../../components/librarian/returns/ReturnCard';
import ReturnFilters from '../../components/librarian/returns/ReturnFilters';
import ConfirmReturnModal from '../../components/librarian/returns/ConfirmReturnModal';

export default function ReturnsPage() {
  const queryClient = useQueryClient();

  // Filters State
  const [activeTab, setActiveTab] = useState('requests');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [fineFilter, setFineFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Action Modals & Notifications
  const [confirmingReturn, setConfirmingReturn] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const ITEMS_PER_PAGE = 5;

  // Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Automatically reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab, fineFilter]);

  // Query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      per_page: ITEMS_PER_PAGE,
    };
    if (activeTab === 'requests') {
      params.status = 'return_requested,overdue,borrowed,picked_up';
    } else if (activeTab === 'completed') {
      params.status = 'returned';
    }
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    if (fineFilter) params.fine_status = fineFilter;
    return params;
  }, [currentPage, activeTab, debouncedSearch, fineFilter]);

  const { data: resData, isLoading: loading, error: queryErr, refetch: fetchReturns } = useLibrarianReturns(queryParams);

  const borrowings = resData?.data || [];
  const meta = resData?.meta || { current_page: currentPage, last_page: 1, per_page: ITEMS_PER_PAGE, total: borrowings.length };
  const error = queryErr ? 'Unable to load book return records from server.' : null;

  // Prefetch next page for 0ms instant pagination
  useEffect(() => {
    if (meta.last_page > currentPage) {
      queryClient.prefetchQuery({
        queryKey: ['librarian', 'returns', { ...queryParams, page: currentPage + 1 }],
        queryFn: () => librarianService.getBorrowings({ ...queryParams, page: currentPage + 1 }),
        staleTime: 1000 * 60 * 2,
      });
    }
  }, [currentPage, queryParams, meta.last_page, queryClient]);

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setFineFilter('');
    setCurrentPage(1);
  };

  const handleConfirmReturnSubmit = async (id, data) => {
    try {
      await librarianService.returnBook(id, data);
      setConfirmingReturn(null);
      setSuccessMessage('Book return confirmed successfully. Available inventory stock has been updated.');
      queryClient.invalidateQueries({ queryKey: ['librarian', 'returns'] });
      queryClient.invalidateQueries({ queryKey: ['librarian', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['librarian', 'books'] });
    } catch (err) {
      throw err;
    }
  };

  const totalItems = meta.total ?? borrowings.length;
  const totalPages = meta.last_page ?? 1;
  const startIndex = totalItems > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0;
  const endIndex = Math.min(meta.current_page * meta.per_page, totalItems);

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="flex-1 flex flex-col justify-between min-h-0 space-y-3.5 overflow-y-auto lg:overflow-hidden h-full">
      {/* Header */}
      <PageHeader
        eyebrow="Return Operations"
        title="Return Management"
        description="Review and confirm physical book returns from members of your library branch."
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
            <button onClick={fetchReturns} className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold shrink-0">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Tabs Toolbar */}
      <div className="shrink-0">
        <ReturnFilters
          search={search}
          onSearchChange={setSearch}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          fineFilter={fineFilter}
          onFineFilterChange={setFineFilter}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Content Viewport */}
      {loading ? (
        <ListSkeleton rows={5} className="mt-0" />
      ) : borrowings.length === 0 ? (
        <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 bg-navy-50 border border-brand-border text-navy-700 rounded-2xl flex items-center justify-center shadow-2xs">
            <RotateCcw className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No return records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || fineFilter
                ? 'No return records match your active search or fine filter criteria.'
                : activeTab === 'requests'
                ? 'There are no books currently waiting for return confirmation.'
                : 'Completed book returns will be archived here.'}
            </p>
          </div>
          {(search || fineFilter) && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-slate-950 transition-all shadow-2xs mt-2 cursor-pointer"
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
              <ReturnTable
                borrowings={borrowings}
                onConfirmReturn={(req) => setConfirmingReturn(req)}
              />
            </div>

            {/* Mobile Grid View */}
            <motion.div variants={MOBILE_GRID_VARIANTS} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
              {borrowings.map((req) => (
                <motion.div key={req.id} variants={MOBILE_CARD_VARIANTS}>
                  <ReturnCard
                    borrowing={req}
                    onConfirmReturn={(r) => setConfirmingReturn(r)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Server-Side Pagination Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs shrink-0">
            <span className="text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{startIndex}–{endIndex}</strong> of{' '}
              <strong className="text-slate-900">{totalItems}</strong> records
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-40 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
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
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-40 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Return Modal */}
      {confirmingReturn && (
        <ConfirmReturnModal
          borrowing={confirmingReturn}
          onConfirm={handleConfirmReturnSubmit}
          onClose={() => setConfirmingReturn(null)}
        />
      )}
    </motion.div>
  );
}
