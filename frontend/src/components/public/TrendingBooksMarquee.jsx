import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Building2, User, CheckCircle2, XCircle, ArrowRight, Bookmark, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import memberService from '../../services/memberService';
import BookSkeleton from '../common/BookSkeleton';

export default function TrendingBooksMarquee({ books = [], loading = false, error = null }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isSlowed, setIsSlowed] = useState(false);
  const [favoritedIds, setFavoritedIds] = useState(new Set());

  // Filter books according to rating threshold rules:
  // Primary: rating >= 4.0
  // Fallback 1: rating >= 3.5 if count < 6
  // Fallback 2: any rated book (rating > 0) if count < 6
  // NEVER include unrated books.
  const ratedBooks = useMemo(() => {
    if (!books || books.length === 0) return [];

    // Helper to extract numeric rating
    const getRating = (b) => {
      const r = b.reviews_avg_rating ?? b.rating ?? 0;
      return Number(r) || 0;
    };

    const getReviewsCount = (b) => {
      return Number(b.reviews_count ?? b.rating_count ?? 0);
    };

    // Sort function: 1. rating DESC, 2. reviews_count DESC
    const sortFn = (a, b) => {
      const rDiff = getRating(b) - getRating(a);
      if (Math.abs(rDiff) > 0.01) return rDiff;
      return getReviewsCount(b) - getReviewsCount(a);
    };

    // Step A: rating >= 4.0
    const stepA = books.filter((b) => getRating(b) >= 4.0).sort(sortFn);
    if (stepA.length >= 6) return stepA.slice(0, 10);

    // Step B: rating >= 3.5
    const stepB = books.filter((b) => getRating(b) >= 3.5).sort(sortFn);
    if (stepB.length >= 6) return stepB.slice(0, 10);

    // Step C: any book with a real rating > 0
    const stepC = books.filter((b) => getRating(b) > 0 || getReviewsCount(b) > 0).sort(sortFn);
    return stepC.slice(0, 10);
  }, [books]);

  const handleFavoriteClick = async (e, bookId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'member') return;

    const isFav = favoritedIds.has(bookId);
    try {
      if (isFav) {
        await memberService.removeFavorite(bookId);
        setFavoritedIds((prev) => {
          const next = new Set(prev);
          next.delete(bookId);
          return next;
        });
      } else {
        await memberService.addFavorite(bookId);
        setFavoritedIds((prev) => new Set(prev).add(bookId));
      }
    } catch {
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.delete(bookId);
        else next.add(bookId);
        return next;
      });
    }
  };

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="overflow-hidden">
        <BookSkeleton count={5} />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-6 text-center bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold">
        {error}
      </div>
    );
  }

  // Empty State
  if (!ratedBooks || ratedBooks.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
        No rated books found at the moment.
      </div>
    );
  }

  // Duplicate books list for continuous infinite loop
  const duplicatedBooks = [...ratedBooks, ...ratedBooks];

  // Duration: Normal speed = 25s, Slow speed on hover = 90s (smooth slow crawl, NOT stopped)
  const animDuration = isSlowed ? 90 : 25;

  return (
    <div className="relative w-full overflow-hidden py-4 select-none">
      {/* Edge Blur Gradients */}
      <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div
        className="w-full overflow-hidden"
        onMouseEnter={() => setIsSlowed(true)}
        onMouseLeave={() => setIsSlowed(false)}
      >
        <motion.div
          className="flex items-center gap-6 w-max"
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
            const availableQty = book.available_quantity ?? 0;
            const isFav = favoritedIds.has(book.id);

            const rawRating = book.reviews_avg_rating ?? book.rating ?? null;
            const ratingValue = Number(rawRating).toFixed(1);
            const reviewsCount = book.reviews_count ?? book.rating_count ?? null;

            return (
              <div
                key={`${book.id}-${idx}`}
                className="w-64 sm:w-72 shrink-0 bg-white border border-slate-200/90 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-[400px] group"
              >
                {/* Book Cover */}
                <div className="relative h-44 bg-slate-100/80 overflow-hidden shrink-0 flex items-center justify-center p-3">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="h-full w-auto max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-24 h-32 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col items-center justify-center p-2 text-center">
                      <BookOpen className="w-7 h-7 text-amber-600/70 mb-1" />
                      <span className="text-[10px] text-slate-700 font-bold line-clamp-2 leading-snug">
                        {book.title}
                      </span>
                    </div>
                  )}

                  {/* Category Pill */}
                  {book.category?.name && (
                    <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
                      {book.category.name}
                    </div>
                  )}

                  {/* Favorite Bookmark Action */}
                  <button
                    onClick={(e) => handleFavoriteClick(e, book.id)}
                    title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                    className={`absolute bottom-2.5 right-2.5 p-1.5 rounded-lg border transition-all shadow-xs ${
                      isFav
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-white/90 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border-slate-200'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-slate-950' : ''}`} />
                  </button>

                  {/* Availability Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/90 text-white px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        {availableQty} Avail
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-rose-500/90 text-white px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md shadow-xs">
                        <XCircle className="w-3 h-3" />
                        Borrowed
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Body */}
                <div className="p-4 flex flex-col flex-grow bg-white space-y-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                      {book.title}
                    </h4>

                    {book.author && (
                      <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{book.author}</span>
                      </div>
                    )}
                  </div>

                  {/* Real Rating Display */}
                  <div className="flex items-center gap-1 text-xs">
                    <div className="flex items-center gap-1 text-amber-700 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                      <span>{ratingValue}</span>
                      {reviewsCount !== null && reviewsCount > 0 && (
                        <span className="text-[11px] text-slate-400 font-normal">({reviewsCount})</span>
                      )}
                    </div>
                  </div>

                  {book.library?.name && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-700 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl mt-auto">
                      <Building2 className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="line-clamp-1 font-semibold">{book.library.name}</span>
                    </div>
                  )}

                  <Link
                    to={`/books/${book.id}`}
                    className="inline-flex items-center justify-between w-full py-2 px-3 bg-slate-50 hover:bg-amber-500 hover:text-slate-950 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-amber-500 transition-all duration-200 group/btn"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
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
