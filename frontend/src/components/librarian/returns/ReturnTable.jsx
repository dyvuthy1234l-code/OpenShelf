import { Link } from 'react-router-dom';
import { CheckCircle2, BookOpen, Clock, AlertTriangle, DollarSign } from 'lucide-react';

export default function ReturnTable({ borrowings = [], onConfirmReturn }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'return_requested':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">🟡 Return Requested</span>;
      case 'overdue':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">🔴 Overdue</span>;
      case 'borrowed':
      case 'picked_up':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 Borrowed</span>;
      case 'returned':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">⚪ Returned</span>;
      default:
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  const getFineBadge = (amount, fineStatus) => {
    if (!amount || parseFloat(amount) === 0) {
      return <span className="text-slate-400 font-semibold text-xs">$0.00</span>;
    }
    const fmt = `$${parseFloat(amount).toFixed(2)}`;
    if (fineStatus === 'paid') {
      return <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">{fmt} (Paid)</span>;
    }
    if (fineStatus === 'waived') {
      return <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">{fmt} (Waived)</span>;
    }
    return <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">{fmt} (Unpaid)</span>;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full max-w-[800px] text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-4 px-6">Member</th>
              <th className="py-4 px-4">Book</th>
              <th className="py-4 px-4">Borrowed Date</th>
              <th className="py-4 px-4">Due Date</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4">Fine</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {borrowings.map((req) => {
              const canReturn = req.status !== 'returned';

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
                          to={`/librarian/returns/${req.id}`}
                          className="hover:text-amber-700 transition-colors truncate max-w-[170px] block font-extrabold"
                        >
                          {req.book?.title || 'Book Title'}
                        </Link>
                        {req.book?.isbn && <span className="text-[10px] text-slate-400 font-mono">ISBN: {req.book.isbn}</span>}
                      </div>
                    </div>
                  </td>

                  {/* Borrowed Date */}
                  <td className="py-4 px-4 text-slate-500 font-medium">
                    {req.borrowed_at || req.picked_up_at ? new Date(req.borrowed_at || req.picked_up_at).toLocaleDateString() : 'N/A'}
                  </td>

                  {/* Due Date */}
                  <td className="py-4 px-4 text-slate-700 font-bold">
                    {req.due_date ? new Date(req.due_date).toLocaleDateString() : '—'}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    {getStatusBadge(req.status)}
                  </td>

                  {/* Fine */}
                  <td className="py-4 px-4">
                    {getFineBadge(req.fine_amount, req.fine_status)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right space-x-1.5">
                    {canReturn && (
                      <button
                        onClick={() => onConfirmReturn(req)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition-colors"
                      >
                        Confirm Return
                      </button>
                    )}

                    <Link
                      to={`/librarian/returns/${req.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors inline-block"
                    >
                      Review
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
