import { Link } from 'react-router-dom';
import { Eye, CheckCircle2, XCircle, Clock, BookOpen, User, RefreshCw } from 'lucide-react';

export default function BorrowRequestTable({ borrowings = [], onApprove, onReject, onPickup }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="os-badge-warning uppercase">🟡 Pending</span>;
      case 'approved':
        return <span className="os-badge-info uppercase">🔵 Approved</span>;
      case 'borrowed':
      case 'picked_up':
        return <span className="os-badge-success uppercase">🟢 Borrowed</span>;
      case 'overdue':
        return <span className="os-badge-danger uppercase">🔴 Overdue</span>;
      case 'return_requested':
        return <span className="os-badge-warning uppercase">🟡 Return Requested</span>;
      case 'returned':
        return <span className="os-badge-info uppercase">⚪ Returned</span>;
      case 'rejected':
        return <span className="os-badge-danger uppercase">❌ Rejected</span>;
      default:
        return <span className="os-badge-info uppercase">{status}</span>;
    }
  };

  return (
    <div className="os-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full max-w-[800px] text-left text-xs">
          <thead>
            <tr className="bg-navy-50/60 border-b border-brand-border/60 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <th className="py-4 px-6">Member</th>
              <th className="py-4 px-4">Book</th>
              <th className="py-4 px-4">Requested Date</th>
              <th className="py-4 px-4">Due Date</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-center">Availability</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="font-medium text-slate-800">
            {borrowings.map((req) => {
              const isAvailable = (req.book?.available_quantity ?? 0) > 0;

              return (
                <tr key={req.id} className="border-b border-slate-100 hover:bg-navy-50/40 transition-colors">
                  {/* Member */}
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gold-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
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
                      <BookOpen className="w-4 h-4 text-gold-600 shrink-0" />
                      <div>
                        <Link
                          to={`/librarian/borrow-requests/${req.id}`}
                          className="hover:text-gold-600 transition-colors truncate max-w-[170px] block font-extrabold"
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
                      className={`os-badge-${isAvailable ? 'success' : 'danger'}`}
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
                          className="os-btn-gold h-8 px-3 text-[11px] font-bold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReject(req)}
                          className="os-btn-danger h-8 px-3 text-[11px] font-bold"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {req.status === 'approved' && (
                      <button
                        onClick={() => onPickup(req)}
                        className="os-btn-primary h-8 px-3 text-[11px] font-bold"
                      >
                        Confirm Pickup
                      </button>
                    )}

                    <Link
                      to={`/librarian/borrow-requests/${req.id}`}
                      className="os-btn-secondary h-8 px-3 text-[11px] font-bold"
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
