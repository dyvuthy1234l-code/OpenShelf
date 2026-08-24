import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Building2, User, CheckCircle2, XCircle, ArrowRight, Bookmark, Star, Clock } from 'lucide-react';
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
      className="group relative bg-white border border-slate-200/90 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[2/3] w-full bg-slate-100/80 overflow-hidden shrink-0 flex items-center justify-center group/cover">
        {getBookCoverUrl(book.cover_image_url || book.cover_image, 400) && !imageErr ? (
          <img
            src={getBookCoverUrl(book.cover_image_url || book.cover_image, 400)}
            alt={book.title}
            loading="lazy"
            decoding="async"
            onError={() => setImageErr(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-slate-200 via-white to-slate-100 flex flex-col items-center justify-center p-4 text-center">
            <BookOpen className="w-12 h-12 text-amber-600/70 mb-3" />
            <span className="text-xs text-slate-700 font-bold line-clamp-3 leading-snug px-4">{book.title}</span>
          </div>
        )}

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px] z-10">
          <Link
            to={`/books/${book.id}`}
            className="px-5 py-2.5 bg-amber-500 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg hover:bg-amber-400 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 flex items-center gap-2"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Pill */}
        {book.category?.name && (
          <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs">
            {book.category.name}
          </div>
        )}

        {/* Favorite Action Button */}
        <button
          onClick={handleFavoriteClick}
          disabled={savingFav}
          title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
          className={`absolute bottom-3 right-3 z-20 p-2 rounded-xl border transition-all duration-200 shadow-xs ${
            isFavorited
              ? 'bg-amber-500 text-slate-950 border-amber-500'
              : 'bg-white/90 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border-slate-200'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-slate-950' : ''}`} />
        </button>

        {/* Availability Badge */}
        <div className="absolute top-3 right-3 z-20">
          {isAvailable ? (
            <span className="inline-flex items-center gap-1 bg-emerald-500/90 text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-md shadow-xs">
              <CheckCircle2 className="w-3 h-3" />
              {availableQty} Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-rose-500/90 text-white px-2.5 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-md shadow-xs">
              <XCircle className="w-3 h-3" />
              Borrowed
            </span>
          )}
        </div>
      </div>

      {/* Book Info */}
      <div className="p-5 flex flex-col flex-grow bg-white space-y-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1">
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

        {/* Action Button */}
        <Link
          to={`/books/${book.id}`}
          className="mt-auto pt-2 inline-flex items-center justify-between w-full py-2.5 px-4 bg-slate-50 hover:bg-amber-500 hover:text-slate-950 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-amber-500 transition-all duration-200 group/btn"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
