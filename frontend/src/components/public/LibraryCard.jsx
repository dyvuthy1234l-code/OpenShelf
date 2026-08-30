import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, BookOpen, ArrowRight, Clock, Star, ShieldCheck } from 'lucide-react';
import { getLibraryLogoUrl, getLibraryCoverUrl } from '../../utils/imageUrl';
import { CARD_MOTION_PROPS } from '../../constants/motionTokens';

export default function LibraryCard({ library, rankIndex }) {
  const [coverErr, setCoverErr] = useState(false);
  const [logoErr, setLogoErr] = useState(false);

  const logoUrl = getLibraryLogoUrl(library.image_url || library.image || library.logo, 160);
  const coverUrl = getLibraryCoverUrl(library.cover_image_url || library.cover_image, 600);

  const bookCount = library.books_count ?? (library.books ? library.books.length : 0);
  const isFeatured = library.id === 1 || library.id === 3 || Boolean(library.is_featured);
  const ratingValue = Number(library.average_rating || library.rating || 0);
  const hasRating = ratingValue > 0;

  const location = library.city || library.address || 'Phnom Penh';
  const hours =
    library.opening_hours && !library.opening_hours.includes('Mollitia')
      ? library.opening_hours
      : 'Mon - Sat: 08:00 AM - 05:00 PM';

  return (
    <motion.div
      {...CARD_MOTION_PROPS}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-2xl hover:border-amber-400/80 dark:hover:border-amber-400/80 transition-all duration-300 flex flex-col h-full select-none"
    >
      {/* Cover Banner Area */}
      <div className="relative h-40 sm:h-44 bg-slate-950 overflow-hidden shrink-0">
        {coverUrl && !coverErr ? (
          <img
            src={coverUrl}
            alt={`${library.name} Cover`}
            loading="lazy"
            decoding="async"
            onError={() => setCoverErr(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-navy-950 via-navy-900 to-amber-900/30 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <Building2 className="w-10 h-10 mb-1 text-gold-500/50" />
            <span className="text-[11px] text-amber-200/90 font-black uppercase tracking-wider">OpenShelf Partner Library</span>
          </div>
        )}
        
        {/* Dynamic Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/40 pointer-events-none" />

        {/* Top Badges Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          {rankIndex !== undefined ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-gold-500 to-amber-400 text-navy-950 text-[11px] font-black shadow-lg uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-navy-950 text-navy-950" />
              #{rankIndex + 1} Top Rated
            </span>
          ) : isFeatured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-navy-950 text-[10px] font-black shadow-md uppercase tracking-wider">
              <Star className="w-3 h-3 fill-navy-950 text-navy-950" />
              Featured
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 border border-white/10 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              Verified
            </span>
          )}

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/20 text-emerald-400 text-[10px] font-black shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>

        {/* Floating Book Count Badge */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-black shadow-md">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{bookCount} {bookCount === 1 ? 'Book' : 'Books'}</span>
          </span>
        </div>
      </div>

      {/* Body Information Area */}
      <div className="p-5 pt-0 flex flex-col flex-1 justify-between gap-3 relative">
        {/* Floating Avatar + Rating Badge Row (OUTSIDE overflow-hidden, 100% visible) */}
        <div className="flex items-end justify-between -mt-7 mb-1 z-20">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 p-1 border-2 border-white dark:border-slate-800 shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 shrink-0">
            {logoUrl && !logoErr ? (
              <img
                src={logoUrl}
                alt={`${library.name} Logo`}
                onError={() => setLogoErr(true)}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-amber-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Building2 className="w-7 h-7" />
              </div>
            )}
          </div>

          {hasRating && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-black shrink-0 shadow-xs">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{ratingValue.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-medium">({library.reviews_count || 0})</span>
            </div>
          )}
        </div>

        <div>
          {/* Header */}
          <div className="mb-1.5">
            <h3 className="text-base sm:text-lg font-black text-navy-950 dark:text-white group-hover:text-amber-500 transition-colors line-clamp-1 tracking-tight">
              {library.name}
            </h3>
          </div>

          {/* Description */}
          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 min-h-[2rem]">
            {library.description || 'Discover academic titles, local collections, and quiet reading spaces at this community library.'}
          </p>
        </div>

        {/* Location & Opening Hours Metadata */}
        <div className="space-y-1.5 py-2.5 border-y border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{hours}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          <Link
            to={`/libraries/${library.id}`}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-navy-950 font-black text-xs shadow-md shadow-amber-500/20 hover:shadow-amber-500/30 transition-all duration-200 group/btn cursor-pointer"
          >
            <span>Explore Library</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform duration-200 shrink-0" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
