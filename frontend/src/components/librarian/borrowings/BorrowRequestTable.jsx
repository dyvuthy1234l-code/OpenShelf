import { Link } from 'react-router-dom';
import { Eye, CheckCircle2, XCircle, Clock, BookOpen, User, RefreshCw } from 'lucide-react';

export default function BorrowRequestTable({ borrowings = [], onApprove, onReject, onPickup }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-300">🟡 Pending</span>;
      case 'approved':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200">🔵 Approved</span>;
      case 'borrowed':
      case 'picked_up':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 Borrowed</span>;
      case 'overdue':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">🔴 Overdue</span>;
      case 'return_requested':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">🟡 Return Requested</span>;
      case 'returned':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">⚪ Returned</span>;
      case 'rejected':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-50 text-rose-600 border border-rose-100">❌ Rejected</span>;
      default:
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full max-w-[800px] text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-4 px-6">Member</th>
              <th className="py-4 px-4">Book</th>
              <th className="py-4 px-4">Requested Date</th>
              <th className="py-4 px-4">Due Date</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-center">Availability</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {borrowings.map((req) => {
              const isAvailable = (req.book?.available_quantity ?? 0) > 0;

              return (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Member */}
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                        {req.user?.avatar_url || req.user?.avatar ? (
                          <img src={req.user.avatar_url || req.user.avatar} alt={req.user?.name} className="w-full h-full object-cover" />
                        ) : (
                          req.user?.name ? req.user.name[0].toUpperCase() : 'M'
                        )}
                      </div>
                      <div>
                        <span className="truncate max-w-[130px] block">{req.user?.name || 'Member'}</span>
                        <span className="text-[10px] text-slate-400 font-normal truncate max-w-[130px] block">{req.user?.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Book */}
                  <td className="py-4 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <Link
                          to={`/librarian/borrow-requests/${req.id}`}
                          className="hover:text-amber-700 transition-colors truncate max-w-[170px] block font-extrabold"
                        >
                          {req.book?.title || 'Book Title'}
                        </Link>
                        {req.book?.isbn && <span className="text-[10px] text-slate-400 font-mono">ISBN: {req.book.isbn}</span>}
                      </div>
                    </div>
                  </td>

                  {/* Requested Date */}
                  <td className="py-4 px-4 text-slate-500 font-medium">
                    {req.created_at || req.requested_at ? new Date(req.created_at || req.requested_at).toLocaleDateString() : 'N/A'}
                  </td>

                  {/* Due Date */}
                  <td className="py-4 px-4 text-slate-700 font-bold">
                    {req.due_date ? new Date(req.due_date).toLocaleDateString() : '—'}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    {getStatusBadge(req.status)}
                  </td>

                  {/* Copy Availability */}
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                        isAvailable
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : 'text-rose-700 bg-rose-50 border border-rose-200'
                      }`}
                    >
                      {req.book?.available_quantity ?? 0} left
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right space-x-1.5">
                    {req.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onApprove(req)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-lg shadow-xs transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(req)}
                          className="px-3 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {req.status === 'approved' && (
                      <button
                        onClick={() => onPickup(req)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors"
                      >
                        Confirm Pickup
                      </button>
                    )}

                    <Link
                      to={`/librarian/borrow-requests/${req.id}`}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors inline-block"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
