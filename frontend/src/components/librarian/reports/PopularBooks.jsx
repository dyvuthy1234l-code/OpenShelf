import { useMemo } from 'react';
import { BookOpen, BookMarked } from 'lucide-react';

export default function PopularBooks({ borrowings = [], reportData = null }) {
  const popularBooks = useMemo(() => {
    // 1. Check if backend provided popular_books array
    if (reportData?.popular_books && Array.isArray(reportData.popular_books) && reportData.popular_books.length > 0) {
      return reportData.popular_books.slice(0, 4);
    }

    // 2. Compute from borrowings prop / reportData.borrowing_history
    const history = borrowings.length > 0 ? borrowings : (reportData?.borrowing_history || []);
    if (!history || !history.length) return [];

    const counts = {};
    const details = {};

    history.forEach((b) => {
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
      .slice(0, 4);
  }, [borrowings, reportData]);

  // Rank badge styling helper
  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'bg-amber-500 text-white border-amber-600 shadow-xs font-black';
    if (rank === 2) return 'bg-slate-300 text-slate-800 border-slate-400 font-extrabold';
    if (rank === 3) return 'bg-amber-700/80 text-white border-amber-800 font-extrabold';
    return 'bg-slate-100 text-slate-600 border-slate-200/80 font-bold';
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 lg:p-5 shadow-2xs h-[250px] min-h-[250px] flex flex-col justify-between">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-1 shrink-0">
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight leading-tight uppercase flex items-center gap-2">
            TOP BORROWED BOOKS
          </h3>
          <p className="text-[10.5px] font-medium text-slate-400 mt-0.5">
            Most borrowed books in this period.
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
          <BookMarked className="w-4 h-4" />
        </div>
      </div>

      {/* Main List Content (Top 4 Items) */}
      {popularBooks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-xs text-slate-400 font-medium italic bg-slate-50 rounded-xl border border-dashed border-slate-200 my-1">
          No book borrowing activity recorded.
        </div>
      ) : (
        <div className="space-y-1.5 flex-1 min-h-0 flex flex-col justify-center">
          {popularBooks.map((book, idx) => {
            const count = book.borrow_count || book.borrows_count || 1;
            const rank = idx + 1;

            return (
              <div
                key={book.id || idx}
                className="flex items-center justify-between gap-3 text-xs p-2 rounded-xl hover:bg-slate-50/90 transition-all border border-transparent hover:border-slate-200/70"
              >
                {/* Left: Rank + Cover + Title */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Rank Badge */}
                  <span className={`w-5 h-5 rounded-md border text-[10px] flex items-center justify-center shrink-0 leading-none ${getRankBadgeClass(rank)}`}>
                    #{rank}
                  </span>

                  {/* Cover Image or Fallback Icon */}
                  {book.cover_image_url || book.cover_image ? (
                    <img
                      src={book.cover_image_url || book.cover_image}
                      alt={book.title}
                      className="w-6 h-7 object-cover rounded border border-slate-200 shadow-2xs shrink-0"
                    />
                  ) : (
                    <div className="w-6 h-7 rounded bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0 text-amber-600">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {/* Title */}
                  <span className="font-bold text-slate-900 truncate text-xs" title={book.title}>
                    {book.title}
                  </span>
                </div>

                {/* Right: Borrow Count Pill */}
                <div className="shrink-0">
                  <span className="inline-flex items-center text-[10.5px] font-extrabold text-slate-700 bg-slate-100/90 border border-slate-200/70 px-2.5 py-1 rounded-lg">
                    {count} {count === 1 ? 'borrow' : 'borrows'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
