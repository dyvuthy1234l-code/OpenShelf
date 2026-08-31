import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, User, Users, BookOpen, CreditCard, Activity, 
  ArrowLeft, Phone, Mail, MapPin, Calendar, CheckCircle2, 
  Clock, XCircle, AlertCircle, Edit, MoreVertical, RefreshCw 
} from 'lucide-react';
import adminService from '../../services/adminService';

export default function AdminLibraryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const loadLibrary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getLibrary(id);
      setLibrary(res.data || null);
    } catch {
      setError('Failed to load library details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const handleStatusChange = async (newStatus) => {
    if (!library) return;
    try {
      setActionLoading(true);
      await adminService.updateLibraryStatus(library.id, newStatus);
      setLibrary((prev) => (prev ? { ...prev, status: newStatus } : null));
      setActionMessage(`Library status changed to ${newStatus.toUpperCase()}.`);
      setTimeout(() => setActionMessage(''), 3500);
    } catch {
      alert('Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 text-center text-xs text-slate-400 font-medium animate-pulse">
        Loading library profile...
      </div>
    );
  }

  if (error || !library) {
    return (
      <div className="flex-1 p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-extrabold text-slate-900">{error || 'Library not found.'}</h3>
        <Link to="/admin/libraries" className="inline-block px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
          Back to Libraries List
        </Link>
      </div>
    );
  }

  const owner = library.owner;
  const subscription = owner?.subscriptions?.[0];
  const subPlan = subscription?.plan?.name || 'Standard Plan';
  const subStatus = subscription?.status || 'active';

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 h-full w-full">
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0">
          {actionMessage}
        </div>
      )}

      {/* 1. TOP HEADER BANNER CARD (Increased height and spacious cover image) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs shrink-0">
        <div className="h-36 sm:h-44 bg-slate-900 relative">
          {library.cover_image_url && (
            <img src={library.cover_image_url} alt="Cover" className="w-full h-full object-cover opacity-80" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

          {/* Floating Glassmorphic Back Button directly over Cover Image */}
          <button
            type="button"
            onClick={() => navigate('/admin/libraries')}
            className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/65 hover:bg-slate-950/85 backdrop-blur-md text-white hover:text-amber-300 border border-white/20 hover:border-amber-400/40 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Libraries</span>
          </button>
        </div>

        <div className="px-5 py-3 -mt-9 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="flex items-end gap-3.5">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center overflow-hidden border-3 border-white shadow-md shrink-0">
              {library.image_url ? (
                <img src={library.image_url} alt={library.name} className="w-full h-full object-cover" />
              ) : (
                library.name[0].toUpperCase()
              )}
            </div>

            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight truncate">{library.name}</h1>
                <span className={`inline-block text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                  library.status === 'active'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : library.status === 'pending'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {library.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{library.address || library.city || 'No location set'}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {library.status === 'active' ? (
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('inactive')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Deactivate
              </button>
            ) : (
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('active')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                Activate Library
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-2xs flex items-center gap-1 overflow-x-auto shrink-0">
        {[
          { key: 'overview', label: 'Overview', icon: Building2 },
          { key: 'librarian', label: 'Librarian Owner', icon: User },
          { key: 'members', label: 'Members', icon: Users },
          { key: 'subscription', label: 'Subscription', icon: CreditCard },
          { key: 'activity', label: 'Activity Log', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT VIEWS (Stretched to fill remaining height) */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="h-full flex-1 flex flex-col space-y-3">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">Total Books</span>
                  <span className="text-xl font-black text-slate-900">{library.books_count ?? 0}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-amber-600 shrink-0" />
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">Total Members</span>
                  <span className="text-xl font-black text-slate-900">{library.members_count ?? 0}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600 shrink-0" />
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">Active Borrowings</span>
                  <span className="text-xl font-black text-slate-900">{library.borrowings_count ?? 0}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>
              </div>
            </div>

            {/* Details Card & Side Meta */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch flex-1 min-h-0">
              {/* Details Card */}
              <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Library Details</h3>

                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Description</span>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-medium text-xs">
                      {library.description || 'No detailed description provided for this library.'}
                    </p>
                  </div>

                  {library.status === 'inactive' && library.rejection_reason && (
                    <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl space-y-1">
                      <span className="font-black text-rose-800 uppercase text-[9px] tracking-wider block">Rejection Reason</span>
                      <p className="text-rose-950 text-xs font-semibold leading-relaxed">{library.rejection_reason}</p>
                    </div>
                  )}
                </div>

                {/* 4-Column Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Street Address</span>
                    <p className="font-black text-slate-900 text-xs truncate" title={library.address || 'N/A'}>
                      {library.address || 'N/A'}
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">City / Region</span>
                    <p className="font-black text-slate-900 text-xs truncate" title={library.city || 'N/A'}>
                      {library.city || 'N/A'}
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Phone</span>
                    <p className="font-black text-slate-900 text-xs truncate" title={library.phone || 'N/A'}>
                      {library.phone || 'N/A'}
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">Email</span>
                    <p className="font-black text-slate-900 text-xs truncate" title={library.email || 'N/A'}>
                      {library.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Side Info */}
              <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3 h-full flex flex-col justify-between text-xs">
                <div>
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Network Meta</h3>
                  <div className="space-y-2.5 text-xs pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Created Date:</span>
                      <span className="font-black text-slate-900">{library.created_at ? new Date(library.created_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Branch ID:</span>
                      <span className="font-black text-slate-900">#{library.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Current Status:</span>
                      <span className="font-bold text-amber-700 capitalize">{library.status}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 font-medium">
                  Operating under OpenShelf Central Library Management System.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIBRARIAN OWNER */}
        {activeTab === 'librarian' && (
          <div className="h-full flex-1 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-start">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Librarian Owner Profile</h3>

            {owner ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-5 max-w-xl">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-slate-200 text-slate-800 font-black text-2xl flex items-center justify-center overflow-hidden shadow-2xs shrink-0">
                  {owner.avatar_url || owner.avatar ? (
                    <img
                      src={owner.avatar_url || owner.avatar}
                      alt={owner.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(owner.name || 'L')}&background=fef3c7&color=b45309&bold=true`}
                      alt={owner.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="space-y-1 text-xs flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-900">{owner.name}</h4>
                    <span className="inline-block text-[9px] uppercase font-black px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {owner.status || 'Active Account'}
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium">{owner.email}</p>
                  <p className="text-slate-600 font-medium">{owner.phone || 'No phone set'}</p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 font-medium italic bg-slate-50 rounded-2xl border border-slate-200/60">
                No librarian owner assigned to this branch.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MEMBERS */}
        {activeTab === 'members' && (
          <div className="h-full flex-1 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-start">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">Branch Members</h3>
                <p className="text-xs text-slate-500 font-medium">Registered members linked to this library</p>
              </div>
              <Link to="/admin/members" className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all">
                View All Members →
              </Link>
            </div>

            <div className="p-8 text-center text-xs text-slate-600 font-medium bg-slate-50 rounded-2xl border border-slate-200/80 max-w-xl">
              Total Registered Members in this branch: <strong className="text-slate-950 text-sm">{library.members_count ?? 0}</strong>
            </div>
          </div>
        )}

        {/* TAB 4: SUBSCRIPTION */}
        {activeTab === 'subscription' && (
          <div className="h-full flex-1 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-start">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Active Subscription Plan</h3>

            <div className="space-y-3 text-xs max-w-xl">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-600">Current Plan:</span>
                <span className="font-black text-slate-900 text-sm">{subPlan}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-600">Plan Status:</span>
                <span className="inline-block text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {subStatus}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-600">Start Date:</span>
                <span className="font-black text-slate-900">
                  {subscription?.start_date ? new Date(subscription.start_date).toLocaleDateString() : 'Active'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-600">Expiry Date:</span>
                <span className="font-black text-slate-900">
                  {subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'Permanent / Auto-renew'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="h-full flex-1 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-start">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">Branch Activity History</h3>

            <div className="space-y-3 text-xs max-w-2xl">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <p className="font-black text-slate-900">Library Registered</p>
                  <p className="text-[10.5px] text-slate-500 font-medium">
                    Created on {library.created_at ? new Date(library.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <p className="font-black text-slate-900">Current Status Updated</p>
                  <p className="text-[10.5px] text-slate-500 font-medium">Status set to {library.status}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
