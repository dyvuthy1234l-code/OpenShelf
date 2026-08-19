import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, AlertCircle, RefreshCw, RotateCcw, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import librarianService from '../../services/librarianService';

import PageHeader from '../../components/librarian/common/PageHeader';
import ReturnTable from '../../components/librarian/returns/ReturnTable';
import ReturnCard from '../../components/librarian/returns/ReturnCard';
import ReturnFilters from '../../components/librarian/returns/ReturnFilters';
import ConfirmReturnModal from '../../components/librarian/returns/ConfirmReturnModal';

export default function ReturnsPage() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [activeTab, setActiveTab] = useState('requests');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [fineFilter, setFineFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 5, total: 0 });

  // Action Modals & Notifications
  const [confirmingReturn, setConfirmingReturn] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const ITEMS_PER_PAGE = 5;

  // 1. Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // 2. Automatically reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab, fineFilter]);

  // 3. Server-side fetch returns
  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      };

      if (activeTab === 'requests') {
        params.status = 'return_requested,overdue,borrowed,picked_up';
      } else if (activeTab === 'completed') {
        params.status = 'returned';
      }

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      if (fineFilter) {
        params.fine_status = fineFilter;
      }

      const res = await librarianService.getBorrowings(params);
      setBorrowings(res.data || []);
      if (res.meta) {
        setMeta(res.meta);
      } else {
        const total = res.data?.length || 0;
        setMeta({ current_page: 1, last_page: 1, per_page: ITEMS_PER_PAGE, total });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to manage these returns.');
      } else if (err.response?.status === 422) {
        setError(err.response?.data?.message || 'Invalid return filter criteria.');
      } else {
        setError('Unable to load book return records from server.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab, debouncedSearch, fineFilter]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

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
      await fetchReturns();
    } catch (err) {
      throw err;
    }
  };

  const totalItems = meta.total ?? borrowings.length;
  const totalPages = meta.last_page ?? 1;
  const startIndex = totalItems > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0;
  const endIndex = Math.min(meta.current_page * meta.per_page, totalItems);

  return (
    <div className="flex-1 flex flex-col justify-between min-h-0 space-y-3.5 overflow-y-auto lg:overflow-hidden h-full">
      {/* Header */}
      <PageHeader
        eyebrow="Return Operations"
        title="Return Management"
        description="Review and confirm physical book returns from members of your library branch."
      />

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold text-xs">Dismiss</button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchReturns} className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

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
        <div className="flex-1 space-y-3 animate-pulse">
          <div className="h-64 bg-white rounded-2xl border border-slate-200" />
        </div>
      ) : borrowings.length === 0 ? (
        <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center shadow-2xs">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
              {borrowings.map((req) => (
                <ReturnCard
                  key={req.id}
                  borrowing={req}
                  onConfirmReturn={(r) => setConfirmingReturn(r)}
                />
              ))}
            </div>
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
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    disabled={loading}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-amber-500 text-slate-950 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}

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

      {/* Confirm Return Modal */}
      {confirmingReturn && (
        <ConfirmReturnModal
          borrowing={confirmingReturn}
          onConfirm={handleConfirmReturnSubmit}
          onClose={() => setConfirmingReturn(null)}
        />
      )}
    </div>
  );
}
