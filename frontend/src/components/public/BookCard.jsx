import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Building2, User, CheckCircle2, XCircle, Bookmark, Star, Eye, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getBookCoverUrl } from '../../utils/imageUrl';
import { CARD_MOTION_PROPS } from '../../constants/motionTokens';

function formatRelativeTime(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  if (diffInSeconds < 60) return 'Just added';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  return `${Math.floor(diffInMonths / 12)}y ago`;
}

export default function BookCard({ book, showDateAdded = false, compact = false }) {
  const { isAuthenticated, user, isBookFavorite, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const [savingFav, setSavingFav] = useState(false);
  const [imageErr, setImageErr] = useState(false);

  if (!book || typeof book !== 'object') return null;

  const timeAgo = showDateAdded ? formatRelativeTime(book.created_at || book.added_at) : null;

  const isFavorited = isBookFavorite(book.id);
  const isAvailable = (book.available_quantity ?? book.quantity ?? 0) > 0;
  const availableQty = book.available_quantity ?? 0;

  const rawRating = book.reviews_avg_rating ?? book.rating ?? null;
  const numRating = rawRating !== null ? Number(rawRating) : null;
  const hasRating = numRating !== null && !isNaN(numRating) && numRating > 0;
  const ratingValue = hasRating ? numRating.toFixed(1) : null;
  const reviewsCount = book.reviews_count ?? book.rating_count ?? null;

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'member') return;

    try {
      setSavingFav(true);
      await toggleFavorite(book.id);
    } catch {
      // Reverted automatically by AuthContext
    } finally {
      setSavingFav(false);
    }
  };

  return (
    <motion.div
      {...CARD_MOTION_PROPS}
      onClick={() => navigate(`/books/${book.id}`)}
      className={`group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 ${
        compact ? 'rounded-2xl shadow-2xs' : 'rounded-3xl shadow-xs'
      } overflow-hidden hover:shadow-2xl hover:border-amber-400/80 dark:hover:border-amber-400/80 transition-all duration-300 flex flex-col h-full cursor-pointer select-none focus-within:ring-2 focus-within:ring-amber-500/40`}
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] w-full bg-slate-950 overflow-hidden shrink-0">
        {getBookCoverUrl(book.cover_image_url || book.cover_image, 400) && !imageErr ? (
          <img
            src={getBookCoverUrl(book.cover_image_url || book.cover_image, 400)}
            alt={book.title}
            loading="lazy"
            decoding="async"
            onError={() => setImageErr(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out will-change-transform opacity-95 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-navy-950 via-slate-900 to-amber-900/30 flex flex-col items-center justify-center p-4 text-center">
            <BookOpen className={`${compact ? 'w-8 h-8 mb-2' : 'w-12 h-12 mb-3'} text-amber-500/70`} />
            <span className="text-xs text-slate-200 font-bold line-clamp-2 leading-snug px-2">{book.title}</span>
          </div>
        )}

        {/* Hover overlay + quick action */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100">
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-navy-950 font-black ${
            compact ? 'px-3 py-1 text-[10px]' : 'px-4 py-2 text-xs'
          } shadow-xl`}>
            <Eye className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
            View Details
          </span>
        </div>

        {/* Category pill — top left */}
        {book.category?.name && (
          <span className={`absolute ${compact ? 'top-2 left-2 text-[9px] px-2 py-0.5' : 'top-3 left-3 text-[11px] px-2.5 py-0.5'} z-20 max-w-[55%] truncate bg-slate-950/80 backdrop-blur-md border border-white/20 text-slate-100 rounded-full font-black shadow-sm`}>
            {book.category.name}
          </span>
        )}

        {/* Favorite — top right */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.85 }}
          onClick={handleFavoriteClick}
          disabled={savingFav}
          aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute ${compact ? 'top-2 right-2 h-7 w-7' : 'top-3 right-3 h-8.5 w-8.5'} z-30 flex items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 shadow-md cursor-pointer ${
            isFavorited
              ? 'bg-[#F5B82E] text-[#07172B] border-[#F5B82E] shadow-amber-500/30'
              : 'bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-amber-400 hover:bg-[#F5B82E] dark:hover:bg-[#F5B82E] hover:text-[#07172B] dark:hover:text-[#07172B] border-slate-200 dark:border-amber-400/40 shadow-xs'
          }`}
        >
          <Bookmark
            className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${
              isFavorited
                ? 'fill-[#07172B] text-[#07172B]'
                : 'text-slate-700 dark:text-amber-400 group-hover/btn:text-[#07172B]'
            }`}
            strokeWidth={2.4}
          />
        </motion.button>

        {/* Availability — bottom left */}
        <div className={`absolute ${compact ? 'bottom-2 left-2' : 'bottom-3 left-3'} z-20`}>
          {isAvailable ? (
            <span className={`inline-flex items-center gap-1 rounded-full ${compact ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'} font-black bg-emerald-500/90 backdrop-blur-md text-white border border-emerald-400/40 shadow-sm`}>
              <CheckCircle2 className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
              {availableQty} Available
            </span>
          ) : (
            <span className={`inline-flex items-center gap-1 rounded-full ${compact ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-0.5 text-[10px]'} font-black bg-rose-600/90 backdrop-blur-md text-white border border-rose-400/40 shadow-sm`}>
              <XCircle className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
              Borrowed
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className={`${compact ? 'p-3 gap-1.5' : 'p-4 gap-2'} flex flex-col flex-grow justify-between`}>
        <div className="space-y-0.5">
          <h3 className={`${compact ? 'text-xs sm:text-[13px] line-clamp-1 min-h-[1.25rem]' : 'text-[15px] line-clamp-2 min-h-[2.5rem]'} font-black text-navy-950 dark:text-white group-hover:text-amber-500 transition-colors leading-snug tracking-tight`}>
            {book.title}
          </h3>

          {book.author && (
            <div className={`flex items-center gap-1.5 text-slate-500 dark:text-slate-400 ${compact ? 'text-[11px]' : 'text-xs'} font-semibold`}>
              <User className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-500 shrink-0`} />
              <span className="line-clamp-1">{book.author}</span>
            </div>
          )}
        </div>

        {/* Meta row: rating + added time + library */}
        <div className={`mt-auto ${compact ? 'pt-1.5' : 'pt-2'} border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5`}>
          {hasRating ? (
            <span className={`inline-flex items-center gap-1 ${compact ? 'text-[11px]' : 'text-xs'} font-black text-amber-600 dark:text-amber-400`}>
              <Star className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} fill-amber-400 text-amber-500 shrink-0`} />
              {ratingValue}
              {reviewsCount !== null && (
                <span className="text-[10px] text-slate-400 font-medium">({reviewsCount})</span>
              )}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium italic">No ratings</span>
          )}

          {timeAgo && (
            <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700 shrink-0">
              <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
              {timeAgo}
            </span>
          )}

          {book.library?.name && (
            <span className={`inline-flex items-center gap-1 ${compact ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5'} font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-lg min-w-0`}>
              <Building2 className={`${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} text-amber-500 shrink-0`} />
              <span className="line-clamp-1">{book.library.name}</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
