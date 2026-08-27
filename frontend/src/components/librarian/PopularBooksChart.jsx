import { useMemo } from 'react';
import { Award, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PopularBooksChart({ borrowings = [] }) {
  const popularBooks = useMemo(() => {
    const counts = {};
    const details = {};

    borrowings.forEach((b) => {
      if (!b.book || !b.book.id) return;
      const id = b.book.id;
      counts[id] = (counts[id] || 0) + 1;
      if (!details[id]) {
        details[id] = b.book;
      }
    });

    return Object.keys(counts)
      .map((id) => ({
        ...details[id],
        borrow_count: counts[id],
      }))
      .sort((a, b) => b.borrow_count - a.borrow_count)
      .slice(0, 3);
  }, [borrowings]);

  const maxCount = useMemo(() => {
    if (!popularBooks.length) return 1;
    return Math.max(...popularBooks.map((b) => b.borrow_count), 1);
  }, [popularBooks]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 lg:p-3 space-y-1.5 shadow-2xs h-full min-h-0 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
        <div className="flex flex-col min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-600 shrink-0" />
            <h3 className="text-xs font-black text-slate-900 tracking-tight leading-none uppercase">
              Popular Books
            </h3>
          </div>
          <p className="text-[10px] font-medium text-slate-500 leading-none">
            Top 3 most borrowed books.
          </p>
        </div>
      </div>

      {/* Content */}
      {popularBooks.length === 0 ? (
        <div className="flex-1 text-center text-[11px] text-slate-400 font-medium italic bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-1 min-h-0">
          <BookOpen className="w-5 h-5 text-slate-300" />
          <span>No borrowing data available yet.</span>
        </div>
      ) : (
        <div className="space-y-2.5 flex-1 flex flex-col justify-center min-h-0">
          {popularBooks.map((book, idx) => {
            const pct = Math.round((book.borrow_count / maxCount) * 100);

            return (
              <motion.div
                key={book.id || idx}
                initial={{ opacity: 0.4, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="group space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Rank Badge */}
                    <span className="w-5 h-5 rounded-md bg-amber-100 border border-amber-300 text-amber-950 font-black text-[10px] flex items-center justify-center shrink-0 shadow-2xs">
                      #{idx + 1}
                    </span>

                    {/* Book Cover Image */}
                    {book.cover_image_url ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        onError={(e) => { e.target.style.display = 'none'; }}
                        className="w-7 h-9 object-cover rounded border border-slate-200/80 shadow-2xs shrink-0 group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-7 h-9 rounded bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                    )}

                    {/* Book Title */}
                    <div className="min-w-0 space-y-0">
                      <Link
                        to={`/librarian/books/${book.id}`}
                        className="font-extrabold text-xs text-slate-900 group-hover:text-amber-600 truncate block transition-colors leading-snug"
                        title={book.title}
                      >
                        {book.title}
                      </Link>
                      {book.author && (
                        <span className="text-[10px] text-slate-500 font-medium truncate block">
                          by {book.author}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Borrow Count Badge */}
                  <span className="font-extrabold text-slate-800 text-[10px] px-2 py-0.5 bg-slate-100 rounded border border-slate-200/80 shrink-0">
                    {book.borrow_count} {book.borrow_count === 1 ? 'Borrow' : 'Borrows'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                  <div
                    style={{ width: `${Math.max(pct, 8)}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-300 shadow-2xs"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
