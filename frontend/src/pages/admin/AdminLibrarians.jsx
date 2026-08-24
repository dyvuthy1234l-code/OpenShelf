import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, CheckCircle2, XCircle, AlertCircle, Search, 
  RotateCcw, Plus, Eye, Edit2, X, ChevronLeft, ChevronRight, 
  Building2, Phone, Mail, UserCheck, ShieldAlert 
} from 'lucide-react';
import adminService from '../../services/adminService';
import AdminPagination from '../../components/admin/AdminPagination';

export default function AdminLibrarians() {
  const [librarians, setLibrarians] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [libraryFilter, setLibraryFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, from: null, to: null });
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0, unassigned: 0 });

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLibrarian, setSelectedLibrarian] = useState(null);
  const [statusModal, setStatusModal] = useState({ open: false, type: '', librarian: null });
  const [actionLoading, setActionLoading] = useState(false);

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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [libRes, libListRes] = await Promise.all([
        adminService.getLibrarians({
          page: currentPage,
          per_page: perPage,
          search: searchQuery,
          status: statusFilter,
          library: libraryFilter,
        }),
        adminService.getLibraries({ per_page: -1 }),
      ]);
      setLibrarians(libRes.data || []);
      setLibraries(libListRes.data || []);
      setPagination(libRes.meta || pagination);
      setSummary(libRes.summary || summary);
      return libRes;
    } catch {
      setError('Failed to load librarian directory.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchQuery, statusFilter, libraryFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, libraryFilter]);

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
      const refreshed = await loadData();
      if (!(refreshed?.data || []).length && currentPage > 1) setCurrentPage((page) => page - 1);
      setActionMessage(`Librarian status updated to ${newStatus.toUpperCase()}.`);
      setTimeout(() => setActionMessage(''), 3500);
      setStatusModal({ open: false, type: '', librarian: null });
    } catch {
      setActionError('Failed to update librarian status.');
      setTimeout(() => setActionError(''), 3500);
    } finally {
      setActionLoading(false);
    }
  };

  // Create Librarian Handler
  const handleCreateLibrarian = async (e) => {
    e.preventDefault();
    if (actionLoading) return;
    if (newLib.password !== newLib.password_confirmation) {
      setActionError('Password and Password Confirmation do not match.');
      setTimeout(() => setActionError(''), 3500);
      return;
    }

    try {
      setActionLoading(true);
      const res = await adminService.createLibrarian(newLib);
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
      setActionError(err?.response?.data?.message || 'Failed to create librarian account.');
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
      const res = await adminService.updateLibrarian(selectedLibrarian.id, editForm);
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

  const [actionMenuId, setActionMenuId] = useState(null);

  // Summary Card Counts
  const countTotal = summary.total;
  const countActive = summary.active;
  const countInactive = summary.inactive;
  const countUnassigned = summary.unassigned;

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-2 overflow-y-auto h-full pr-1 pb-1 font-sans">
      {/* 1. PAGE HEADER (CLIENT-READY STAFF MANAGEMENT) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <span className="text-[9px] uppercase font-black tracking-widest text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md inline-block">
            Staff & Access Management
          </span>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight mt-0.5">Librarians</h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Manage librarian accounts, library assignments, and account status.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 h-9 sm:h-10 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Librarian</span>
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
        {/* Card 1: Total Librarians */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between h-[82px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Total Librarians</span>
            <span className="text-xl font-black text-slate-900 tracking-tight block leading-tight mt-0.5">{countTotal}</span>
            <span className="inline-block text-[9px] font-bold text-slate-500 mt-0.5">Staff accounts</span>
          </div>
          <div className="w-7.5 h-7.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          </div>
        </div>

        {/* Card 2: Active */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between h-[82px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Active Accounts</span>
            <span className="text-xl font-black text-emerald-950 tracking-tight block leading-tight mt-0.5">{countActive}</span>
            <span className="inline-block text-[9px] font-bold text-emerald-700 mt-0.5">Active staff</span>
          </div>
          <div className="w-7.5 h-7.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        </div>

        {/* Card 3: Inactive */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between h-[82px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Inactive / Suspended</span>
            <span className="text-xl font-black text-slate-700 tracking-tight block leading-tight mt-0.5">{countInactive}</span>
            <span className="inline-block text-[9px] font-bold text-slate-500 mt-0.5">Disabled accounts</span>
          </div>
          <div className="w-7.5 h-7.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>

        {/* Card 4: Unassigned */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between h-[82px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Unassigned</span>
            <span className="text-xl font-black text-amber-950 tracking-tight block leading-tight mt-0.5">{countUnassigned}</span>
            <span className="inline-block text-[9px] font-bold text-amber-700 mt-0.5">Needs assignment</span>
          </div>
          <div className="w-7.5 h-7.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
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
            placeholder="Search librarians by name or email..."
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
            className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer max-w-[160px] truncate"
          >
            <option value="all">All Libraries</option>
            <option value="unassigned">Unassigned</option>
            {libraries.map((lib) => (
              <option key={lib.id} value={lib.id}>
                {lib.name}
              </option>
            ))}
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

      {/* 4. MAIN LIBRARIANS TABLE CONTAINER (EXPANDS VERTICALLY TO FILL AVAILABLE HEIGHT) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex-1 min-h-0 flex flex-col justify-between h-full">
        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400 font-medium animate-pulse">
            Loading librarian staff directory...
          </div>
        ) : filteredLibrarians.length === 0 ? (
          <div className="py-8 text-center p-6 space-y-2">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
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
                <span>Add Librarian</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-auto flex-1 min-h-0 h-full">
            <table className="w-full min-w-full max-w-[800px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider sticky top-0 bg-slate-50 z-10">
                  <th className="py-2.5 px-3.5">Librarian</th>
                  <th className="py-2.5 px-3.5">Assigned Library</th>
                  <th className="py-2.5 px-3.5">Contact</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Joined Date</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paginatedLibrarians.map((lib) => (
                  <tr key={lib.id} className="hover:bg-amber-50/30 transition-colors">
                    {/* Librarian Column */}
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8.5 h-8.5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center overflow-hidden shrink-0 border border-white shadow-2xs">
                          {lib.avatar_url ? (
                            <img src={lib.avatar_url} alt={lib.name} className="w-full h-full object-cover" />
                          ) : (
                            lib.name[0].toUpperCase()
                          )}
                        </div>
                        <div>
                          <Link
                            to={`/admin/librarians/${lib.id}`}
                            className="font-extrabold text-slate-900 hover:text-amber-600 transition-colors block text-xs leading-tight"
                          >
                            {lib.name}
                          </Link>
                          <span className="text-[10px] text-slate-400 block font-medium mt-0.5">{lib.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Assigned Library Column */}
                    <td className="py-2.5 px-3.5">
                      {lib.library ? (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <Link
                            to={`/admin/libraries/${lib.library.id}`}
                            className="font-bold text-slate-900 hover:text-amber-600 transition-colors truncate max-w-[160px]"
                          >
                            {lib.library.name}
                          </Link>
                        </div>
                      ) : (
                        <span className="inline-block text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Contact Column */}
                    <td className="py-2.5 px-3.5 text-slate-600 font-semibold">
                      {lib.phone || <span className="text-slate-400 font-normal italic">Not provided</span>}
                    </td>

                    {/* Status Column */}
                    <td className="py-2.5 px-3.5">
                      <span className={`inline-block text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                        lib.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
                          : lib.status === 'suspended'
                          ? 'bg-rose-50 text-rose-700 border-rose-200/90'
                          : 'bg-slate-100 text-slate-600 border-slate-200/90'
                      }`}>
                        {lib.status || 'inactive'}
                      </span>
                    </td>

                    {/* Joined Date Column */}
                    <td className="py-2.5 px-3.5 text-slate-400 text-[11px]">
                      {lib.created_at
                        ? new Date(lib.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'N/A'}
                    </td>

                    {/* Actions Column: [ Eye ] [ Edit ] [ ⋮ ] Icon Buttons */}
                    <td className="py-2.5 px-3.5 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/librarians/${lib.id}`}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer inline-block"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleOpenEdit(lib)}
                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Status Toggle / Actions Menu */}
                        {lib.status === 'active' ? (
                          <button
                            onClick={() => setStatusModal({ open: true, type: 'deactivate', librarian: lib })}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                            title="Deactivate Account"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(lib.id, 'active')}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
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
          label="librarians"
        />
      </div>

      {/* 5. ADD LIBRARIAN MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <form onSubmit={handleCreateLibrarian} className="w-[calc(100vw-24px)] md:w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
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
    </div>
  );
}
