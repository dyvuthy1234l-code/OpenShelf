import { Link } from 'react-router-dom';
import { BookOpen, Eye, Edit3, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function BookCard({ book, onEdit, onDelete }) {
  const isAvailable = (book.available_quantity ?? 0) > 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-start gap-3">
        <div className="w-14 h-20 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
          {book.cover_image_url ? (
            <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="w-6 h-6 text-amber-600/60" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          {book.category?.name && (
            <span className="inline-block text-[9px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {book.category.name}
            </span>
          )}

          <Link
            to={`/librarian/books/${book.id}`}
            className="font-extrabold text-slate-900 hover:text-amber-700 text-sm block truncate"
          >
            {book.title}
          </Link>

          <p className="text-xs text-slate-500 truncate">By {book.author || 'Unknown'}</p>
          {book.isbn && <p className="text-[10px] text-slate-400 font-mono">ISBN: {book.isbn}</p>}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">{book.quantity ?? 1} total</span>
          <span className="text-slate-300">•</span>
          <span className={`font-bold flex items-center gap-1 ${isAvailable ? 'text-emerald-700' : 'text-rose-600'}`}>
            {isAvailable ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {isAvailable ? `${book.available_quantity} avail` : 'Out of Stock'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Link
            to={`/librarian/books/${book.id}`}
            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onEdit(book)}
            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(book)}
            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
