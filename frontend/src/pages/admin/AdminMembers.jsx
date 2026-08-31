import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  Users, CheckCircle2, BookOpen, XCircle, Search,
  RotateCcw, Eye, ChevronLeft, ChevronRight, X,
  ShieldAlert, Clock, History, LayoutGrid, List, MapPin, Building2, Phone, Mail
} from 'lucide-react';
import adminService from '../../services/adminService';
import { PAGE_MOTION_VARIANTS, LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';
import AdminPagination from '../../components/admin/AdminPagination';
import { useAdminMembers, useAdminLibraries } from '../../hooks/queries/useAdminQueries';

export default function AdminMembers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [actionMessage, setActionMessage] = useState('');

  // Search, Filters & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [borrowFilter, setBorrowFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Status Action Modal
  const [statusModal, setStatusModal] = useState({ open: false, type: '', member: null });
  const [actionLoading, setActionLoading] = useState(false);

  // Query parameters
  const queryParams = useMemo(() => ({
    page: currentPage,
    per_page: perPage,
    search: searchQuery,
    status: statusFilter,
    library: libraryFilter,
    borrowing: borrowFilter,
  }), [currentPage, perPage, searchQuery, statusFilter, libraryFilter, borrowFilter]);

  const { data: membersRes, isLoading: loading, error: queryErr, refetch: loadData } = useAdminMembers(queryParams);
  const { data: libListRes } = useAdminLibraries({ per_page: -1 });

  const members = membersRes?.data || [];
  const libraries = libListRes?.data || [];
  const pagination = membersRes?.meta || { current_page: currentPage, last_page: 1, total: 0, from: null, to: null };
  const summary = membersRes?.summary || { total: 0, active: 0, with_borrowings: 0, inactive: 0 };

  // Prefetch next page for 0ms instant pagination
  useEffect(() => {
    if (pagination.last_page > currentPage) {
      queryClient.prefetchQuery({
        queryKey: ['admin', 'members', { ...queryParams, page: currentPage + 1 }],
        queryFn: () => adminService.getMembers({ ...queryParams, page: currentPage + 1 }),
        staleTime: 1000 * 60 * 2,
      });
    }
  }, [currentPage, queryParams, pagination.last_page, queryClient]);

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
      await loadData();
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
      {/* 1. PAGE HEADER (COMPACT EXECUTIVE STRIP) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:px-3.5 sm:py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-black tracking-widest text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md inline-block">
              Member Directory • {countTotal} Accounts
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight mt-0.5">Registered Members</h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Manage and monitor reader accounts, active borrowings, and library memberships.
          </p>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs shrink-0">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. COMPACT 4-COLUMN STAT STRIP (Interactive Click-to-Filter) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => { setStatusFilter('all'); setBorrowFilter('all'); setLibraryFilter('all'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            statusFilter === 'all' && borrowFilter === 'all' && libraryFilter === 'all' ? 'ring-2 ring-amber-500/30 border-amber-500 bg-amber-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Total Members</span>
            <span className="text-base font-black text-slate-900 leading-none">{countTotal}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setStatusFilter('active'); setBorrowFilter('all'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            statusFilter === 'active' ? 'ring-2 ring-emerald-500/30 border-emerald-500 bg-emerald-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Active Accounts</span>
            <span className="text-base font-black text-emerald-700 leading-none">{countActive}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setBorrowFilter('active'); setStatusFilter('all'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            borrowFilter === 'active' ? 'ring-2 ring-amber-500/30 border-amber-500 bg-amber-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">With Active Loans</span>
            <span className="text-base font-black text-amber-800 leading-none">{countWithBorrows}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setStatusFilter('inactive'); setBorrowFilter('all'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            statusFilter === 'inactive' ? 'ring-2 ring-slate-500/30 border-slate-500 bg-slate-50/50' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Restricted / Suspended</span>
            <span className="text-base font-black text-slate-700 leading-none">{countInactive}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold shrink-0">
            <XCircle className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        {/* Left: Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search members by name or email..."
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Dropdowns, View Switcher & Clear */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Library Filter */}
          <select
            value={libraryFilter}
            onChange={(e) => {
              setLibraryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer max-w-[130px] truncate"
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
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
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
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Borrowing</option>
            <option value="active">Active Loans</option>
            <option value="no_active">No Loans</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* View Switcher: Table vs Grid */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clear Filters */}
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN MEMBERS CONTAINER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex-1 min-h-0 flex flex-col justify-between h-full">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium animate-pulse">
            Loading member directory...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-12 text-center p-6 space-y-2 flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto border border-amber-200/80">
              <Users className="w-6 h-6 text-amber-600" />
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
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-2xs"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW MODE */
          <div className="overflow-auto flex-1 min-h-0 h-full">
            <table className="w-full text-left text-xs align-middle border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-black uppercase text-[9.5px] tracking-wider sticky top-0 bg-slate-50 z-10">
                  <th className="py-2 px-3.5">Member Reader</th>
                  <th className="py-2 px-3.5">Library Branch</th>
                  <th className="py-2 px-3.5">Contact Info</th>
                  <th className="py-2 px-3.5">Borrowing Status</th>
                  <th className="py-2 px-3.5">Account Status</th>
                  <th className="py-2 px-3.5">Joined Date</th>
                  <th className="py-2 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paginatedMembers.map((m) => {
                  const libName = m.assigned_library_name || m.library?.name || 'Unassigned';
                  const activeCount = m.active_borrowings_count || 0;
                  const overdueCount = m.overdue_borrowings_count || 0;

                  return (
                    <tr
                      key={m.id}
                      onClick={() => navigate(`/admin/members/${m.id}`)}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                    >
                      {/* 1. Member Column (Avatar + Name + Email) */}
                      <td className="py-2 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-100 border border-slate-200/80 text-slate-800 font-black text-xs flex items-center justify-center overflow-hidden shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                            {m.avatar_url || m.avatar ? (
                              <img
                                src={m.avatar_url || m.avatar}
                                alt={m.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || 'M')}&background=fef3c7&color=b45309&bold=true`}
                                alt={m.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-black text-slate-900 group-hover:text-amber-700 transition-colors block text-xs leading-tight truncate">
                              {m.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium mt-0.5 truncate">{m.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Library Branch Column */}
                      <td className="py-2 px-3.5">
                        {libName !== 'Unassigned' ? (
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="font-bold text-slate-900 truncate max-w-[150px]">{libName}</span>
                          </div>
                        ) : (
                          <span className="inline-block text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                            General / Global
                          </span>
                        )}
                      </td>

                      {/* 3. Contact Info Column */}
                      <td className="py-2 px-3.5">
                        <div className="space-y-0.5 text-xs">
                          {m.phone ? (
                            <span className="flex items-center gap-1 text-[10.5px] font-bold text-slate-700">
                              <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              {m.phone}
                            </span>
                          ) : (
                            <span className="text-[10.5px] text-slate-400 italic">No phone set</span>
                          )}
                        </div>
                      </td>

                      {/* 4. Borrowing Status Column */}
                      <td className="py-2 px-3.5">
                        {overdueCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/90 shadow-2xs">
                            <Clock className="w-2.5 h-2.5 text-rose-500" />
                            {overdueCount} Overdue
                          </span>
                        ) : activeCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/90 shadow-2xs">
                            <BookOpen className="w-2.5 h-2.5 text-blue-500" />
                            {activeCount} Loan{activeCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                            No Loans
                          </span>
                        )}
                      </td>

                      {/* 5. Account Status Column with Pulse Dot */}
                      <td className="py-2 px-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${
                          m.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
                            : m.status === 'suspended'
                            ? 'bg-rose-50 text-rose-700 border-rose-200/90'
                            : 'bg-slate-100 text-slate-600 border-slate-200/90'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            m.status === 'active' ? 'bg-emerald-500' : m.status === 'suspended' ? 'bg-rose-500' : 'bg-slate-400'
                          }`} />
                          {m.status || 'active'}
                        </span>
                      </td>

                      {/* 6. Joined Date Column */}
                      <td className="py-2 px-3.5 text-slate-400 text-[10.5px] font-semibold">
                        {m.created_at
                          ? new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'N/A'}
                      </td>

                      {/* 7. Actions Column */}
                      <td className="py-2 px-3.5 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/admin/members/${m.id}`)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-slate-700 hover:text-amber-900 bg-slate-100 hover:bg-amber-100/70 rounded-lg text-[10.5px] font-black transition-all cursor-pointer shadow-2xs"
                            title="View Member"
                          >
                            <Eye className="w-3 h-3 text-slate-600 group-hover:text-amber-700" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => navigate(`/admin/members/${m.id}?tab=history`)}
                            className="p-1 text-slate-600 hover:text-amber-800 bg-slate-100 hover:bg-amber-100/70 rounded-lg transition-all cursor-pointer shadow-2xs"
                            title="Borrowing History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {/* Status Actions */}
                          {m.status === 'active' ? (
                            <button
                              onClick={() => setStatusModal({ open: true, type: 'suspend', member: m })}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] rounded-lg transition-colors cursor-pointer shadow-2xs"
                              title="Suspend Account"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(m.id, 'active')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded-lg transition-colors cursor-pointer shadow-2xs"
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
          </div>
        ) : (
          /* CARD GRID VIEW MODE */
          <div className="p-3.5 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {paginatedMembers.map((m) => {
                const libName = m.assigned_library_name || m.library?.name || 'Unassigned';
                const activeCount = m.active_borrowings_count || 0;
                const overdueCount = m.overdue_borrowings_count || 0;

                return (
                  <div
                    key={m.id}
                    onClick={() => navigate(`/admin/members/${m.id}`)}
                    className="bg-white border border-slate-200/90 hover:border-amber-400 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top row: Avatar + Name + Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-11 h-11 rounded-full bg-amber-100 border border-slate-200 text-slate-800 font-black text-sm flex items-center justify-center overflow-hidden shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                            {m.avatar_url || m.avatar ? (
                              <img
                                src={m.avatar_url || m.avatar}
                                alt={m.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || 'M')}&background=fef3c7&color=b45309&bold=true`}
                                alt={m.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-black text-slate-900 text-xs leading-snug group-hover:text-amber-700 transition-colors truncate">
                              {m.name}
                            </h4>
                            <span className="text-[9px] font-bold text-slate-500 block truncate">
                              {m.email}
                            </span>
                          </div>
                        </div>

                        <span className={`inline-flex items-center gap-1 text-[8.5px] uppercase font-black px-2 py-0.5 rounded-full border shrink-0 ${
                          m.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : m.status === 'suspended'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${m.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {m.status || 'active'}
                        </span>
                      </div>

                      {/* Library Branch Chip */}
                      <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-200/60">
                        <span className="text-[8.5px] font-black uppercase text-slate-400 block tracking-wider">Branch Link</span>
                        <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-black text-slate-900 text-[11.5px] truncate">{libName}</span>
                        </div>
                      </div>

                      {/* Borrowing Status Chip */}
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium text-[11px]">Active Loans:</span>
                        {overdueCount > 0 ? (
                          <span className="font-black text-rose-700 text-[11px]">{overdueCount} Overdue</span>
                        ) : activeCount > 0 ? (
                          <span className="font-black text-blue-700 text-[11px]">{activeCount} Books</span>
                        ) : (
                          <span className="font-bold text-emerald-700 text-[11px]">None</span>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/admin/members/${m.id}`)}
                        className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-[11px] font-black shadow-2xs transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Profile</span>
                      </button>
                      <button
                        onClick={() => navigate(`/admin/members/${m.id}?tab=history`)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                        title="Borrowing History"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Clean Pinned Pagination Footer */}
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
            label="members"
            showDetails={true}
          />
        </div>
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
