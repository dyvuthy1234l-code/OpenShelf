import { useState, useEffect, useCallback } from 'react';
import { 
  Users, AlertCircle, RefreshCw, RotateCcw, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import librarianService from '../../services/librarianService';

import PageHeader from '../../components/librarian/common/PageHeader';
import MemberTable from '../../components/librarian/members/MemberTable';
import MemberCard from '../../components/librarian/members/MemberCard';
import MemberFilters from '../../components/librarian/members/MemberFilters';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState({ total_members: 0, active_borrowers: 0, overdue_borrowers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 5, total: 0 });

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
  }, [debouncedSearch, filterStatus]);

  // 3. Server-side fetch members
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (filterStatus && filterStatus !== 'all') params.filter = filterStatus;

      const res = await librarianService.getMembers(params);
      setMembers(res.data || []);
      if (res.summary) setSummary(res.summary);

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
        setError('Access denied. You do not have permission to view members.');
      } else if (err.response?.status === 422) {
        setError(err.response?.data?.message || 'Invalid member query parameters.');
      } else {
        setError('Unable to load library member records from server.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filterStatus]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  const totalItems = meta.total ?? members.length;
  const totalPages = meta.last_page ?? 1;
  const startIndex = totalItems > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0;
  const endIndex = Math.min(meta.current_page * meta.per_page, totalItems);

  return (
    <div className="flex-1 flex flex-col justify-between min-h-0 space-y-3.5 overflow-y-auto lg:overflow-hidden h-full">
      {/* Header */}
      <PageHeader
        eyebrow="Member Management"
        title="Members Directory"
        description="View and manage members who have active borrowing records or account history in your library."
      />

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchMembers} className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
          <span className="text-[9px] uppercase font-extrabold text-slate-400">Total Library Members</span>
          <span className="text-xl font-extrabold text-slate-900">{summary.total_members}</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
          <span className="text-[9px] uppercase font-extrabold text-slate-400">Active Borrowers</span>
          <span className="text-xl font-extrabold text-amber-700">{summary.active_borrowers}</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
          <span className="text-[9px] uppercase font-extrabold text-slate-400">Overdue Members</span>
          <span className={`text-xl font-extrabold ${summary.overdue_borrowers > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {summary.overdue_borrowers}
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="shrink-0">
        <MemberFilters
          search={search}
          onSearchChange={setSearch}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Content Viewport */}
      {loading ? (
        <div className="flex-1 space-y-3 animate-pulse">
          <div className="h-64 bg-white rounded-2xl border border-slate-200" />
        </div>
      ) : members.length === 0 ? (
        <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center shadow-2xs">
            <Users className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No members found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no members matching your current search or status filter.
            </p>
          </div>
          {(search || (filterStatus && filterStatus !== 'all')) && (
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
              <MemberTable members={members} />
            </div>

            {/* Mobile Grid View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
              {members.map((m) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
          </div>

          {/* Server-Side Pagination Control Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs shrink-0">
            <span className="text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{startIndex}–{endIndex}</strong> of{' '}
              <strong className="text-slate-900">{totalItems}</strong> members
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
    </div>
  );
}
