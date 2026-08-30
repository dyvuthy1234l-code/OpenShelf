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

export default function BookCard({ book, showDateAdded = false }) {
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
      className="os-card group relative rounded-2xl overflow-hidden flex flex-col h-full cursor-pointer focus-within:ring-2 focus-within:ring-navy-600/40"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] w-full bg-navy-50 overflow-hidden shrink-0">
        {getBookCoverUrl(book.cover_image_url || book.cover_image, 400) && !imageErr ? (
          <img
            src={getBookCoverUrl(book.cover_image_url || book.cover_image, 400)}
            alt={book.title}
            loading="lazy"
            decoding="async"
            onError={() => setImageErr(true)}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out will-change-transform"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-slate-200 via-white to-slate-100 flex flex-col items-center justify-center p-4 text-center">
            <BookOpen className="w-12 h-12 text-amber-600/70 mb-3" />
            <span className="text-xs text-slate-700 font-bold line-clamp-3 leading-snug px-4">{book.title}</span>
          </div>
        )}

        {/* Hover overlay + quick action */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-navy-950/75 via-navy-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-4 py-2 text-xs font-extrabold text-navy-900 shadow-lg border border-white/40">
            <Eye className="w-4 h-4 text-gold-600" />
            View Details
          </span>
        </div>

        {/* Category pill — top left */}
        {book.category?.name && (
          <span className="absolute top-3 left-3 z-20 max-w-[55%] truncate bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs">
            {book.category.name}
          </span>
        )}

        {/* Favorite — top right */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.8, rotate: -5 }}
          onClick={handleFavoriteClick}
          disabled={savingFav}
          aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute top-3 right-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 shadow-xs ${
            isFavorited
              ? 'bg-gold-500 text-navy-950 border-gold-500'
              : 'bg-white/90 hover:bg-gold-50 text-slate-600 hover:text-gold-600 border-slate-200'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-navy-950' : ''}`} />
        </motion.button>

        {/* Availability — bottom left, static & calm */}
        <div className="absolute bottom-3 left-3 z-20">
          {isAvailable ? (
            <span className="os-badge-success backdrop-blur-md shadow-xs">
              <CheckCircle2 className="w-3 h-3" />
              {availableQty} Available
            </span>
          ) : (
            <span className="os-badge-danger backdrop-blur-md shadow-xs">
              <XCircle className="w-3 h-3" />
              Borrowed
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-grow gap-1.5 justify-between">
        <div className="space-y-1">
          <h3 className="text-[15px] font-semibold text-navy-800 group-hover:text-gold-600 transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
            {book.title}
          </h3>

        {book.author && (
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{book.author}</span>
          </div>
        )}
        </div>

        {/* Meta row: rating + added time + library */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          {hasRating ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-gold-600">
              <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-500 shrink-0" />
              {ratingValue}
              {reviewsCount !== null && (
                <span className="text-[11px] text-slate-400 font-normal">({reviewsCount})</span>
              )}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium italic">No ratings yet</span>
          )}

          {timeAgo && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 shrink-0">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              {timeAgo}
            </span>
          )}

          {book.library?.name && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-lg min-w-0">
              <Building2 className="w-3 h-3 text-gold-600 shrink-0" />
              <span className="line-clamp-1">{book.library.name}</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
