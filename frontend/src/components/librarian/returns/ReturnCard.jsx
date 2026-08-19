import { Link } from 'react-router-dom';
import { BookOpen, User, Calendar, CheckCircle2 } from 'lucide-react';

export default function ReturnCard({ borrowing, onConfirmReturn }) {
  const canReturn = borrowing.status !== 'returned';

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
              {borrowing.user?.avatar_url || borrowing.user?.avatar ? (
                <img src={borrowing.user.avatar_url || borrowing.user.avatar} alt={borrowing.user?.name} className="w-full h-full object-cover" />
              ) : (
                borrowing.user?.name ? borrowing.user.name[0].toUpperCase() : 'M'
              )}
            </div>
            <span className="font-extrabold text-xs text-slate-900 truncate max-w-[130px]">{borrowing.user?.name}</span>
          </div>

          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
            borrowing.status === 'return_requested' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-700'
          }`}>
            {borrowing.status}
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 space-y-1 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <Link to={`/librarian/returns/${borrowing.id}`} className="hover:text-amber-700 truncate">
              {borrowing.book?.title}
            </Link>
          </div>
          {borrowing.book?.isbn && <p className="text-[10px] text-slate-400 font-mono">ISBN: {borrowing.book.isbn}</p>}
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-500">
          <span>Due: {borrowing.due_date ? new Date(borrowing.due_date).toLocaleDateString() : 'N/A'}</span>
          <span className="font-bold text-slate-900">
            {borrowing.fine_amount > 0 ? `$${borrowing.fine_amount} Fine` : 'No Fine'}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
        {canReturn && (
          <button
            onClick={() => onConfirmReturn(borrowing)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Confirm Return
          </button>
        )}

        <Link
          to={`/librarian/returns/${borrowing.id}`}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
        >
          Review
        </Link>
      </div>
    </div>
  );
}
