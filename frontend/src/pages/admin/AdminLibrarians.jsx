import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck, CheckCircle2, XCircle, AlertCircle, Search,
  RotateCcw, Plus, Eye, Edit2, X, ChevronLeft, ChevronRight,
  Building2, Phone, Mail, UserCheck, ShieldAlert,
  LayoutGrid, List, MapPin
} from 'lucide-react';
import adminService from '../../services/adminService';
import { PAGE_MOTION_VARIANTS, LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';
import AdminPagination from '../../components/admin/AdminPagination';
import { useAdminLibrarians, useAdminLibraries } from '../../hooks/queries/useAdminQueries';

export default function AdminLibrarians() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  // Filters, Search & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [libraryFilter, setLibraryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLibrarian, setSelectedLibrarian] = useState(null);
  const [statusModal, setStatusModal] = useState({ open: false, type: '', librarian: null });
  const [actionLoading, setActionLoading] = useState(false);

  // Query parameters
  const queryParams = useMemo(() => ({
    page: currentPage,
    per_page: perPage,
    search: searchQuery,
    status: statusFilter,
    library: libraryFilter,
  }), [currentPage, perPage, searchQuery, statusFilter, libraryFilter]);

  const { data: libRes, isLoading: loading, error: queryErr, refetch: loadData } = useAdminLibrarians(queryParams);
  const { data: libListRes } = useAdminLibraries({ per_page: -1 });

  const librarians = libRes?.data || [];
  const libraries = libListRes?.data || [];
  const pagination = libRes?.meta || { current_page: currentPage, last_page: 1, total: 0, from: null, to: null };
  const summary = libRes?.summary || { total: 0, active: 0, inactive: 0, unassigned: 0 };

  // Prefetch next page for 0ms instant pagination
  useEffect(() => {
    if (pagination.last_page > currentPage) {
      queryClient.prefetchQuery({
        queryKey: ['admin', 'librarians', { ...queryParams, page: currentPage + 1 }],
        queryFn: () => adminService.getLibrarians({ ...queryParams, page: currentPage + 1 }),
        staleTime: 1000 * 60 * 2,
      });
    }
  }, [currentPage, queryParams, pagination.last_page, queryClient]);

  // Add Librarian Form
  const [newLib, setNewLib] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    library_id: '',
    status: 'active',
  });

  // Edit Form
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    library_id: '',
    status: 'active',
  });

  const filteredLibrarians = librarians;
  const paginatedLibrarians = librarians;
  const totalItems = pagination.total || 0;
  const totalPages = pagination.last_page || 1;

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setLibraryFilter('all');
    setCurrentPage(1);
  };

  // Status Change Handler
  const handleStatusChange = async (librarianId, newStatus) => {
    try {
      setActionLoading(true);
      await adminService.updateUserStatus(librarianId, newStatus);
      await loadData();
      setActionMessage(`Librarian account status updated to ${newStatus.toUpperCase()}.`);
      setTimeout(() => setActionMessage(''), 3500);
      setStatusModal({ open: false, type: '', librarian: null });
    } catch {
      setActionError('Failed to update account status.');
      setTimeout(() => setActionError(''), 3500);
    } finally {
      setActionLoading(false);
    }
  };

  // Create Librarian Handler
  const handleCreateLibrarian = async (e) => {
    e.preventDefault();
    if (newLib.password !== newLib.password_confirmation) {
      setActionError('Passwords do not match.');
      setTimeout(() => setActionError(''), 3500);
      return;
    }

    try {
      setActionLoading(true);
      await adminService.createLibrarian(newLib);
      await loadData();
      setActionMessage('Librarian account created successfully.');
      setTimeout(() => setActionMessage(''), 3500);
      setAddModalOpen(false);
      setNewLib({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        library_id: '',
        status: 'active',
      });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to create librarian account.';
      setActionError(msg);
      setTimeout(() => setActionError(''), 3500);
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Librarian Handler
  const handleOpenEdit = (lib) => {
    setSelectedLibrarian(lib);
    setEditForm({
      name: lib.name || '',
      phone: lib.phone || '',
      library_id: lib.library ? String(lib.library.id) : '',
      status: lib.status || 'active',
    });
    setEditModalOpen(true);
  };

  const handleUpdateLibrarian = async (e) => {
    e.preventDefault();
    if (!selectedLibrarian) return;

    try {
      setActionLoading(true);
      await adminService.updateLibrarian(selectedLibrarian.id, editForm);
      await loadData();
      setActionMessage('Librarian details updated successfully.');
      setTimeout(() => setActionMessage(''), 3500);
      setEditModalOpen(false);
      setSelectedLibrarian(null);
    } catch {
      setActionError('Failed to update librarian details.');
      setTimeout(() => setActionError(''), 3500);
    } finally {
      setActionLoading(false);
    }
  };

  // Summary Card Counts
  const countTotal = summary.total;
  const countActive = summary.active;
  const countInactive = summary.inactive;
  const countUnassigned = summary.unassigned;

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="flex-1 flex flex-col min-h-0 space-y-2 overflow-y-auto h-full pr-1 pb-1 font-sans">
      {/* 1. PAGE HEADER (COMPACT EXECUTIVE STRIP) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:px-3.5 sm:py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-black tracking-widest text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md inline-block">
              Staff & Access Management • {countTotal} Accounts
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight mt-0.5">Librarians Directory</h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Manage librarian accounts, library assignments, and account status.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 h-8.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Librarian</span>
        </button>
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

      {/* Action Error Banner */}
      {actionError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-rose-600 hover:text-rose-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. COMPACT 4-COLUMN STAT STRIP (Interactive Click-to-Filter) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => { setStatusFilter('all'); setLibraryFilter('all'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            statusFilter === 'all' && libraryFilter === 'all' ? 'ring-2 ring-amber-500/30 border-amber-500 bg-amber-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Total Librarians</span>
            <span className="text-base font-black text-slate-900 leading-none">{countTotal}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setStatusFilter('active'); setLibraryFilter('all'); setCurrentPage(1); }}
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
          onClick={() => { setStatusFilter('inactive'); setLibraryFilter('all'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            statusFilter === 'inactive' ? 'ring-2 ring-slate-500/30 border-slate-500 bg-slate-50/50' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Inactive / Suspended</span>
            <span className="text-base font-black text-slate-700 leading-none">{countInactive}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold shrink-0">
            <XCircle className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setLibraryFilter('unassigned'); setStatusFilter('all'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            libraryFilter === 'unassigned' ? 'ring-2 ring-amber-500/30 border-amber-500 bg-amber-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Unassigned Branch</span>
            <span className="text-base font-black text-amber-800 leading-none">{countUnassigned}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-3.5 h-3.5" />
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
            placeholder="Search librarians by name or email..."
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

        {/* Right: Filters, View Toggle & Clear */}
        <div className="flex items-center gap-1.5 flex-wrap">
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

          {/* Library Filter */}
          <select
            value={libraryFilter}
            onChange={(e) => {
              setLibraryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer max-w-[140px] truncate"
          >
            <option value="all">All Libraries</option>
            <option value="unassigned">Unassigned</option>
            {libraries.map((lib) => (
              <option key={lib.id} value={lib.id}>
                {lib.name}
              </option>
            ))}
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

      {/* 4. MAIN LIBRARIANS CONTAINER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex-1 min-h-0 flex flex-col justify-between h-full">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium animate-pulse">
            Loading librarian staff directory...
          </div>
        ) : filteredLibrarians.length === 0 ? (
          <div className="py-12 text-center p-6 space-y-2 flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto border border-amber-200/80">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-sm font-black text-slate-800">
              {searchQuery || statusFilter !== 'all' || libraryFilter !== 'all'
                ? 'No librarians match your current filters.'
                : 'No librarian accounts found.'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              {searchQuery || statusFilter !== 'all' || libraryFilter !== 'all'
                ? 'Try adjusting your search query or resetting filters.'
                : 'Create new librarian accounts to assign them to library branches.'}
            </p>
            {(searchQuery || statusFilter !== 'all' || libraryFilter !== 'all') ? (
              <button
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-2xs"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setAddModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Librarian</span>
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW MODE */
          <div className="overflow-auto flex-1 min-h-0 h-full">
            <table className="w-full text-left text-xs align-middle border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-black uppercase text-[9.5px] tracking-wider sticky top-0 bg-slate-50 z-10">
                  <th className="py-2 px-3.5">Librarian Staff</th>
                  <th className="py-2 px-3.5">Assigned Library Branch</th>
                  <th className="py-2 px-3.5">Contact Info</th>
                  <th className="py-2 px-3.5">Status</th>
                  <th className="py-2 px-3.5">Joined Date</th>
                  <th className="py-2 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paginatedLibrarians.map((lib) => (
                  <tr
                    key={lib.id}
                    onClick={() => navigate(`/admin/librarians/${lib.id}`)}
                    className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                  >
                    {/* 1. Librarian Column (Avatar + Name + Role) */}
                    <td className="py-2 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 border border-slate-200/80 text-slate-800 font-black text-xs flex items-center justify-center overflow-hidden shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          {lib.avatar_url || lib.avatar ? (
                            <img
                              src={lib.avatar_url || lib.avatar}
                              alt={lib.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(lib.name || 'L')}&background=fef3c7&color=b45309&bold=true`}
                              alt={lib.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-slate-900 group-hover:text-amber-700 transition-colors block text-xs leading-tight truncate">
                            {lib.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium mt-0.5 truncate">{lib.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Assigned Library Branch Column */}
                    <td className="py-2 px-3.5">
                      {lib.library ? (
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-5 h-5 rounded-md bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0">
                            <Building2 className="w-3 h-3" />
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/admin/libraries/${lib.library.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold text-slate-900 hover:text-amber-600 transition-colors truncate max-w-[170px] block leading-tight text-xs"
                            >
                              {lib.library.name}
                            </Link>
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5 font-medium truncate">
                              <MapPin className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                              {lib.library.city || lib.library.address || 'Cambodia'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80">
                          ⚠️ Needs Assignment
                        </span>
                      )}
                    </td>

                    {/* 3. Contact Info Column */}
                    <td className="py-2 px-3.5">
                      <div className="space-y-0.5 text-xs">
                        {lib.phone ? (
                          <span className="flex items-center gap-1 text-[10.5px] font-bold text-slate-700">
                            <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            {lib.phone}
                          </span>
                        ) : (
                          <span className="text-[10.5px] text-slate-400 italic">No phone set</span>
                        )}
                      </div>
                    </td>

                    {/* 4. Status Column with Live Pulse Dot */}
                    <td className="py-2 px-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${
                        lib.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
                          : lib.status === 'suspended'
                          ? 'bg-rose-50 text-rose-700 border-rose-200/90'
                          : 'bg-slate-100 text-slate-600 border-slate-200/90'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          lib.status === 'active' ? 'bg-emerald-500' : lib.status === 'suspended' ? 'bg-rose-500' : 'bg-slate-400'
                        }`} />
                        {lib.status || 'Active'}
                      </span>
                    </td>

                    {/* 5. Joined Date Column */}
                    <td className="py-2 px-3.5 text-slate-400 text-[10.5px] font-semibold">
                      {lib.created_at
                        ? new Date(lib.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'N/A'}
                    </td>

                    {/* 6. Actions Column: Polished Micro-Buttons */}
                    <td className="py-2 px-3.5 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/admin/librarians/${lib.id}`)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-slate-700 hover:text-amber-900 bg-slate-100 hover:bg-amber-100/70 rounded-lg text-[10.5px] font-black transition-all cursor-pointer shadow-2xs"
                          title="View Profile"
                        >
                          <Eye className="w-3 h-3 text-slate-600 group-hover:text-amber-700" />
                          <span>View</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(lib)}
                          className="p-1 text-slate-600 hover:text-amber-800 bg-slate-100 hover:bg-amber-100/70 rounded-lg transition-all cursor-pointer shadow-2xs"
                          title="Edit Librarian"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Status Toggle Button */}
                        {lib.status === 'active' ? (
                          <button
                            onClick={() => setStatusModal({ open: true, type: 'deactivate', librarian: lib })}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] rounded-lg transition-colors cursor-pointer shadow-2xs"
                            title="Deactivate Account"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(lib.id, 'active')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] rounded-lg transition-colors cursor-pointer shadow-2xs"
                            title="Activate Account"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARD GRID VIEW MODE */
          <div className="p-3.5 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {paginatedLibrarians.map((lib) => (
                <div
                  key={lib.id}
                  onClick={() => navigate(`/admin/librarians/${lib.id}`)}
                  className="bg-white border border-slate-200/90 hover:border-amber-400 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  {/* Top row: Avatar + Name + Status */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-11 h-11 rounded-full bg-amber-100 border border-slate-200 text-slate-800 font-black text-sm flex items-center justify-center overflow-hidden shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          {lib.avatar_url || lib.avatar ? (
                            <img
                              src={lib.avatar_url || lib.avatar}
                              alt={lib.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(lib.name || 'L')}&background=fef3c7&color=b45309&bold=true`}
                              alt={lib.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-900 text-xs leading-snug group-hover:text-amber-700 transition-colors truncate">
                            {lib.name}
                          </h4>
                          <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60 inline-block leading-none mt-0.5">
                            Librarian Staff
                          </span>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1 text-[8.5px] uppercase font-black px-2 py-0.5 rounded-full border shrink-0 ${
                        lib.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : lib.status === 'suspended'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${lib.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {lib.status || 'Active'}
                      </span>
                    </div>

                    {/* Assigned Branch Chip */}
                    <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-200/60">
                      <span className="text-[8.5px] font-black uppercase text-slate-400 block tracking-wider">Assigned Branch</span>
                      {lib.library ? (
                        <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-black text-slate-900 text-[11.5px] truncate">{lib.library.name}</span>
                        </div>
                      ) : (
                        <span className="text-[10.5px] font-bold text-amber-700 block mt-0.5">⚠️ Unassigned Branch</span>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="mt-2.5 space-y-1 text-xs">
                      <p className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium truncate">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{lib.email}</span>
                      </p>
                      {lib.phone && (
                        <p className="text-[11px] text-slate-600 flex items-center gap-1.5 font-medium truncate">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{lib.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Quick Actions */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/admin/librarians/${lib.id}`)}
                      className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-[11px] font-black shadow-2xs transition-all cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Profile</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(lib)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                      title="Edit Librarian"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
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
            label="librarians"
            showDetails={true}
          />
        </div>
      </div>

      {/* 5. ADD LIBRARIAN MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <form onSubmit={handleCreateLibrarian} className="w-[calc(100vw-24px)] md:w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-blue-700 block">Create Staff</span>
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">Add New Librarian</h3>
              </div>
              <button type="button" onClick={() => setAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* SECTION 1: ACCOUNT INFORMATION */}
              <div className="space-y-2 border-b border-slate-100 pb-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Account Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newLib.name}
                      onChange={(e) => setNewLib({ ...newLib, name: e.target.value })}
                      placeholder="e.g. Elaine Moss"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={newLib.email}
                      onChange={(e) => setNewLib({ ...newLib, email: e.target.value })}
                      placeholder="librarian@example.com"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Phone Number</label>
                    <input
                      type="text"
                      value={newLib.phone}
                      onChange={(e) => setNewLib({ ...newLib, phone: e.target.value })}
                      placeholder="+855 12 345 678"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Password *</label>
                    <input
                      type="password"
                      required
                      value={newLib.password}
                      onChange={(e) => setNewLib({ ...newLib, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={newLib.password_confirmation}
                      onChange={(e) => setNewLib({ ...newLib, password_confirmation: e.target.value })}
                      placeholder="Re-enter password"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: LIBRARY ASSIGNMENT */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Library Assignment</span>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assigned Library Branch</label>
                  <select
                    value={newLib.library_id}
                    onChange={(e) => setNewLib({ ...newLib, library_id: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">No library assigned yet (Unassigned)</option>
                    {libraries.map((lib) => (
                      <option key={lib.id} value={lib.id}>
                        {lib.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. EDIT LIBRARIAN MODAL */}
      {editModalOpen && selectedLibrarian && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <form onSubmit={handleUpdateLibrarian} className="w-[calc(100vw-24px)] md:w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-blue-700 block">Edit Profile</span>
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">Edit Librarian Details</h3>
              </div>
              <button type="button" onClick={() => setEditModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* SECTION 1: PROFILE INFORMATION */}
              <div className="space-y-2 border-b border-slate-100 pb-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Profile Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Phone Number</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Account Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: LIBRARY ASSIGNMENT */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Library Assignment</span>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assigned Library Branch</label>
                  <select
                    value={editForm.library_id}
                    onChange={(e) => setEditForm({ ...editForm, library_id: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">Unassigned (No Library)</option>
                    {libraries.map((lib) => (
                      <option key={lib.id} value={lib.id}>
                        {lib.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
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

      {/* 7. STATUS CONFIRMATION MODAL */}
      {statusModal.open && statusModal.librarian && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-[calc(100vw-24px)] md:w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-extrabold text-slate-900">Deactivate Librarian Account?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to deactivate <strong>"{statusModal.librarian.name}"</strong>? This user will no longer be able to access the librarian workspace.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setStatusModal({ open: false, type: '', librarian: null })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange(statusModal.librarian.id, 'inactive')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
