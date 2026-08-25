import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, CheckCircle2, BookOpen, XCircle, Search,
  RotateCcw, Eye, ChevronLeft, ChevronRight, X,
  ShieldAlert, Clock, History
} from 'lucide-react';
import adminService from '../../services/adminService';
import { PAGE_MOTION_VARIANTS, LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';
import AdminPagination from '../../components/admin/AdminPagination';

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [borrowFilter, setBorrowFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, from: null, to: null });
  const [summary, setSummary] = useState({ total: 0, active: 0, with_borrowings: 0, inactive: 0 });

  // Status Action Modal
  const [statusModal, setStatusModal] = useState({ open: false, type: '', member: null });
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [membersRes, libListRes] = await Promise.all([
        adminService.getMembers({
          page: currentPage,
          per_page: perPage,
          search: searchQuery,
          status: statusFilter,
          library: libraryFilter,
          borrowing: borrowFilter,
        }),
        adminService.getLibraries({ per_page: -1 }),
      ]);
      setMembers(membersRes.data || []);
      setLibraries(libListRes.data || []);
      setPagination(membersRes.meta || pagination);
      setSummary(membersRes.summary || summary);
      return membersRes;
    } catch {
      setError('Failed to load member records.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchQuery, statusFilter, libraryFilter, borrowFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, libraryFilter, borrowFilter]);

  const filteredMembers = members;
  const paginatedMembers = members;
  const totalItems = pagination.total || 0;
  const totalPages = pagination.last_page || 1;

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setLibraryFilter('all');
    setStatusFilter('all');
    setBorrowFilter('all');
    setCurrentPage(1);
  };

  // Status Handler
  const handleStatusChange = async (memberId, newStatus) => {
    try {
      setActionLoading(true);
      await adminService.updateUserStatus(memberId, newStatus);
      const refreshed = await loadData();
      if (!(refreshed?.data || []).length && currentPage > 1) setCurrentPage((page) => page - 1);
      setActionMessage(`Member account status updated to ${newStatus.toUpperCase()}.`);
      setTimeout(() => setActionMessage(''), 3500);
      setStatusModal({ open: false, type: '', member: null });
    } catch {
      alert('Failed to update account status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Summary Card Counts
  const countTotal = summary.total;
  const countActive = summary.active;
  const countWithBorrows = summary.with_borrowings;
  const countInactive = summary.inactive;

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="flex-1 flex flex-col min-h-0 space-y-2 overflow-y-auto h-full pr-1 pb-1 font-sans">
      {/* 1. PAGE HEADER (CLIENT-READY MEMBER MANAGEMENT) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <span className="text-[9px] uppercase font-black tracking-widest text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md inline-block">
            Member & Account Management
          </span>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight mt-0.5">Members</h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Manage and monitor members across the OpenShelf network.
          </p>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs shrink-0">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. SUMMARY CARDS (2x2 GRID ON MOBILE, 4-COL ON DESKTOP) */}
      <motion.div variants={LIST_STAGGER} initial="initial" animate="animate" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 shrink-0">
        {/* Card 1: Total Members */}
        <motion.div variants={LIST_ITEM} className="bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between min-h-[72px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block truncate">Total Members</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight block leading-tight mt-0.5">{countTotal}</span>
            <span className="inline-block text-[9px] font-bold text-slate-500 mt-0.5 truncate">Platform members</span>
          </div>
          <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Users className="w-3.5 h-3.5 text-blue-600" />
          </div>
        </motion.div>

        {/* Card 2: Active Members */}
        <motion.div variants={LIST_ITEM} className="bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between min-h-[72px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block truncate">Active Accounts</span>
            <span className="text-lg sm:text-xl font-black text-emerald-950 tracking-tight block leading-tight mt-0.5">{countActive}</span>
            <span className="inline-block text-[9px] font-bold text-emerald-700 mt-0.5 truncate">Active users</span>
          </div>
          <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        </motion.div>

        {/* Card 3: Active Loans */}
        <motion.div variants={LIST_ITEM} className="bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between min-h-[72px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block truncate">With Active Loans</span>
            <span className="text-lg sm:text-xl font-black text-amber-950 tracking-tight block leading-tight mt-0.5">{countWithBorrows}</span>
            <span className="inline-block text-[9px] font-bold text-amber-700 mt-0.5 truncate">Active borrowers</span>
          </div>
          <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          </div>
        </motion.div>

        {/* Card 4: Suspended / Inactive */}
        <motion.div variants={LIST_ITEM} className="bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between min-h-[72px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block truncate">Suspended / Inactive</span>
            <span className="text-lg sm:text-xl font-black text-slate-700 tracking-tight block leading-tight mt-0.5">{countInactive}</span>
            <span className="inline-block text-[9px] font-bold text-slate-500 mt-0.5 truncate">Restricted accounts</span>
          </div>
          <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </motion.div>
      </motion.div>

      {/* 3. FILTER & SEARCH TOOLBAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
        {/* Left: Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search member name or email..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Right: Dropdowns & Reset */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Library Filter */}
          <select
            value={libraryFilter}
            onChange={(e) => {
              setLibraryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 sm:flex-none px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer max-w-[140px] truncate"
          >
            <option value="all">All Libraries</option>
            <option value="no_library">No Library</option>
            {libraries.map((lib) => (
              <option key={lib.id} value={lib.id}>
                {lib.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 sm:flex-none px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Borrowing Filter */}
          <select
            value={borrowFilter}
            onChange={(e) => {
              setBorrowFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 sm:flex-none px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Borrowing</option>
            <option value="active">Has Active Loans</option>
            <option value="no_active">No Active Loans</option>
            <option value="overdue">Has Overdue Books</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={handleResetFilters}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN MEMBERS CONTAINER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex-1 min-h-0 flex flex-col justify-between h-full">
        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400 font-medium animate-pulse">
            Loading member directory...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-8 text-center p-6 space-y-2">
            <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto">
              <Users className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-sm font-black text-slate-800">
              {searchQuery || statusFilter !== 'all' || libraryFilter !== 'all' || borrowFilter !== 'all'
                ? 'No members match your current filters.'
                : 'No members registered yet.'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              {searchQuery || statusFilter !== 'all' || libraryFilter !== 'all' || borrowFilter !== 'all'
                ? 'Try adjusting your search query or resetting filters.'
                : 'Members will appear here when they register on OpenShelf.'}
            </p>
            {(searchQuery || statusFilter !== 'all' || libraryFilter !== 'all' || borrowFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-2xs"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-auto flex-1 min-h-0 h-full">
            {/* Desktop Table View */}
            <table className="hidden md:table w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider sticky top-0 bg-slate-50 z-10">
                  <th className="py-2.5 px-3.5">Member</th>
                  <th className="py-2.5 px-3.5">Library</th>
                  <th className="py-2.5 px-3.5">Contact</th>
                  <th className="py-2.5 px-3.5">Borrowing Status</th>
                  <th className="py-2.5 px-3.5">Account Status</th>
                  <th className="py-2.5 px-3.5">Joined Date</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paginatedMembers.map((m) => {
                  const libName = m.assigned_library_name || 'Unassigned';
                  const activeCount = m.active_borrowings_count || 0;
                  const overdueCount = m.overdue_borrowings_count || 0;

                  return (
                    <tr key={m.id} className="hover:bg-amber-50/30 transition-colors">
                      {/* Member Column */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8.5 h-8.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center overflow-hidden shrink-0 border border-white shadow-2xs">
                            {m.avatar_url ? (
                              <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              m.name[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <Link
                              to={`/admin/members/${m.id}`}
                              className="font-extrabold text-slate-900 hover:text-amber-600 transition-colors block text-xs leading-tight"
                            >
                              {m.name}
                            </Link>
                            <span className="text-[10px] text-slate-400 block font-medium mt-0.5">{m.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Library Column */}
                      <td className="py-2.5 px-3.5 text-slate-700 font-bold max-w-[150px] truncate">
                        {libName !== 'Unassigned' ? (
                          <span className="text-slate-900">{libName}</span>
                        ) : (
                          <span className="inline-block text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Contact Column */}
                      <td className="py-2.5 px-3.5 text-slate-600 font-semibold">
                        {m.phone || <span className="text-slate-400 font-normal italic">Not provided</span>}
                      </td>

                      {/* Borrowing Status Column */}
                      <td className="py-2.5 px-3.5">
                        {overdueCount > 0 ? (
                          <span className="inline-block text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/90">
                            {overdueCount} Overdue
                          </span>
                        ) : activeCount > 0 ? (
                          <span className="inline-block text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/90">
                            {activeCount} Active Loan{activeCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="inline-block text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/90">
                            No Active Loans
                          </span>
                        )}
                      </td>

                      {/* Account Status Column */}
                      <td className="py-2.5 px-3.5">
                        <span className={`inline-block text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                          m.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
                            : m.status === 'suspended'
                            ? 'bg-rose-50 text-rose-700 border-rose-200/90'
                            : 'bg-slate-100 text-slate-600 border-slate-200/90'
                        }`}>
                          {m.status || 'active'}
                        </span>
                      </td>

                      {/* Joined Date Column */}
                      <td className="py-2.5 px-3.5 text-slate-400 text-[11px]">
                        {m.created_at
                          ? new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'N/A'}
                      </td>

                      {/* Actions Column */}
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/admin/members/${m.id}`}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer inline-block"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/admin/members/${m.id}?tab=history`}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer inline-block"
                            title="History"
                          >
                            <History className="w-4 h-4" />
                          </Link>

                          {/* Status Actions */}
                          {m.status === 'active' ? (
                            <button
                              onClick={() => setStatusModal({ open: true, type: 'suspend', member: m })}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                              title="Suspend Account"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(m.id, 'active')}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                              title="Activate Account"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile Card List View */}
            <div className="md:hidden p-2.5 space-y-2.5">
              {paginatedMembers.map((m) => {
                const libName = m.assigned_library_name || 'Unassigned';
                const activeCount = m.active_borrowings_count || 0;
                const overdueCount = m.overdue_borrowings_count || 0;

                return (
                  <div key={m.id} className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center overflow-hidden shrink-0">
                          {m.avatar_url ? (
                            <img src={m.avatar_url} alt={m.name} className="w-full h-full object-cover" />
                          ) : (
                            m.name[0].toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link to={`/admin/members/${m.id}`} className="font-extrabold text-slate-900 truncate block">
                            {m.name}
                          </Link>
                          <span className="text-[10px] text-slate-400 truncate block">{m.email}</span>
                        </div>
                      </div>

                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                        m.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : m.status === 'suspended'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {m.status || 'active'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                      <span className="font-bold text-slate-700">{libName}</span>
                      <div>
                        {overdueCount > 0 ? (
                          <span className="text-rose-700 font-bold">{overdueCount} Overdue</span>
                        ) : activeCount > 0 ? (
                          <span className="text-blue-700 font-bold">{activeCount} Active</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">Clear</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                      <Link
                        to={`/admin/members/${m.id}`}
                        className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 font-bold text-[10px] rounded-lg"
                      >
                        View Details
                      </Link>
                      {m.status === 'active' ? (
                        <button
                          onClick={() => setStatusModal({ open: true, type: 'suspend', member: m })}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px] rounded-lg"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(m.id, 'active')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] rounded-lg"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <AdminPagination
          currentPage={currentPage}
          lastPage={totalPages}
          total={totalItems}
          from={pagination.from}
          to={pagination.to}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={(value) => { setPerPage(value); setCurrentPage(1); }}
          label="members"
        />
      </div>

      {/* 5. STATUS CONFIRMATION MODAL */}
      {statusModal.open && statusModal.member && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-[calc(100vw-24px)] md:w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-extrabold text-slate-900">Suspend Member Account?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to suspend <strong>"{statusModal.member.name}"</strong>? This member will temporarily lose access to their account and borrowing privileges.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setStatusModal({ open: false, type: '', member: null })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange(statusModal.member.id, 'suspended')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
