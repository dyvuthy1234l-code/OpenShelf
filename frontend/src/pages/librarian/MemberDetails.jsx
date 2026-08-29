import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Mail, Phone, Calendar, BookOpen, AlertTriangle, 
  CheckCircle2, Clock, DollarSign, User, ShieldAlert, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PAGE_MOTION_VARIANTS, LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';
import librarianService from '../../services/librarianService';
import { DetailSkeleton } from '../../components/librarian/common/Skeleton';

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
        setError('Member profile not found or you do not have permission to view this profile.');
      } else {
        setError(err.response?.data?.message || 'Unable to load member profile details.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMemberDetails();
  }, [fetchMemberDetails]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !data || !data.member) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
        <div className="w-14 h-14 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center shadow-2xs">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 font-display">Access Restricted</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">{error}</p>
        </div>
        <Link
          to="/librarian/members"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Members Directory</span>
        </Link>
      </div>
    );
  }

  const { member, stats, current_borrowings = [], borrowing_history = [] } = data;

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="w-full space-y-6 pb-12 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
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

      {/* Member Profile Header Card - Full Width */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-2xl flex items-center justify-center shrink-0 shadow-md overflow-hidden border-2 border-white">
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
        <motion.div variants={LIST_STAGGER} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <motion.div variants={LIST_ITEM} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Borrowed</span>
            <span className="text-2xl font-extrabold text-slate-900">{stats.total_borrowed}</span>
          </motion.div>

          <motion.div variants={LIST_ITEM} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Active Loans</span>
            <span className="text-2xl font-extrabold text-slate-900">{stats.active_count}</span>
          </motion.div>

          <motion.div variants={LIST_ITEM} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Overdue Books</span>
            <span className={`text-2xl font-extrabold ${stats.overdue_count > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {stats.overdue_count}
            </span>
          </motion.div>

          <motion.div variants={LIST_ITEM} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Fines</span>
            <span className={`text-2xl font-extrabold ${stats.total_fines > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
              ${parseFloat(stats.total_fines || 0).toFixed(2)}
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Active Borrowings Section - Full Width */}
      <div className="space-y-3.5 w-full">
        <div className="border-b border-slate-200/80 pb-2.5">
          <h3 className="text-base font-extrabold text-slate-900">Active Borrowings & Requests</h3>
          <p className="text-xs text-slate-500">Books currently requested or checked out by {member.name} in your library</p>
        </div>

        {current_borrowings.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center text-slate-400 text-xs italic shadow-2xs w-full">
            No active borrowings or pending requests for this member.
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs w-full">
            <div className="overflow-x-auto scrollbar-thin w-full">
              <table className="w-full text-left text-xs align-middle border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                    <th className="py-3.5 px-5 w-[40%]">Book</th>
                    <th className="py-3.5 px-4 w-[18%]">Requested</th>
                    <th className="py-3.5 px-4 w-[18%]">Due Date</th>
                    <th className="py-3.5 px-4 w-[12%]">Status</th>
                    <th className="py-3.5 px-5 w-[12%] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {current_borrowings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-5 font-bold text-slate-900 whitespace-nowrap min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="truncate block font-extrabold" title={b.book?.title}>{b.book?.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {b.requested_at || b.created_at ? new Date(b.requested_at || b.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {b.due_date ? new Date(b.due_date).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-300">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right whitespace-nowrap">
                        <Link
                          to={`/librarian/borrow-requests/${b.id}`}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl transition-colors inline-block"
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

      {/* Borrowing History Section - Full Width */}
      <div className="space-y-3.5 w-full">
        <div className="border-b border-slate-200/80 pb-2.5">
          <h3 className="text-base font-extrabold text-slate-900">Borrowing History</h3>
          <p className="text-xs text-slate-500">Past returned or rejected borrowing records for this member</p>
        </div>

        {borrowing_history.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center text-slate-400 text-xs italic shadow-2xs w-full">
            No historical borrowing records found.
          </div>
        ) : (
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs w-full">
            <div className="overflow-x-auto scrollbar-thin w-full">
              <table className="w-full text-left text-xs align-middle border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                    <th className="py-3.5 px-5 w-[38%]">Book</th>
                    <th className="py-3.5 px-4 w-[18%]">Borrowed</th>
                    <th className="py-3.5 px-4 w-[18%]">Returned</th>
                    <th className="py-3.5 px-4 w-[14%]">Status</th>
                    <th className="py-3.5 px-5 w-[12%] text-right">Fine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {borrowing_history.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-5 font-bold text-slate-900 whitespace-nowrap min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate block font-extrabold" title={b.book?.title}>{b.book?.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {b.borrowed_at ? new Date(b.borrowed_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {b.returned_at ? new Date(b.returned_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right font-bold text-slate-900 whitespace-nowrap">
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
