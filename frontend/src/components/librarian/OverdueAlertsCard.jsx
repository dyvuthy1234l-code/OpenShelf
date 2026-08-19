import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function OverdueAlertsCard({ overdueList = [], overdueCount = 0 }) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 lg:p-5 space-y-3 shadow-2xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
        <div>
          <span className="text-[9px] uppercase font-extrabold tracking-widest text-rose-700 block">
            Operational Alerts
          </span>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight flex items-center gap-1.5">
            Overdue Loans ({overdueCount})
          </h3>
        </div>

        <Link
          to="/librarian/returns?status=overdue"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-900 transition-colors shrink-0"
        >
          <span>Manage Returns</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Content */}
      {overdueList.length === 0 ? (
        <div className="py-6 text-center text-[11px] font-medium text-emerald-800 bg-emerald-50/70 rounded-xl border border-emerald-200/70 flex flex-col items-center justify-center space-y-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-0.5" />
          <span className="font-extrabold">All borrowings are in good standing!</span>
          <span className="text-[10px] text-emerald-700 font-semibold">No overdue books at this time.</span>
        </div>
      ) : (
        <div className="space-y-2 flex-1 overflow-y-auto">
          {overdueList.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="p-2.5 bg-rose-50/50 border border-rose-200/60 rounded-xl flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0 space-y-0.5">
                <span className="font-extrabold text-slate-900 truncate block text-[11px]">
                  {item.book?.title || 'Book'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium truncate block">
                  Borrowed by {item.user?.name || 'Member'}
                </span>
              </div>

              <div className="shrink-0 text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  Due {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'Overdue'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
