import { useMemo } from 'react';
import { AlertTriangle, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OverdueReport({ borrowings = [] }) {
  const overdueList = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return borrowings.filter((b) => {
      if (b.status === 'overdue') return true;
      if (['borrowed', 'picked_up'].includes(b.status) && b.due_date) {
        const due = new Date(b.due_date);
        due.setHours(0, 0, 0, 0);
        return today > due;
      }
      return false;
    });
  }, [borrowings]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-rose-700">
            Overdue Loans Report
          </h3>
          <p className="text-xs text-slate-500">Active loans that have exceeded their designated due date</p>
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3.5 h-3.5" />
          {overdueList.length} Overdue
        </span>
      </div>

      {overdueList.length === 0 ? (
        <div className="py-8 text-center text-xs text-emerald-700 font-bold bg-emerald-50 rounded-2xl border border-emerald-200">
          ✓ No overdue loans in your library catalogue.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-center">Days Overdue</th>
                <th className="py-3 px-4 text-right">Fine</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {overdueList.map((b) => {
                let daysOverdue = 0;
                if (b.due_date) {
                  const due = new Date(b.due_date);
                  const today = new Date();
                  due.setHours(0, 0, 0, 0);
                  today.setHours(0, 0, 0, 0);
                  if (today > due) {
                    daysOverdue = Math.ceil((today - due) / (1000 * 60 * 60 * 24));
                  }
                }

                return (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{b.user?.name || 'Member'}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{b.book?.title || 'Book'}</td>
                    <td className="py-3 px-4 text-rose-700 font-bold">{b.due_date ? new Date(b.due_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-3 px-4 text-center font-extrabold text-rose-600">{daysOverdue} days</td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      ${b.fine_amount ? parseFloat(b.fine_amount).toFixed(2) : '0.00'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/librarian/returns/${b.id}`}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-lg shadow-xs transition-colors inline-block"
                      >
                        Process Return
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
