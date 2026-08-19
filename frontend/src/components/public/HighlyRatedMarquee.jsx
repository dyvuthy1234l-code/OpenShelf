import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight, CheckCircle2, XCircle, Building2, BookOpen } from 'lucide-react';
import getImageUrl from '../../utils/imageUrl';

export default function HighlyRatedMarquee({ books = [], loading = false, error = null }) {
  const [isSlowed, setIsSlowed] = useState(false);

  // Filter books with real ratings (> 0) and sort by rating DESC, then count DESC
  const ratedBooks = useMemo(() => {
    if (!books || books.length === 0) return [];
    const list = books.filter((b) => {
      const avg = Number(b.reviews_avg_rating ?? b.rating ?? 0);
      const count = Number(b.reviews_count ?? b.rating_count ?? 0);
      return avg > 0 && count > 0;
    });

    list.sort((a, b) => {
      const avgA = Number(a.reviews_avg_rating ?? a.rating ?? 0);
      const avgB = Number(b.reviews_avg_rating ?? b.rating ?? 0);
      if (avgB !== avgA) return avgB - avgA;

      const countA = Number(a.reviews_count ?? a.rating_count ?? 0);
      const countB = Number(b.reviews_count ?? b.rating_count ?? 0);
      return countB - countA;
    });

    return list;
  }, [books]);

  // Duplicate books array for infinite seamless right-to-left marquee loop
  const duplicatedBooks = useMemo(() => {
    if (ratedBooks.length === 0) return [];
    let list = [...ratedBooks];
    while (list.length < 8) {
      list = [...list, ...ratedBooks];
    }
    return [...list, ...list];
  }, [ratedBooks]);

  const animDuration = isSlowed ? 90 : Math.max(25, duplicatedBooks.length * 3);

  if (loading) {
    return (
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
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-rose-800 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold">
        {error}
      </div>
    );
  }

  if (ratedBooks.length === 0) {
    return (
      <div className="py-10 text-center bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-1">
          <Star className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900">No rated books available yet.</h3>
        <p className="text-xs text-slate-500">Books will appear here once members rate them.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden py-2 select-none">
      {/* Edge Fade Gradients */}
      <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent z-10 pointer-events-none" />

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
            const avgRating = Number(book.reviews_avg_rating ?? book.rating) || 0;
            const ratingCount = Number(book.reviews_count ?? book.rating_count) || 0;
            const libraryName = book.library?.name;

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
                    {ratingCount > 0 && (
                      <span className="text-[9px] text-slate-300 font-normal">({ratingCount})</span>
                    )}
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

                  {/* Holding Library Badge */}
                  {libraryName && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg">
                      <Building2 className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">{libraryName}</span>
                    </div>
                  )}

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
  );
}
