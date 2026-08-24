import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, CheckCircle2, Clock, XCircle, Search, Filter, 
  RotateCcw, Plus, MoreVertical, Eye, Check, X, ShieldAlert, 
  ChevronLeft, ChevronRight, Phone, Mail, MapPin, AlertCircle 
} from 'lucide-react';
import adminService from '../../services/adminService';
import AdminPagination from '../../components/admin/AdminPagination';
import ErrorState from '../../components/public/ErrorState';

export default function AdminLibraries() {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subFilter, setSubFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, from: null, to: null });
  const [summary, setSummary] = useState({ total: 0, active: 0, pending: 0, inactive: 0 });

  // Modals & Drawers State
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState({ open: false, type: '', library: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  const loadLibraries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getLibraries({
        page: currentPage,
        per_page: perPage,
        search: searchQuery,
        status: statusFilter,
        subscription: subFilter,
      });
      setLibraries(res.data || []);
      setPagination(res.meta || pagination);
      setSummary(res.summary || summary);
      return res;
    } catch {
      setError('Failed to load library network entries.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchQuery, statusFilter, subFilter]);

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, subFilter]);

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
      const refreshed = await loadLibraries();
      if (!(refreshed?.data || []).length && currentPage > 1) setCurrentPage((page) => page - 1);
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
      await loadLibraries();
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
      await loadLibraries();
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
    <div className="flex-1 flex flex-col min-h-0 space-y-2 overflow-y-auto h-full pr-1 pb-1 font-sans">
      {/* 1. PAGE HEADER (COMPACT CLIENT-READY NETWORK MANAGEMENT) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <span className="text-[9px] uppercase font-black tracking-widest text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md inline-block">
            Network Management
          </span>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight mt-0.5">Libraries</h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Manage and monitor all registered OpenShelf libraries.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 h-9 sm:h-10 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Library</span>
        </button>
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

      {/* Action Error Banner */}
      {actionError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-rose-600 hover:text-rose-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. SUMMARY CARDS (2x2 GRID ON MOBILE, 4-COL ON DESKTOP) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 shrink-0">
        {/* Card 1: Total Libraries */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between h-[82px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Total Libraries</span>
            <span className="text-xl font-black text-slate-900 tracking-tight block leading-tight mt-0.5">{countTotal}</span>
            <span className="inline-block text-[9px] font-bold text-slate-500 mt-0.5">Network total</span>
          </div>
          <div className="w-7.5 h-7.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
          </div>
        </div>

        {/* Card 2: Active Libraries */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between h-[82px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Active Libraries</span>
            <span className="text-xl font-black text-emerald-950 tracking-tight block leading-tight mt-0.5">{countActive}</span>
            <span className="inline-block text-[9px] font-bold text-emerald-700 mt-0.5">Operating branches</span>
          </div>
          <div className="w-7.5 h-7.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        </div>

        {/* Card 3: Pending / Review */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between h-[82px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Pending / Review</span>
            <span className="text-xl font-black text-amber-950 tracking-tight block leading-tight mt-0.5">{countPending}</span>
            <span className="inline-block text-[9px] font-bold text-amber-700 mt-0.5">
              {countPending === 0 ? 'No pending reviews' : 'Needs review'}
            </span>
          </div>
          <div className="w-7.5 h-7.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
        </div>

        {/* Card 4: Inactive / Suspended */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between h-[82px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Inactive / Suspended</span>
            <span className="text-xl font-black text-slate-700 tracking-tight block leading-tight mt-0.5">{countInactive}</span>
            <span className="inline-block text-[9px] font-bold text-slate-500 mt-0.5">Disabled branches</span>
          </div>
          <div className="w-7.5 h-7.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>
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
            placeholder="Search libraries by name, email, or librarian..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Right: Dropdowns & Reset */}
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Hidden Subscription Filter */}
          <select
            value={subFilter}
            onChange={(e) => {
              setSubFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="hidden"
          >
            <option value="all">All Plans</option>
            <option value="active">Active Plan</option>
            <option value="trial">Trial</option>
            <option value="expired">Expired</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN LIBRARIES TABLE CONTAINER (EXPANDS VERTICALLY TO FILL AVAILABLE HEIGHT) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex-1 min-h-0 flex flex-col justify-between h-full">
        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400 font-medium animate-pulse">
            Loading library network records...
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={loadLibraries} />
          </div>
        ) : filteredLibraries.length === 0 ? (
          <div className="py-8 text-center p-6 space-y-2">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-black text-slate-800">
              {searchQuery || statusFilter !== 'all' || subFilter !== 'all'
                ? 'No libraries match your current filters.'
                : 'No libraries registered yet.'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              {searchQuery || statusFilter !== 'all' || subFilter !== 'all'
                ? 'Try adjusting your search query or resetting filters.'
                : 'New libraries will appear here once registered on OpenShelf.'}
            </p>
            {searchQuery || statusFilter !== 'all' || subFilter !== 'all' ? (
              <button
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-2xs"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setAddModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Library</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-auto flex-1 min-h-0 h-full">
            <table className="w-full min-w-full max-w-[800px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider sticky top-0 bg-slate-50 z-10">
                  <th className="py-2.5 px-3.5">Library</th>
                  <th className="py-2.5 px-3.5">Managed By</th>
                  <th className="py-2.5 px-3.5">Location</th>
                  <th className="py-2.5 px-3.5">Books</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Created</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paginatedLibraries.map((lib) => {
                  const bookCount = lib.books_count ?? lib.total_books ?? (Array.isArray(lib.books) ? lib.books.length : 0);

                  return (
                    <tr
                      key={lib.id}
                      onClick={() => {
                        setSelectedLibrary(lib);
                        setDrawerOpen(true);
                      }}
                      className="hover:bg-amber-50/30 transition-colors cursor-pointer"
                    >
                      {/* Library Column */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-extrabold flex items-center justify-center overflow-hidden shrink-0 border border-white shadow-2xs">
                            {lib.image_url ? (
                              <img src={lib.image_url} alt={lib.name} className="w-full h-full object-cover" />
                            ) : (
                              lib.name[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block text-xs leading-tight">
                              {lib.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium mt-0.5">
                              {lib.city || lib.address || 'Location unassigned'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Managed By Column */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                            {lib.owner?.name ? lib.owner.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block text-xs">{lib.owner?.name || 'Unassigned'}</span>
                            <span className="text-[9.5px] text-slate-400 block font-medium">Librarian</span>
                          </div>
                        </div>
                      </td>

                      {/* Location Column */}
                      <td className="py-2.5 px-3.5 text-slate-700 font-semibold truncate max-w-[140px]">
                        {lib.city ? `${lib.city}` : lib.address || 'N/A'}
                      </td>

                      {/* Books Column */}
                      <td className="py-2.5 px-3.5">
                        <span className="inline-flex items-center gap-1 font-extrabold text-slate-900 text-xs px-2.5 py-0.5 bg-slate-100 rounded-md border border-slate-200/80">
                          {bookCount} <span className="text-[9.5px] text-slate-500 font-semibold">Books</span>
                        </span>
                      </td>

                      {/* Status Column */}
                      <td className="py-2.5 px-3.5">
                        <span className={`inline-block text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                          lib.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
                            : lib.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200/90'
                            : 'bg-slate-100 text-slate-600 border-slate-200/90'
                        }`}>
                          {lib.status || 'inactive'}
                        </span>
                      </td>

                      {/* Created Column */}
                      <td className="py-2.5 px-3.5 text-slate-400 text-[11px]">
                        {lib.created_at ? new Date(lib.created_at).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions Column: [ Eye ] [ Edit ] [ ⋮ ] Icon Buttons with Tooltips */}
                      <td className="py-2.5 px-3.5 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedLibrary(lib);
                              setDrawerOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setEditLib(lib);
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Building2 className="w-4 h-4" />
                          </button>

                          {/* Row More Options Menu */}
                          <div className="relative">
                            <button
                              onClick={() => setActionMenuId(actionMenuId === lib.id ? null : lib.id)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="More"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {actionMenuId === lib.id && (
                              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-left">
                                <button
                                  onClick={() => {
                                    setActionMenuId(null);
                                    setSelectedLibrary(lib);
                                    setDrawerOpen(true);
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
          label="libraries"
        />
      </div>

      {/* 5. LIBRARY DETAILS & REVIEW DRAWER */}
      {drawerOpen && selectedLibrary && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className="w-[calc(100vw-24px)] md:w-full max-w-md max-h-[90vh] overflow-y-auto bg-white h-full shadow-2xl flex flex-col justify-between p-6 space-y-6 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[9px] uppercase font-extrabold tracking-widest text-amber-700 block">Library Overview</span>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">Details & Status</h3>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-1 text-slate-400 hover:text-slate-900 rounded-lg cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cover & Logo Header */}
              <div className="h-32 rounded-2xl bg-slate-900 overflow-hidden relative border border-slate-200">
                {selectedLibrary.cover_image_url && (
                  <img src={selectedLibrary.cover_image_url} alt="Cover" className="w-full h-full object-cover opacity-80" />
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-base flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                    {selectedLibrary.image_url ? (
                      <img src={selectedLibrary.image_url} alt={selectedLibrary.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedLibrary.name[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white leading-tight drop-shadow-xs">{selectedLibrary.name}</h3>
                    <span className="text-xs text-amber-300 font-semibold">{selectedLibrary.city || 'Location not set'}</span>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-1 text-xs">
                <span className="font-extrabold text-slate-400 uppercase text-[9px] tracking-wider">Library Overview</span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-medium">
                  {selectedLibrary.description || 'No description provided for this library.'}
                </p>
              </div>

              {/* Librarian Owner Section */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2 text-xs">
                <span className="font-extrabold text-slate-900 block border-b border-slate-200/60 pb-1">Librarian Owner</span>
                <div className="space-y-1 text-slate-600 font-medium">
                  <p><strong className="text-slate-900">Name:</strong> {selectedLibrary.owner?.name || 'N/A'}</p>
                  <p><strong className="text-slate-900">Email:</strong> {selectedLibrary.owner?.email || 'N/A'}</p>
                  <p><strong className="text-slate-900">Phone:</strong> {selectedLibrary.phone || selectedLibrary.owner?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Location & Contact Section */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2 text-xs">
                <span className="font-extrabold text-slate-900 block border-b border-slate-200/60 pb-1">Location & Contact</span>
                <div className="space-y-1 text-slate-600 font-medium">
                  <p><strong className="text-slate-900">Address:</strong> {selectedLibrary.address || 'N/A'}</p>
                  <p><strong className="text-slate-900">City:</strong> {selectedLibrary.city || 'N/A'}</p>
                  <p><strong className="text-slate-900">Created:</strong> {selectedLibrary.created_at ? new Date(selectedLibrary.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              {selectedLibrary.status === 'pending' ? (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() => setActionModal({ open: true, type: 'reject', library: selectedLibrary })}
                    className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl border border-rose-200 transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleStatusChange(selectedLibrary.id, 'active')}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    Approve Library
                  </button>
                </>
              ) : selectedLibrary.status === 'active' ? (
                <button
                  disabled={actionLoading}
                  onClick={() => setActionModal({ open: true, type: 'deactivate', library: selectedLibrary })}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Deactivate Library
                </button>
              ) : (
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange(selectedLibrary.id, 'active')}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Activate Library
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. CONFIRMATION / REJECTION MODAL */}
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
    </div>
  );
}

