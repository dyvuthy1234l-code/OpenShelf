import { Link } from 'react-router-dom';
import { ArrowRight, Inbox, BookOpen, User, Clock } from 'lucide-react';

export default function RecentRequests({ requests = [] }) {
  if (requests.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-extrabold text-slate-900">Recent Borrow Requests</h3>
          <Link to="/librarian/borrow-requests" className="text-xs font-bold text-amber-700 hover:text-amber-800">
            View All Requests →
          </Link>
        </div>

        <div className="py-8 text-center text-slate-400 text-xs italic space-y-2">
          <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
          <p>No borrow requests yet. Requests from members will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Recent Borrow Requests</h3>
          <p className="text-xs text-slate-500 mt-0.5">Latest requests requiring library approval</p>
        </div>

        <Link
          to="/librarian/borrow-requests"
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
        >
          <span>View All Requests</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="pb-3 pr-4">Member</th>
              <th className="pb-3 px-4">Book</th>
              <th className="pb-3 px-4">Requested Date</th>
              <th className="pb-3 px-4">Status</th>
              <th className="pb-3 pl-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 pr-4 font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {req.user?.name ? req.user.name[0].toUpperCase() : 'M'}
                    </div>
                    <span className="truncate max-w-[120px]">{req.user?.name || 'Member'}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-semibold text-slate-800">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate max-w-[160px]">{req.book?.title || 'Book Title'}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-slate-500 font-medium">
                  {req.created_at || req.requested_at ? new Date(req.created_at || req.requested_at).toLocaleDateString() : 'N/A'}
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      req.status === 'return_requested'
                        ? 'bg-amber-50 text-amber-800 border border-amber-300'
                        : req.status === 'pending'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {req.status === 'return_requested' ? 'Return Requested' : req.status}
                  </span>
                </td>

                <td className="py-3.5 pl-4 text-right">
                  <Link
                    to="/librarian/borrow-requests"
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors inline-block"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
