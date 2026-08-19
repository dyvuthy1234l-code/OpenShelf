import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Building2, Activity, ArrowLeft, Mail, Phone, 
  Calendar, CheckCircle2, XCircle, AlertCircle, Edit2 
} from 'lucide-react';
import adminService from '../../services/adminService';

export default function AdminLibrarianDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [librarian, setLibrarian] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const loadLibrarian = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getLibrarian(id);
      setLibrarian(res.data || null);
    } catch {
      setError('Failed to load librarian account details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLibrarian();
  }, [loadLibrarian]);

  const handleStatusChange = async (newStatus) => {
    if (!librarian) return;
    try {
      setActionLoading(true);
      await adminService.updateUserStatus(librarian.id, newStatus);
      setLibrarian((prev) => (prev ? { ...prev, status: newStatus } : null));
      setActionMessage(`Account status changed to ${newStatus.toUpperCase()}.`);
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
        Loading librarian profile...
      </div>
    );
  }

  if (error || !librarian) {
    return (
      <div className="flex-1 p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-extrabold text-slate-900">{error || 'Librarian account not found.'}</h3>
        <Link to="/admin/librarians" className="inline-block px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl">
          Back to Librarians List
        </Link>
      </div>
    );
  }

  const library = librarian.library;
  const subscription = librarian.subscriptions?.[0];

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 overflow-y-auto lg:overflow-hidden h-full pr-1 pb-1">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Back</span>
        </button>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold">
          {actionMessage}
        </div>
      )}

      {/* 1. TOP PROFILE HEADER CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-2xl flex items-center justify-center overflow-hidden border-2 border-white shadow-md shrink-0">
              {librarian.avatar_url ? (
                <img src={librarian.avatar_url} alt={librarian.name} className="w-full h-full object-cover" />
              ) : (
                librarian.name[0].toUpperCase()
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">{librarian.name}</h1>
                <span className={`inline-block text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                  librarian.status === 'active'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : librarian.status === 'suspended'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {librarian.status || 'inactive'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{librarian.email}</p>
              {library && (
                <p className="text-xs font-bold text-amber-700">
                  Assigned Branch: <strong className="text-slate-900">{library.name}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {librarian.status === 'active' ? (
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('inactive')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Deactivate
              </button>
            ) : (
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('active')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                Activate Account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-2xs flex items-center gap-1 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', icon: ShieldCheck },
          { key: 'library', label: 'Assigned Library', icon: Building2 },
          { key: 'activity', label: 'Account Activity', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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

      {/* 3. TAB VIEWS */}
      <div className="space-y-3 flex-1 min-h-0 lg:overflow-y-auto">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3 max-w-2xl">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">Account Overview</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Full Name</span>
                <p className="font-extrabold text-slate-900">{librarian.name}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Email Address</span>
                <p className="font-extrabold text-slate-900">{librarian.email}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Phone</span>
                <p className="font-extrabold text-slate-900">{librarian.phone || 'N/A'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Account Role</span>
                <p className="font-extrabold text-amber-700 capitalize">{librarian.role}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Account Status</span>
                <p className="font-extrabold text-slate-900 capitalize">{librarian.status || 'active'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                <span className="font-bold text-slate-400 uppercase text-[9px]">Joined Date</span>
                <p className="font-extrabold text-slate-900">
                  {librarian.created_at ? new Date(librarian.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNED LIBRARY */}
        {activeTab === 'library' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3 max-w-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-extrabold text-slate-900">Assigned Library Branch</h3>
              {library && (
                <Link
                  to={`/admin/libraries/${library.id}`}
                  className="text-xs font-bold text-amber-600 hover:underline"
                >
                  View Library →
                </Link>
              )}
            </div>

            {library ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <h4 className="text-base font-extrabold text-slate-900">{library.name}</h4>
                <p className="text-slate-600 font-medium">Location: {library.address || library.city || 'N/A'}</p>
                <p className="text-slate-600 font-medium">Status: <strong className="text-amber-800 capitalize">{library.status}</strong></p>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 font-medium bg-slate-50 rounded-xl border border-slate-200">
                This librarian is not currently assigned to any library branch.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3 max-w-2xl">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">Account Activity History</h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div>
                  <p className="font-bold text-slate-900">Librarian Account Registered</p>
                  <p className="text-[10px] text-slate-400">
                    Joined on {librarian.created_at ? new Date(librarian.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-bold text-slate-900">Current Status</p>
                  <p className="text-[10px] text-slate-400">Account status is {librarian.status || 'active'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
