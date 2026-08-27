import { Link } from 'react-router-dom';
import { ArrowRight, Clock, CheckCircle2, Inbox } from 'lucide-react';

export default function RecentRequestsTable({ requests = [] }) {
  const displayRequests = requests.slice(0, 3);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 lg:p-4 space-y-2 shadow-2xs h-[155px] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 shrink-0">
        <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight uppercase flex items-center gap-1.5">
          <Inbox className="w-4 h-4 text-amber-600 shrink-0" />
          Recent Borrow Requests
        </h3>

        <Link
          to="/librarian/borrow-requests"
          className="text-[10px] font-black text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors group shrink-0"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Table Content */}
      {displayRequests.length === 0 ? (
        <div className="flex-1 text-center text-[10px] text-slate-400 font-medium italic bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center gap-1.5 min-h-0">
          <CheckCircle2 className="w-4 h-4 text-slate-300" />
          <span>No pending borrow requests.</span>
        </div>
      ) : (
        <div className="overflow-hidden flex-1 min-h-0">
          <table className="w-full min-w-full max-w-[800px] text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-1 px-1.5">Member</th>
                <th className="py-1 px-1.5">Book</th>
                <th className="py-1 px-1.5">Status</th>
                <th className="py-1 px-1.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {displayRequests.map((req) => {
                const rawStatus = (req.status || 'pending').toLowerCase();
                let statusLabel = 'Pending';
                let statusStyle = 'bg-amber-50 text-amber-900 border-amber-200';
                
                if (rawStatus === 'returned') {
                  statusLabel = 'Returned';
                  statusStyle = 'bg-slate-100 text-slate-700 border-slate-200';
                } else if (rawStatus === 'approved') {
                  statusLabel = 'Approved';
                  statusStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                } else if (rawStatus === 'borrowed' || rawStatus === 'picked_up') {
                  statusLabel = 'Borrowed';
                  statusStyle = 'bg-blue-50 text-blue-800 border-blue-200';
                }

                return (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1.5 px-1.5 font-bold text-slate-900 truncate max-w-[120px]">
                      {req.user?.name || 'Member'}
                    </td>
                    <td className="py-1.5 px-1.5 text-slate-700 truncate max-w-[140px]">
                      {req.book?.title || 'Book'}
                    </td>
                    <td className="py-1.5 px-1.5">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${statusStyle}`}>
                        <Clock className="w-2.5 h-2.5" />
                        {statusLabel}
                      </span>
                    </td>
                    <td className="py-1.5 px-1.5 text-right">
                      <Link
                        to={`/librarian/borrow-requests/${req.id}`}
                        className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-bold text-[10px] rounded shadow-2xs transition-all inline-block"
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
      )}
    </div>
  );
}
