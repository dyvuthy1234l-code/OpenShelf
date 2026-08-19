import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LowStockAlert({ lowStockBooks = [] }) {
  if (lowStockBooks.length === 0) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-3xl p-5 text-xs text-emerald-900 flex items-center justify-between gap-4 font-semibold shadow-xs">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>All books have healthy physical copy availability.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/90 border border-amber-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
        <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h4>Low Availability Alert</h4>
        </div>
        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
          {lowStockBooks.length} {lowStockBooks.length === 1 ? 'Book' : 'Books'}
        </span>
      </div>

      <div className="space-y-2.5">
        {lowStockBooks.map((book) => (
          <div
            key={book.id}
            className="bg-white/90 border border-amber-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs"
          >
            <div className="min-w-0">
              <h5 className="font-extrabold text-slate-900 truncate">{book.title}</h5>
              {book.author && <p className="text-[11px] text-slate-500 truncate">By {book.author}</p>}
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                (book.available_quantity ?? 0) === 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {(book.available_quantity ?? 0) === 0 ? '0 Copies (Out)' : '1 Copy Left'}
              </span>

              <Link
                to="/librarian/books"
                className="text-amber-700 hover:text-amber-800 font-bold text-[11px] flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
