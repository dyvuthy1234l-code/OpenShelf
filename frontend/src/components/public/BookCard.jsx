import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Building2, User, CheckCircle2, XCircle, Bookmark, Star, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import getImageUrl, { getBookCoverUrl } from '../../utils/imageUrl';
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

  const isFavorited = isBookFavorite(book.id);

  const isAvailable = (book.available_quantity ?? book.quantity ?? 0) > 0;
  const availableQty = book.available_quantity ?? 0;

  const rawRating = book.reviews_avg_rating ?? book.rating ?? null;
  const numRating = rawRating !== null ? Number(rawRating) : null;
  const hasRating = numRating !== null && !isNaN(numRating) && numRating > 0;
  const ratingValue = hasRating ? numRating.toFixed(1) : null;
  const reviewsCount = book.reviews_count ?? book.rating_count ?? null;

  const timeAgo = showDateAdded ? formatRelativeTime(book.created_at || book.added_at) : null;

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

  const [imageErr, setImageErr] = useState(false);

  return (
    <motion.div
      {...CARD_MOTION_PROPS}
      onClick={() => navigate(`/books/${book.id}`)}
      className="os-card group relative rounded-2xl overflow-hidden hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full bg-navy-50 overflow-hidden shrink-0 rounded-t-2xl flex items-center justify-center group/cover">
        {getBookCoverUrl(book.cover_image_url || book.cover_image, 400) && !imageErr ? (
          <img
            src={getBookCoverUrl(book.cover_image_url || book.cover_image, 400)}
            alt={book.title}
            loading="lazy"
            decoding="async"
            onError={() => setImageErr(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out will-change-transform"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-slate-200 via-white to-slate-100 flex flex-col items-center justify-center p-4 text-center">
            <BookOpen className="w-12 h-12 text-amber-600/70 mb-3" />
            <span className="text-xs text-slate-700 font-bold line-clamp-3 leading-snug px-4">{book.title}</span>
          </div>
        )}

        {/* Category Pill */}
        {book.category?.name && (
          <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs">
            {book.category.name}
          </div>
        )}

        {/* Favorite Action Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.8, rotate: -5 }}
          onClick={handleFavoriteClick}
          disabled={savingFav}
          aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute bottom-3 right-3 z-20 flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-200 shadow-xs ${
            isFavorited
              ? 'bg-amber-500 text-slate-950 border-amber-500'
              : 'bg-white/90 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border-slate-200'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-slate-950' : ''}`} />
        </motion.button>

        {/* Availability Badge */}
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ willChange: 'transform' }}
          >
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
          </motion.div>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-5 flex flex-col flex-grow space-y-2">
        <div>
          <h3 className="text-base font-semibold text-navy-800 group-hover:text-gold-600 transition-colors line-clamp-1">
            {book.title}
          </h3>

          {book.author && (
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="line-clamp-1">{book.author}</span>
            </div>
          )}
        </div>

        {/* Rating & Relative Date */}
        <div className="flex items-center justify-between text-xs pt-1">
          {hasRating ? (
            <div className="flex items-center gap-1 text-amber-700 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
              <span>{ratingValue}</span>
              {reviewsCount !== null && (
                <span className="text-[11px] text-slate-400 font-normal">({reviewsCount})</span>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium italic">No ratings yet</span>
          )}

          {timeAgo && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              {timeAgo}
            </span>
          )}
        </div>

        {/* Library Info */}
        {book.library?.name && (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
            <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="line-clamp-1 font-semibold">{book.library.name}</span>
          </div>
        )}


      </div>
    </motion.div>
  );
}
