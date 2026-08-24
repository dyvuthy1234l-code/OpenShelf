import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, RefreshCw, BookOpen } from 'lucide-react';
import publicService from '../../services/publicService';
import BookCard from './BookCard';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function LibraryTopRatedBooks({ libraryId, libraryName }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopRatedBooks = useCallback(async () => {
    if (!libraryId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await publicService.getBooks({
        library_id: libraryId,
        sort: 'top_rated',
        per_page: 8,
      });

      const rawList = res.data || [];

      // Filter books belonging to current library with at least 1 rating
      const ratedBooks = rawList
        .filter((b) => {
          const bookLibId = b.library_id ?? b.library?.id;
          return String(bookLibId) === String(libraryId);
        })
        .filter((b) => {
          const avg = Number(b.reviews_avg_rating) || 0;
          const count = Number(b.reviews_count) || 0;
          return count > 0 && avg > 0;
        });

      // Sort by Average Rating DESC, then Rating Count DESC
      ratedBooks.sort((a, b) => {
        const avgA = Number(a.reviews_avg_rating) || 0;
        const avgB = Number(b.reviews_avg_rating) || 0;
        if (avgB !== avgA) return avgB - avgA;
        const countA = Number(a.reviews_count) || 0;
        const countB = Number(b.reviews_count) || 0;
        return countB - countA;
      });

      setBooks(ratedBooks.slice(0, 8));
    } catch {
      setError('Unable to load top-rated books.');
    } finally {
      setLoading(false);
    }
  }, [libraryId]);

  useEffect(() => {
    fetchTopRatedBooks();
  }, [fetchTopRatedBooks]);

  return (
    <section className="space-y-6 pt-4 border-t border-slate-200/80">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs flex flex-col animate-pulse"
            >
              <div className="relative aspect-[4/5] w-full bg-slate-200/80 shrink-0" />
              <div className="p-4 space-y-3">
                <div className="h-3.5 bg-slate-100 rounded-md w-3/4" />
                <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                <div className="h-7 bg-slate-100 rounded-xl w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className="bg-rose-50/60 border border-rose-200/90 rounded-2xl p-6 text-center space-y-3 max-w-md mx-auto">
          <p className="text-xs font-bold text-rose-800">{error}</p>
          <button
            type="button"
            onClick={fetchTopRatedBooks}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : books.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-2 shadow-2xs max-w-lg mx-auto">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-1">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900">No rated books yet.</h3>
          <p className="text-xs text-slate-500">Books will appear here once members rate them.</p>
        </div>
      ) : (
        /* Standard BookCard Grid — matches homepage style */
        <motion.div
          key={books.length}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {books.map((book) => (
            <motion.div key={book.id} variants={itemVariants}>
              <BookCard book={book} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}


