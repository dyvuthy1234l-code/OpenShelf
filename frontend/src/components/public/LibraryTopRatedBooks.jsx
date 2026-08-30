import { useState, useEffect, useCallback, useMemo } from 'react';
import { Star, RefreshCw } from 'lucide-react';
import publicService from '../../services/publicService';
import BookCard from './BookCard';

export default function LibraryTopRatedBooks({ libraryId, libraryName }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const fetchTopRatedBooks = useCallback(async () => {
    if (!libraryId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await publicService.getBooks({
        library_id: libraryId,
        sort: 'top_rated',
        per_page: 20,
      });

      const rawList = res.data || [];

      // Backend already filters by library_id — filter rated books
      const ratedBooks = rawList.filter((b) => {
        const avg = Number(b.reviews_avg_rating) || 0;
        const count = Number(b.reviews_count) || 0;
        return count > 0 && avg > 0;
      });

      ratedBooks.sort((a, b) => {
        const avgA = Number(a.reviews_avg_rating) || 0;
        const avgB = Number(b.reviews_avg_rating) || 0;
        if (avgB !== avgA) return avgB - avgA;
        const countA = Number(a.reviews_count) || 0;
        const countB = Number(b.reviews_count) || 0;
        return countB - countA;
      });

      setBooks(ratedBooks.slice(0, 10));
    } catch {
      setError('Unable to load top-rated books.');
    } finally {
      setLoading(false);
    }
  }, [libraryId]);

  useEffect(() => {
    fetchTopRatedBooks();
  }, [fetchTopRatedBooks]);

  // Duplicate for seamless infinite marquee
  const duplicatedBooks = useMemo(() => {
    if (books.length === 0) return [];
    let list = [...books];
    while (list.length < 8) list = [...list, ...books];
    return [...list, ...list];
  }, [books]);

  const animDuration = Math.max(25, duplicatedBooks.length * 3.5);

  return (
    <section className="space-y-4 pt-4 border-t border-slate-200/80">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs shrink-0">
            <Star className="w-5 h-5 fill-slate-950 text-slate-950" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Top Rated Books</h2>
            <p className="text-xs text-slate-500">
              Discover the highest-rated books from {libraryName || 'this library'}.
            </p>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="flex items-center gap-4 overflow-hidden py-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-48 sm:w-56 shrink-0 bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3 shadow-2xs animate-pulse">
              <div className="w-full h-48 bg-slate-100 rounded-xl" />
              <div className="h-3.5 bg-slate-100 rounded-md w-3/4" />
              <div className="h-3 bg-slate-100 rounded-md w-1/2" />
              <div className="h-7 bg-slate-100 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50/60 border border-rose-200/90 rounded-2xl p-6 text-center space-y-3 max-w-md mx-auto">
          <p className="text-xs font-bold text-rose-800">{error}</p>
          <button type="button" onClick={fetchTopRatedBooks} className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-2 shadow-2xs max-w-lg mx-auto">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-1">
            <Star className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900">No rated books yet.</h3>
          <p className="text-xs text-slate-500">Books will appear here once members rate them.</p>
        </div>
      ) : (
        /* Marquee — single row scrolling left to right with pause-on-hover & equal height cards */
        <div className="relative w-full overflow-hidden py-2 select-none">
          <style>{`
            @keyframes lib-marquee-scroll-loop {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            .animate-lib-marquee-loop {
              animation: lib-marquee-scroll-loop ${animDuration}s linear infinite;
            }
          `}</style>

          {/* Edge Fades */}
          <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

          <div
            className="w-full overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className="flex items-stretch gap-5 w-max animate-lib-marquee-loop"
              style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
            >
              {duplicatedBooks.map((book, idx) => (
                <div
                  key={`${book.id}-${idx}`}
                  className="w-48 sm:w-56 shrink-0 h-full transition-transform duration-200 hover:scale-[1.02]"
                >
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
