import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function RecentReturnsSection({ returns = [] }) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-700 block">
            Return History
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Recent Returns
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Recently processed volume returns</p>
        </div>

        <Link
          to="/librarian/returns"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 font-bold text-xs rounded-xl border border-slate-200/80 transition-all shrink-0"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {returns.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 font-medium italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          No returned books recorded yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {returns.slice(0, 4).map((ret) => (
            <div key={ret.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="font-extrabold text-slate-900 text-xs truncate block">
                  {ret.book?.title || 'Book Title'}
                </span>
                <p className="text-[11px] text-slate-500 truncate">
                  By {ret.user?.name || 'Member'} • {ret.returned_at ? new Date(ret.returned_at).toLocaleDateString() : 'Returned'}
                </p>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                Returned
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
