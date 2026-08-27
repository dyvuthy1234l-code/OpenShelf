import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, BookOpen, AlertTriangle, 
  CheckCircle2, Clock, Mail, Phone, Calendar, 
  AlertCircle, DollarSign 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PAGE_MOTION_VARIANTS } from '../../constants/motionTokens';
import librarianService from '../../services/librarianService';

export default function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMemberDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await librarianService.getMember(id);
      setData(res.data || null);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 403) {
        setError('Member not found or has no activity record in your library.');
      } else {
        setError('Unable to load member details.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMemberDetails();
  }, [fetchMemberDetails]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-pulse">
        <div className="h-64 bg-white rounded-3xl border border-slate-200" />
      </div>
    );
  }

  if (error || !data || !data.member) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Access Denied</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">{error}</p>
        </div>
        <Link
          to="/librarian/members"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Members Directory</span>
        </Link>
      </div>
    );
  }

  const { member, stats, current_borrowings = [], borrowing_history = [] } = data;

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-700 block">
              Member Profile
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {member.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Member Profile Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500 text-slate-950 font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-md overflow-hidden border-2 border-white">
              {member.avatar_url || member.avatar ? (
                <img src={member.avatar_url || member.avatar} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                member.name ? member.name[0].toUpperCase() : 'M'
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-900">{member.name}</h2>
                <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border capitalize shrink-0 ${
                  stats.status === 'Overdue'
                    ? 'text-rose-700 bg-rose-50 border-rose-200'
                    : stats.status === 'Active'
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-slate-600 bg-slate-100 border-slate-200'
                }`}>
                  {stats.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{member.email}</span>
              </p>
              {member.phone && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{member.phone}</span>
                </p>
              )}
            </div>
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Member Since</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {member.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* 4 Quick Stat Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Borrowed</span>
            <span className="text-2xl font-extrabold text-slate-900">{stats.total_borrowed}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Active Loans</span>
            <span className="text-2xl font-extrabold text-slate-900">{stats.active_count}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Overdue Books</span>
            <span className={`text-2xl font-extrabold ${stats.overdue_count > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {stats.overdue_count}
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Fines</span>
            <span className={`text-2xl font-extrabold ${stats.total_fines > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
              ${parseFloat(stats.total_fines || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Active Borrowings Section */}
      <div className="space-y-4">
        <div className="border-b border-slate-200/80 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900">Active Borrowings & Requests</h3>
          <p className="text-xs text-slate-500">Books currently requested or checked out by {member.name} in your library</p>
        </div>

        {current_borrowings.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center text-slate-400 text-xs italic shadow-xs">
            No active borrowings or pending requests for this member.
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full max-w-[800px] text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-4 px-6">Book</th>
                    <th className="py-4 px-4">Requested</th>
                    <th className="py-4 px-4">Due Date</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {current_borrowings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="truncate max-w-[200px]">{b.book?.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        {b.requested_at || b.created_at ? new Date(b.requested_at || b.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">
                        {b.due_date ? new Date(b.due_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-300">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/librarian/borrow-requests/${b.id}`}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors inline-block"
                        >
                          View Request
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Borrowing History Section */}
      <div className="space-y-4">
        <div className="border-b border-slate-200/80 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900">Borrowing History</h3>
          <p className="text-xs text-slate-500">Past returned or rejected borrowing records for this member</p>
        </div>

        {borrowing_history.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center text-slate-400 text-xs italic shadow-xs">
            No historical borrowing records found.
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full max-w-[800px] text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-4 px-6">Book</th>
                    <th className="py-4 px-4">Borrowed</th>
                    <th className="py-4 px-4">Returned</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-6 text-right">Fine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {borrowing_history.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{b.book?.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        {b.borrowed_at ? new Date(b.borrowed_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-slate-500">
                        {b.returned_at ? new Date(b.returned_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        ${b.fine_amount ? parseFloat(b.fine_amount).toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
