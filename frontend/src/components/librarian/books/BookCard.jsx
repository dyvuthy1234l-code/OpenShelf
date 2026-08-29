import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Eye, Edit3, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { CARD_MOTION_PROPS } from '../../../constants/motionTokens';

export default function BookCard({ book, onEdit, onDelete }) {
  const isAvailable = (book.available_quantity ?? 0) > 0;

  return (
    <motion.div
      {...CARD_MOTION_PROPS}
      className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
    >
      <div className="flex items-start gap-4">
        {/* Prominent Large Book Cover */}
        <div className="w-20 h-28 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
          {book.cover_image_url ? (
            <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <BookOpen className="w-8 h-8 text-amber-600/60" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          {book.category?.name && (
            <span className="inline-block text-[10px] uppercase font-extrabold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/80">
              {book.category.name}
            </span>
          )}

          <Link
            to={`/librarian/books/${book.id}`}
            className="font-extrabold text-slate-900 hover:text-amber-600 text-base block truncate leading-tight"
            title={book.title}
          >
            {book.title}
          </Link>

          <p className="text-xs font-semibold text-slate-600 truncate">By {book.author || 'Unknown'}</p>
          {book.isbn && <p className="text-xs text-slate-400 font-mono">ISBN: {book.isbn}</p>}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900">{book.quantity ?? 1} total</span>
          <span className="text-slate-300">•</span>
          <span className={`font-bold flex items-center gap-1 ${isAvailable ? 'text-emerald-700' : 'text-rose-600'}`}>
            {isAvailable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {isAvailable ? `${book.available_quantity} avail` : 'Out of Stock'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Link
            to={`/librarian/books/${book.id}`}
            title="View Details"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onEdit(book)}
            title="Edit Book"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(book)}
            title="Delete Book"
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
