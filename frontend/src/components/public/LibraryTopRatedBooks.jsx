import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight, CheckCircle2, XCircle, RefreshCw, BookOpen } from 'lucide-react';
import publicService from '../../services/publicService';
import getImageUrl from '../../utils/imageUrl';

export default function LibraryTopRatedBooks({ libraryId, libraryName }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSlowed, setIsSlowed] = useState(false);

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

      // Filter books strictly belonging to current library with at least 1 rating
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

      // Take up to 10 books for this library
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

  // Duplicate books array for infinite seamless scrolling marquee loop
  const duplicatedBooks = useMemo(() => {
    if (books.length === 0) return [];
    let list = [...books];
    while (list.length < 8) {
      list = [...list, ...books];
    }
    return [...list, ...list];
  }, [books]);

  // Dynamic animation duration based on items length & hover state
  const animDuration = isSlowed ? 90 : Math.max(25, duplicatedBooks.length * 3);

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
            <div
              key={i}
              className="w-48 sm:w-56 shrink-0 bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3 shadow-2xs animate-pulse"
            >
              <div className="w-full h-36 bg-slate-100 rounded-xl" />
              <div className="h-3.5 bg-slate-100 rounded-md w-3/4" />
              <div className="h-3 bg-slate-100 rounded-md w-1/2" />
              <div className="h-7 bg-slate-100 rounded-xl w-full" />
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
        /* Compact Empty State */
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center space-y-2 shadow-2xs max-w-lg mx-auto">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-1">
            <Star className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900">No rated books yet.</h3>
          <p className="text-xs text-slate-500">Books will appear here once members rate them.</p>
        </div>
      ) : (
        /* Infinite Marquee Track Running Right to Left */
        <div className="relative w-full overflow-hidden py-2 select-none">
          {/* Edge Fade Gradients */}
          <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

          <div
            className="w-full overflow-hidden"
            onMouseEnter={() => setIsSlowed(true)}
            onMouseLeave={() => setIsSlowed(false)}
          >
            <motion.div
              className="flex items-center gap-4 w-max"
              animate={{ x: ['0%', '-50%'] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: animDuration,
                  ease: 'linear',
                },
              }}
            >
              {duplicatedBooks.map((book, idx) => {
                const isAvailable = (book.available_quantity ?? book.quantity ?? 0) > 0;
                const avgRating = Number(book.reviews_avg_rating) || 0;
                const ratingCount = Number(book.reviews_count) || 0;

                return (
                  <div
                    key={`${book.id}-${idx}`}
                    className="w-48 sm:w-56 shrink-0 group bg-white border border-slate-200/90 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col h-[340px]"
                  >
                    {/* Compact Book Cover Container */}
                    <div className="relative h-40 bg-slate-100/80 overflow-hidden shrink-0 flex items-center justify-center p-3">
                      {getImageUrl(book.cover_image_url || book.cover_image) ? (
                        <img
                          src={getImageUrl(book.cover_image_url || book.cover_image)}
                          alt={book.title}
                          className="h-full w-auto max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-20 h-28 bg-gradient-to-tr from-slate-200 via-white to-slate-100 border border-slate-300/80 rounded-lg shadow-2xs flex flex-col items-center justify-center p-2 text-center">
                          <BookOpen className="w-6 h-6 text-amber-600/70 mb-1" />
                          <span className="text-[9px] text-slate-700 font-semibold line-clamp-2 leading-snug">
                            {book.title}
                          </span>
                        </div>
                      )}

                      {/* Category Overlay Tag */}
                      {book.category?.name && (
                        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-2xs truncate max-w-[120px]">
                          {book.category.name}
                        </div>
                      )}

                      {/* Rating Badge Overlay */}
                      <div className="absolute bottom-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md text-amber-400 border border-slate-800 px-2 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 shadow-2xs">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                        <span>{avgRating.toFixed(1)}</span>
                        <span className="text-[9px] text-slate-300 font-normal">({ratingCount})</span>
                      </div>
                    </div>

                    {/* Compact Info Container */}
                    <div className="p-3.5 flex flex-col flex-grow bg-white space-y-2">
                      <div>
                        <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                          {book.title}
                        </h3>
                        {book.author && (
                          <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                            By {book.author}
                          </p>
                        )}
                      </div>

                      {/* Availability Badge */}
                      <div>
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-[10px] font-bold">
                            <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                            Out of Stock
                          </span>
                        )}
                      </div>

                      {/* View Details Action Button */}
                      <Link
                        to={`/books/${book.id}`}
                        className="mt-auto pt-1 inline-flex items-center justify-between w-full py-2 px-3 bg-slate-50 hover:bg-amber-500 hover:text-slate-950 text-slate-700 text-[11px] font-bold rounded-xl border border-slate-200 hover:border-amber-500 transition-all duration-200 group/btn cursor-pointer"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform shrink-0" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      )}
    </section>
  );
}
