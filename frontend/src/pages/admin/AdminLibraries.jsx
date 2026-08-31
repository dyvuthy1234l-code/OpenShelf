import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  Building2, CheckCircle2, Clock, XCircle, Search, Filter,
  RotateCcw, Plus, MoreVertical, Eye, Check, X, ShieldAlert,
  ChevronLeft, ChevronRight, Phone, Mail, MapPin, AlertCircle,
  LayoutGrid, List, BookOpen, ExternalLink
} from 'lucide-react';
import adminService from '../../services/adminService';
import { PAGE_MOTION_VARIANTS, LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';
import AdminPagination from '../../components/admin/AdminPagination';
import ErrorState from '../../components/public/ErrorState';
import { useAdminLibraries } from '../../hooks/queries/useAdminQueries';

export default function AdminLibraries() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  // Filters, Search & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subFilter, setSubFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Modals & Drawers State
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState({ open: false, type: '', library: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Query parameters
  const queryParams = useMemo(() => ({
    page: currentPage,
    per_page: perPage,
    search: searchQuery,
    status: statusFilter,
    subscription: subFilter,
  }), [currentPage, perPage, searchQuery, statusFilter, subFilter]);

  const { data: resData, isLoading: loading, error: queryErr, refetch: loadLibraries } = useAdminLibraries(queryParams);

  const libraries = resData?.data || [];
  const pagination = resData?.meta || { current_page: currentPage, last_page: 1, total: 0, from: null, to: null };
  const summary = resData?.summary || { total: 0, active: 0, pending: 0, inactive: 0 };
  const error = queryErr ? 'Failed to load library network entries.' : null;

  // Prefetch next page for 0ms instant pagination
  useEffect(() => {
    if (pagination.last_page > currentPage) {
      queryClient.prefetchQuery({
        queryKey: ['admin', 'libraries', { ...queryParams, page: currentPage + 1 }],
        queryFn: () => adminService.getLibraries({ ...queryParams, page: currentPage + 1 }),
        staleTime: 1000 * 60 * 2,
      });
    }
  }, [currentPage, queryParams, pagination.last_page, queryClient]);

  // Add Library Form
  const [newLib, setNewLib] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    status: 'active',
  });

  const filteredLibraries = libraries;
  const paginatedLibraries = libraries;
  const totalItems = pagination.total || 0;
  const totalPages = pagination.last_page || 1;

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSubFilter('all');
    setCurrentPage(1);
  };

  // Status Action Handlers
  const handleStatusChange = async (libraryId, newStatus, reason = null) => {
    try {
      setActionLoading(true);
      await adminService.updateLibraryStatus(libraryId, newStatus, reason);
      queryClient.invalidateQueries({ queryKey: ['admin', 'libraries'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setActionMessage(`Library status successfully updated to ${newStatus.toUpperCase()}.`);
      setTimeout(() => setActionMessage(''), 3500);
      setActionModal({ open: false, type: '', library: null });
      setRejectionReason('');
      setDrawerOpen(false);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update library status.');
      setTimeout(() => setActionError(''), 3500);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateLibrary = async (e) => {
    e.preventDefault();
    if (actionLoading) return;
    try {
      setActionLoading(true);
      await adminService.createLibrary(newLib);
      queryClient.invalidateQueries({ queryKey: ['admin', 'libraries'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setActionMessage('New library branch created successfully.');
      setTimeout(() => setActionMessage(''), 3500);
      setAddModalOpen(false);
      setNewLib({ name: '', description: '', address: '', city: '', phone: '', email: '', status: 'active' });
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to create library branch.');
      setTimeout(() => setActionError(''), 3500);
    } finally {
      setActionLoading(false);
    }
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLib, setEditLib] = useState(null);

  const handleUpdateLibrary = async (e) => {
    e.preventDefault();
    if (actionLoading || !editLib) return;
    try {
      setActionLoading(true);
      await adminService.updateLibrary(editLib.id, editLib);
      queryClient.invalidateQueries({ queryKey: ['admin', 'libraries'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setActionMessage('Library branch details updated successfully.');
      setTimeout(() => setActionMessage(''), 3500);
      setEditModalOpen(false);
      setEditLib(null);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update library branch.');
      setTimeout(() => setActionError(''), 3500);
    } finally {
      setActionLoading(false);
    }
  };

  const [actionMenuId, setActionMenuId] = useState(null);

  // Counts for summary cards
  const countTotal = summary.total;
  const countActive = summary.active;
  const countPending = summary.pending;
  const countInactive = summary.inactive;

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="flex-1 flex flex-col min-h-0 space-y-2 h-full pr-1 pb-1 font-sans overflow-hidden">
      {/* 1. PAGE HEADER (COMPACT CLIENT-READY NETWORK MANAGEMENT) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold shadow-2xs shrink-0">
            <Building2 className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Libraries Network</h1>
              <span className="text-[9.5px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80">
                {countTotal} Branches
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 font-medium leading-none mt-0.5">
              Manage library branch directory, verify librarians, and monitor book circulation.
            </p>
          </div>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 h-8 sm:h-9 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Library</span>
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs shrink-0">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Action Error Banner */}
      {actionError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-rose-600 hover:text-rose-900 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. INTERACTIVE SUMMARY KPI STRIP (CLICKABLE TO FILTER BY STATUS) */}
      <motion.div variants={LIST_STAGGER} initial="initial" animate="animate" className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
        {/* Card 1: Total */}
        <motion.div
          variants={LIST_ITEM}
          onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
          className={`rounded-xl p-2 sm:px-3 shadow-2xs flex items-center justify-between h-[52px] cursor-pointer transition-all ${
            statusFilter === 'all'
              ? 'bg-amber-500/15 border-2 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-gradient-to-r from-amber-50/50 to-white border border-slate-200/90 hover:border-amber-300 hover:shadow-xs'
          }`}
          title="Click to view all libraries"
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Total Branches</span>
            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none mt-0.5">{countTotal}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
          </div>
        </motion.div>

        {/* Card 2: Active */}
        <motion.div
          variants={LIST_ITEM}
          onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}
          className={`rounded-xl p-2 sm:px-3 shadow-2xs flex items-center justify-between h-[52px] cursor-pointer transition-all ${
            statusFilter === 'active'
              ? 'bg-emerald-500/15 border-2 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-gradient-to-r from-emerald-50/50 to-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-xs'
          }`}
          title="Click to filter active libraries"
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Active Operating</span>
            <span className="text-base sm:text-lg font-black text-emerald-950 tracking-tight leading-none mt-0.5">{countActive}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        </motion.div>

        {/* Card 3: Pending */}
        <motion.div
          variants={LIST_ITEM}
          onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
          className={`rounded-xl p-2 sm:px-3 shadow-2xs flex items-center justify-between h-[52px] cursor-pointer transition-all ${
            statusFilter === 'pending'
              ? 'bg-amber-500/20 border-2 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-gradient-to-r from-amber-50/50 to-white border border-slate-200/90 hover:border-amber-300 hover:shadow-xs'
          }`}
          title="Click to filter pending libraries"
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Pending Approval</span>
            <span className="text-base sm:text-lg font-black text-amber-950 tracking-tight leading-none mt-0.5">{countPending}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
        </motion.div>

        {/* Card 4: Inactive */}
        <motion.div
          variants={LIST_ITEM}
          onClick={() => { setStatusFilter('inactive'); setCurrentPage(1); }}
          className={`rounded-xl p-2 sm:px-3 shadow-2xs flex items-center justify-between h-[52px] cursor-pointer transition-all ${
            statusFilter === 'inactive'
              ? 'bg-slate-200 border-2 border-slate-500 ring-2 ring-slate-400/20'
              : 'bg-gradient-to-r from-slate-50/80 to-white border border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
          }`}
          title="Click to filter disabled branches"
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Disabled Branches</span>
            <span className="text-base sm:text-lg font-black text-slate-700 tracking-tight leading-none mt-0.5">{countInactive}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold shrink-0">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </motion.div>
      </motion.div>

      {/* 3. SEARCH, STATUS TABS & VIEW TOGGLE TOOLBAR */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-1.5 sm:p-2 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        {/* Left: Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search libraries by name, email, or librarian..."
            className="w-full pl-8.5 pr-4 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Right: Status Tabs + View Switcher + Reset */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10.5px] font-black">
            {[
              { key: 'all', label: 'All', count: countTotal },
              { key: 'active', label: 'Active', count: countActive },
              { key: 'pending', label: 'Pending', count: countPending },
              { key: 'inactive', label: 'Inactive', count: countInactive },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  statusFilter === tab.key
                    ? 'bg-white text-slate-950 font-black shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[9px] opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* View Mode Switcher (Table vs Grid) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/70">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-950 shadow-2xs font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View (List)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-950 shadow-2xs font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || statusFilter !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10.5px] rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. MAIN LIBRARIES DISPLAY CONTAINER (TABLE VIEW OR GRID VIEW) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex-1 min-h-0 flex flex-col justify-between">
        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400 font-medium animate-pulse">
            Loading library network records...
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={loadLibraries} />
          </div>
        ) : filteredLibraries.length === 0 ? (
          <div className="py-8 text-center p-6 space-y-2 flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-800">
              {searchQuery || statusFilter !== 'all'
                ? 'No libraries match your current filters.'
                : 'No libraries registered yet.'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or resetting filters.'
                : 'New libraries will appear here once registered on OpenShelf.'}
            </p>
            {searchQuery || statusFilter !== 'all' ? (
              <button
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-2xs"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setAddModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Library</span>
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* ============================================================ */
          /* 📋 TABLE VIEW: COMPACT, HIGHLY VISIBLE, ZERO REDUNDANCY     */
          /* ============================================================ */
          <div className="overflow-y-auto flex-1 min-h-0">
            <table className="w-full text-left text-xs align-middle border-collapse">
              <thead>
                <tr className="bg-slate-50/95 backdrop-blur-xs border-b border-slate-200/80 text-slate-500 font-extrabold uppercase text-[9.5px] tracking-wider sticky top-0 z-10">
                  <th className="py-2 px-3.5">Library Branch</th>
                  <th className="py-2 px-3.5">Managed By</th>
                  <th className="py-2 px-3.5">Contact & Reach</th>
                  <th className="py-2 px-3.5">Catalog</th>
                  <th className="py-2 px-3.5">Status</th>
                  <th className="py-2 px-3.5">Created</th>
                  <th className="py-2 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paginatedLibraries.map((lib) => {
                  const bookCount = lib.books_count ?? lib.total_books ?? (Array.isArray(lib.books) ? lib.books.length : 0);

                  return (
                    <tr
                      key={lib.id}
                      onClick={() => navigate(`/admin/libraries/${lib.id}`)}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                    >
                      {/* 1. Library Branch Column (Avatar + Name + Location Pin) */}
                      <td className="py-2 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black flex items-center justify-center overflow-hidden shrink-0 border border-slate-200/80 shadow-2xs group-hover:scale-105 transition-transform">
                            {lib.image_url ? (
                              <img src={lib.image_url} alt={lib.name} className="w-full h-full object-cover" />
                            ) : (
                              lib.name[0].toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-black text-slate-900 block text-xs leading-tight group-hover:text-amber-700 transition-colors">
                              {lib.name}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium mt-0.5 truncate">
                              <MapPin className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                              {lib.city || lib.address || 'Location unassigned'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Managed By Column (Avatar + Name + Verified Badge) */}
                      <td className="py-2 px-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-100 border border-slate-200/80 text-slate-700 font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                            {lib.owner?.avatar_url || lib.owner?.avatar ? (
                              <img
                                src={lib.owner.avatar_url || lib.owner.avatar}
                                alt={lib.owner?.name || 'Librarian'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(lib.owner?.name || 'L')}&background=fef3c7&color=b45309&bold=true`}
                                alt={lib.owner?.name || 'Librarian'}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-black text-slate-900 block text-xs truncate leading-tight">{lib.owner?.name || 'Unassigned'}</span>
                            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200/60 inline-block leading-none mt-0.5">
                              Librarian
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Contact & Reach Column (Replaced duplicate Location with Phone & Email) */}
                      <td className="py-2 px-3.5">
                        <div className="space-y-0.5">
                          {lib.phone ? (
                            <span className="flex items-center gap-1 text-[10.5px] font-bold text-slate-700">
                              <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              {lib.phone}
                            </span>
                          ) : null}
                          {lib.email ? (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500 truncate max-w-[150px] block">
                              <Mail className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              {lib.email}
                            </span>
                          ) : !lib.phone ? (
                            <span className="text-[10.5px] text-slate-400 italic">No contact info</span>
                          ) : null}
                        </div>
                      </td>

                      {/* 4. Catalog Column */}
                      <td className="py-2 px-3.5">
                        <span className="inline-flex items-center gap-1 font-black text-slate-900 text-[11px] px-2 py-0.5 bg-slate-100 rounded-lg border border-slate-200/80 shadow-2xs">
                          📚 {bookCount} <span className="text-[9px] text-slate-500 font-semibold">Books</span>
                        </span>
                      </td>

                      {/* 5. Status Column with Live Pulse Dot */}
                      <td className="py-2 px-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${
                          lib.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
                            : lib.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200/90 animate-pulse'
                            : 'bg-slate-100 text-slate-600 border-slate-200/90'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            lib.status === 'active' ? 'bg-emerald-500' : lib.status === 'pending' ? 'bg-amber-500' : 'bg-slate-400'
                          }`} />
                          {lib.status || 'Active'}
                        </span>
                      </td>

                      {/* 6. Created Column */}
                      <td className="py-2 px-3.5 text-slate-400 text-[10.5px] font-semibold">
                        {lib.created_at ? new Date(lib.created_at).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* 7. Actions Column: Polished Micro-Buttons */}
                      <td className="py-2 px-3.5 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/admin/libraries/${lib.id}`)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-slate-700 hover:text-amber-900 bg-slate-100 hover:bg-amber-100/70 rounded-lg text-[10.5px] font-black transition-all cursor-pointer shadow-2xs"
                            title="View Branch Details"
                          >
                            <Eye className="w-3 h-3 text-slate-600 group-hover:text-amber-700" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditLib(lib);
                              setEditModalOpen(true);
                            }}
                            className="p-1 text-slate-600 hover:text-amber-800 bg-slate-100 hover:bg-amber-100/70 rounded-lg transition-all cursor-pointer shadow-2xs"
                            title="Edit Library"
                          >
                            <Building2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Row More Options Menu */}
                          <div className="relative">
                            <button
                              onClick={() => setActionMenuId(actionMenuId === lib.id ? null : lib.id)}
                              className="p-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all cursor-pointer shadow-2xs"
                              title="More Options"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {actionMenuId === lib.id && (
                              <>
                                <div className="fixed inset-0 z-20" onClick={() => setActionMenuId(null)} />
                                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 text-left">
                                  <button
                                    onClick={() => {
                                      setActionMenuId(null);
                                      navigate(`/admin/libraries/${lib.id}`);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                                    <span>View Details</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActionMenuId(null);
                                      setEditLib(lib);
                                      setEditModalOpen(true);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Edit Library</span>
                                  </button>

                                  {lib.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => {
                                          setActionMenuId(null);
                                          handleStatusChange(lib.id, 'active');
                                        }}
                                        className="w-full px-3 py-1.5 hover:bg-emerald-50 text-xs font-bold text-emerald-700 flex items-center gap-2 cursor-pointer"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Approve Library</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          setActionMenuId(null);
                                          setActionModal({ open: true, type: 'reject', library: lib });
                                        }}
                                        className="w-full px-3 py-1.5 hover:bg-rose-50 text-xs font-bold text-rose-700 flex items-center gap-2 cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                        <span>Reject Library</span>
                                      </button>
                                    </>
                                  )}

                                  {lib.status === 'active' && (
                                    <button
                                      onClick={() => {
                                        setActionMenuId(null);
                                        setActionModal({ open: true, type: 'deactivate', library: lib });
                                      }}
                                      className="w-full px-3 py-1.5 hover:bg-rose-50 text-xs font-bold text-rose-700 flex items-center gap-2 cursor-pointer"
                                    >
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>Deactivate</span>
                                    </button>
                                  )}

                                  {(lib.status === 'inactive' || lib.status === 'suspended') && (
                                    <button
                                      onClick={() => {
                                        setActionMenuId(null);
                                        handleStatusChange(lib.id, 'active');
                                      }}
                                      className="w-full px-3 py-1.5 hover:bg-emerald-50 text-xs font-bold text-emerald-700 flex items-center gap-2 cursor-pointer"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Activate</span>
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* ============================================================ */
          /* 🎴 CARD GRID VIEW: MODERN DISCOVERY CATALOG LAYOUT           */
          /* ============================================================ */
          <div className="overflow-y-auto flex-1 min-h-0 p-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {paginatedLibraries.map((lib) => {
                const bookCount = lib.books_count ?? lib.total_books ?? (Array.isArray(lib.books) ? lib.books.length : 0);

                return (
                  <div
                    key={lib.id}
                    onClick={() => {
                      setSelectedLibrary(lib);
                      setDrawerOpen(true);
                    }}
                    className="bg-white border border-slate-200/90 hover:border-amber-400/80 rounded-2xl p-3 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header: Cover Image & Status Badge */}
                      <div className="relative h-24 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 overflow-hidden flex items-center justify-center border border-slate-200/70 shadow-2xs mb-2.5">
                        {lib.image_url ? (
                          <img src={lib.image_url} alt={lib.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <span className="text-3xl font-black text-slate-950/80">{lib.name[0].toUpperCase()}</span>
                        )}
                        <span className={`absolute top-2 right-2 inline-flex items-center gap-1 text-[8.5px] uppercase font-black px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs ${
                          lib.status === 'active'
                            ? 'bg-emerald-500 text-white'
                            : lib.status === 'pending'
                            ? 'bg-amber-500 text-slate-950 animate-pulse'
                            : 'bg-slate-700 text-white'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                          {lib.status || 'Active'}
                        </span>
                      </div>

                      {/* Card Body: Title & Location */}
                      <h4 className="font-black text-slate-900 text-sm leading-snug group-hover:text-amber-700 transition-colors truncate">
                        {lib.name}
                      </h4>
                      <p className="text-[10.5px] text-slate-500 flex items-center gap-1 font-medium mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                        {lib.city || lib.address || 'Location unassigned'}
                      </p>

                      {/* Metadata row: Librarian & Books */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-5.5 h-5.5 rounded-full bg-amber-100 border border-slate-200 text-slate-700 font-black text-[9px] flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                            {lib.owner?.avatar_url || lib.owner?.avatar ? (
                              <img
                                src={lib.owner.avatar_url || lib.owner.avatar}
                                alt={lib.owner?.name || 'Librarian'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(lib.owner?.name || 'L')}&background=fef3c7&color=b45309&bold=true`}
                                alt={lib.owner?.name || 'Librarian'}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <span className="text-[10.5px] font-bold text-slate-800 truncate">{lib.owner?.name || 'Unassigned'}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-slate-900 px-1.5 py-0.5 bg-slate-100 rounded-md shrink-0">
                          📚 {bookCount}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer: Quick Actions */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/admin/libraries/${lib.id}`)}
                        className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-[11px] font-black shadow-2xs transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Details</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditLib(lib);
                          setEditModalOpen(true);
                        }}
                        className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                        title="Edit Library"
                      >
                        <Building2 className="w-3.5 h-3.5" />
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
            label="libraries"
            showDetails={true}
          />
        </div>
      </div>

      {/* 5. CONFIRMATION / REJECTION MODAL */}
      {actionModal.open && actionModal.library && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-[calc(100vw-24px)] md:w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-extrabold text-slate-900">
                {actionModal.type === 'reject' ? 'Reject Library Registration?' : 'Deactivate Library?'}
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {actionModal.type === 'reject'
                ? `Are you sure you want to reject the library registration for "${actionModal.library.name}"?`
                : `Deactivating "${actionModal.library.name}" will temporarily restrict public borrowing access for this branch.`}
            </p>

            {actionModal.type === 'reject' && (
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700">Rejection Reason (Optional):</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for the rejection..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActionModal({ open: false, type: '', library: null })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange(actionModal.library.id, 'inactive', actionModal.type === 'reject' ? rejectionReason : null)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. ADD LIBRARY MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <form onSubmit={handleCreateLibrary} className="w-[calc(100vw-24px)] md:w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-amber-700 block">Create Branch</span>
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">Add New Library</h3>
              </div>
              <button type="button" onClick={() => setAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* SECTION 1: LIBRARY INFORMATION */}
              <div className="space-y-2 border-b border-slate-100 pb-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Library Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700">Library Name *</label>
                    <input
                      type="text"
                      required
                      value={newLib.name}
                      onChange={(e) => setNewLib({ ...newLib, name: e.target.value })}
                      placeholder="e.g. National Library of Phnom Penh"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">City / Region</label>
                    <input
                      type="text"
                      value={newLib.city}
                      onChange={(e) => setNewLib({ ...newLib, city: e.target.value })}
                      placeholder="e.g. Phnom Penh"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Street Address</label>
                    <input
                      type="text"
                      value={newLib.address}
                      onChange={(e) => setNewLib({ ...newLib, address: e.target.value })}
                      placeholder="Street 92, Sangkat Wat Phnom"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: CONTACT DETAILS */}
              <div className="space-y-2 border-b border-slate-100 pb-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Contact Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Phone</label>
                    <input
                      type="text"
                      value={newLib.phone}
                      onChange={(e) => setNewLib({ ...newLib, phone: e.target.value })}
                      placeholder="+855 23 123 456"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Email</label>
                    <input
                      type="email"
                      value={newLib.email}
                      onChange={(e) => setNewLib({ ...newLib, email: e.target.value })}
                      placeholder="contact@library.gov.kh"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: DESCRIPTION */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={newLib.description}
                  onChange={(e) => setNewLib({ ...newLib, description: e.target.value })}
                  placeholder="Brief description of the library branch..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                Create Library
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 8. EDIT LIBRARY MODAL */}
      {editModalOpen && editLib && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <form onSubmit={handleUpdateLibrary} className="w-[calc(100vw-24px)] md:w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-amber-700 block">Edit Branch</span>
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">Edit Library Details</h3>
              </div>
              <button type="button" onClick={() => { setEditModalOpen(false); setEditLib(null); }} className="p-1 text-slate-400 hover:text-slate-900 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* SECTION 1: LIBRARY INFORMATION */}
              <div className="space-y-2 border-b border-slate-100 pb-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Library Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700">Library Name *</label>
                    <input
                      type="text"
                      required
                      value={editLib.name}
                      onChange={(e) => setEditLib({ ...editLib, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">City / Region</label>
                    <input
                      type="text"
                      value={editLib.city}
                      onChange={(e) => setEditLib({ ...editLib, city: e.target.value })}
                      placeholder="e.g. Phnom Penh"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Street Address</label>
                    <input
                      type="text"
                      value={editLib.address}
                      onChange={(e) => setEditLib({ ...editLib, address: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: CONTACT DETAILS */}
              <div className="space-y-2 border-b border-slate-100 pb-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Contact Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Phone</label>
                    <input
                      type="text"
                      value={editLib.phone}
                      onChange={(e) => setEditLib({ ...editLib, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: DESCRIPTION */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description</label>
                <textarea
                  rows={2}
                  value={editLib.description}
                  onChange={(e) => setEditLib({ ...editLib, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setEditModalOpen(false); setEditLib(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
}

