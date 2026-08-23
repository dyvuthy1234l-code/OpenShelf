import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, Clock, AlertTriangle, ArrowLeft, 
  History, Activity, CheckCircle2, XCircle, AlertCircle, Building2 
} from 'lucide-react';
import adminService from '../../services/adminService';

export default function AdminMemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'history' ? 'history' : 'overview';

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const loadMember = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getMember(id);
      setMember(res.data || null);
    } catch {
      setError('Failed to load member account details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMember();
  }, [loadMember]);

  const handleStatusChange = async (newStatus) => {
    if (!member) return;
    try {
      setActionLoading(true);
      await adminService.updateUserStatus(member.id, newStatus);
      setMember((prev) => (prev ? { ...prev, status: newStatus } : null));
      setActionMessage(`Member account status updated to ${newStatus.toUpperCase()}.`);
      setTimeout(() => setActionMessage(''), 3500);
    } catch {
      alert('Failed to update member status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 text-center text-xs text-slate-400 font-medium animate-pulse">
        Loading member profile...
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex-1 p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-extrabold text-slate-900">{error || 'Member account not found.'}</h3>
        <Link to="/admin/members" className="inline-block px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer">
          Back to Members Directory
        </Link>
      </div>
    );
  }

  const borrowings = member.borrowings || [];
  const primaryLib = member.primary_library || borrowings[0]?.library;
  const activeCount = member.active_borrowings_count ?? borrowings.filter((b) => ['pending', 'approved', 'borrowed', 'picked_up', 'overdue', 'return_requested'].includes(b.status)).length;
  const overdueCount = member.overdue_borrowings_count ?? borrowings.filter((b) => b.status === 'overdue').length;

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 overflow-y-auto lg:overflow-hidden h-full pr-1 pb-1">
      {/* Back Button */}
      <div className="flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => navigate('/admin/members')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Back to Members Directory</span>
        </button>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-semibold shrink-0 shadow-2xs">
          {actionMessage}
        </div>
      )}

      {/* OVERDUE BOOKS WARNING BANNER */}
      {overdueCount > 0 && (
        <div className="bg-rose-50 border border-rose-200/90 text-rose-900 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-2xs shrink-0">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-extrabold text-xs block">Overdue Books Warning: {overdueCount} Items Overdue</span>
              <span className="text-[11px] text-rose-700 font-medium">This member currently holds overdue library items across assigned branches.</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shrink-0 transition-colors cursor-pointer"
          >
            View Loans →
          </button>
        </div>
      )}

      {/* 1. TOP PROFILE HEADER CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-xl flex items-center justify-center overflow-hidden border-2 border-white shadow-xs shrink-0">
              {member.avatar_url ? (
                <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                member.name[0].toUpperCase()
              )}
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-blue-700 block">
                Member Profile
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">{member.name}</h1>
                <span className={`inline-block text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                  member.status === 'active'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : member.status === 'suspended'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {member.status || 'active'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{member.email}</p>
              {primaryLib && (
                <div className="flex items-center gap-1 text-xs font-bold text-slate-700 pt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Primary Library: <strong className="text-slate-900">{primaryLib.name}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Status Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {member.status === 'active' ? (
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('suspended')}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Suspend Account
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
      <div className="bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-2xs flex items-center gap-1 overflow-x-auto shrink-0">
        {[
          { key: 'overview', label: 'Overview', icon: Users },
          { key: 'history', label: 'Borrowing History', icon: History },
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
          <div className="space-y-3">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] uppercase font-extrabold tracking-wider text-slate-500 block">Total Borrowed</span>
                  <span className="text-xl font-extrabold text-slate-900">{member.borrowings_count ?? borrowings.length}</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] uppercase font-extrabold tracking-wider text-slate-500 block">Active Borrowings</span>
                  <span className="text-xl font-extrabold text-amber-900">{activeCount}</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] uppercase font-extrabold tracking-wider text-slate-500 block">Overdue Books</span>
                  <span className="text-xl font-extrabold text-rose-900">{overdueCount}</span>
                </div>
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Account Details Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Account Overview</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Full Name</span>
                  <p className="font-extrabold text-slate-900">{member.name}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Email Address</span>
                  <p className="font-extrabold text-slate-900">{member.email}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Phone</span>
                  <p className="font-extrabold text-slate-900">{member.phone || 'N/A'}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Account Status</span>
                  <p className="font-extrabold text-slate-900 capitalize">{member.status || 'active'}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Primary Library</span>
                  <p className="font-extrabold text-amber-700">{primaryLib?.name || 'No Library'}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Joined Date</span>
                  <p className="font-extrabold text-slate-900">
                    {member.created_at ? new Date(member.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BORROWING HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Borrowing History</h3>

            {borrowings.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium italic bg-slate-50 rounded-xl border border-slate-200">
                No borrowing history records for this member yet.
              </div>
            ) : (
              <div className="overflow-auto max-h-[340px]">
                <table className="w-full min-w-full max-w-[800px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-extrabold uppercase text-[9px] tracking-wider">
                      <th className="py-3 px-4">Book Title</th>
                      <th className="py-3 px-4">Library</th>
                      <th className="py-3 px-4">Borrowed Date</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Returned Date</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {borrowings.map((b) => (
                      <tr key={b.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="py-3 px-4 font-extrabold text-slate-900 max-w-[180px] truncate">
                          {b.book?.title || 'Book Item'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-semibold max-w-[140px] truncate">
                          {b.library?.name || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {b.created_at ? new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {b.due_date ? new Date(b.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {b.returned_at ? new Date(b.returned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                            b.status === 'returned'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : b.status === 'overdue'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3 max-w-2xl">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Account Activity History</h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div>
                  <p className="font-bold text-slate-900">Member Account Created</p>
                  <p className="text-[10px] text-slate-400">
                    Registered on {member.created_at ? new Date(member.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-bold text-slate-900">Account Status</p>
                  <p className="text-[10px] text-slate-400">Current status is {member.status || 'active'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
