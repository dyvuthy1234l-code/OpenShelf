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
  const hasRating = Number(library.average_rating || library.rating) > 0;

  const location = library.city || library.address || 'Phnom Penh';
  const hours =
    library.opening_hours && !library.opening_hours.includes('Mollitia')
      ? library.opening_hours
      : 'Mon - Sat: 08:00 AM - 05:00 PM';

  return (
    <motion.div
      {...CARD_MOTION_PROPS}
      className="os-card group rounded-2xl overflow-hidden flex flex-col h-full select-none"
    >
      {/* Cover banner */}
      <div className="relative h-36 sm:h-40 bg-navy-950 overflow-hidden shrink-0">
        {coverUrl && !coverErr ? (
          <img
            src={coverUrl}
            alt={`${library.name} Cover`}
            loading="lazy"
            decoding="async"
            onError={() => setCoverErr(true)}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out will-change-transform opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-navy-950 via-navy-900 to-gold-600/20 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <Building2 className="w-10 h-10 mb-1 text-gold-500/40" />
            <span className="text-[11px] text-gold-200/80 font-bold uppercase tracking-wider">OpenShelf Partner Library</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/30 to-transparent pointer-events-none" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          {rankIndex !== undefined ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500 text-navy-950 text-[10px] font-black shadow-md uppercase tracking-wider">
              <Star className="w-3 h-3 fill-navy-950 text-navy-950" />
              #{rankIndex + 1} Top Rated
            </span>
          ) : isFeatured ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-500 text-navy-950 text-[10px] font-extrabold shadow-sm uppercase tracking-wider">
              <Star className="w-3 h-3 fill-navy-950 text-navy-950" />
              Featured
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-navy-950/80 backdrop-blur-md text-gold-300 border border-white/10 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-gold-400" />
              Verified
            </span>
          )}

          <span className="os-badge-success backdrop-blur-md shadow-2xs">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        </div>

        {/* Floating book count pill */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-navy-950/85 backdrop-blur-md border border-white/10 text-gold-300 text-[11px] font-extrabold shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-gold-400" />
            <span>{bookCount} {bookCount === 1 ? 'Book' : 'Books'}</span>
          </span>
        </div>
      </div>

      {/* Overlapping logo + content */}
      <div className="p-5 pt-0 flex flex-col flex-grow relative">
        <div className="flex items-end justify-between -mt-9 sm:-mt-10 mb-3 z-20">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 border-2 border-white shadow-md overflow-hidden shrink-0 group-hover:shadow-lg transition-shadow">
            {logoUrl && !logoErr ? (
              <img
                src={logoUrl}
                alt={`${library.name} Logo`}
                onError={() => setLogoErr(true)}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-gold-50 rounded-xl flex items-center justify-center text-gold-600 border border-gold-200">
                <Building2 className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>

        {/* Title + rating */}
        <div className="space-y-1 mb-2">
          <h3 className="text-base sm:text-lg font-semibold text-navy-800 group-hover:text-gold-600 transition-colors line-clamp-1 tracking-tight">
            {library.name}
          </h3>

          {hasRating && (
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-400" />
              <span className="text-xs font-bold text-slate-900 tabular-nums">{library.average_rating}</span>
              <span className="text-[10px] text-slate-500">({library.reviews_count} reviews)</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-4">
          {library.description || 'Discover academic titles, local collections, and quiet reading spaces at this community library.'}
        </p>

        {/* Single stats row */}
        <div className="mt-auto pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 mb-3 min-w-0">
            <span className="inline-flex items-center gap-1 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0" />
              <span className="truncate">{location}</span>
            </span>
            <span className="w-px h-3 bg-slate-200 shrink-0" />
            <span className="inline-flex items-center gap-1 min-w-0">
              <Clock className="w-3.5 h-3.5 text-gold-600 shrink-0" />
              <span className="truncate">{hours}</span>
            </span>
          </div>

          <motion.div initial="rest" whileHover="hover">
            <Link
              to={`/libraries/${library.id}`}
              className="os-btn-gold w-full justify-between px-4 text-xs"
            >
              <span>Explore Library</span>
              <motion.span
                variants={{
                  rest: { x: 0 },
                  hover: { x: 6, transition: { type: 'spring', stiffness: 400 } }
                }}
                style={{ willChange: 'transform' }}
              >
                <ArrowRight className="w-4 h-4 shrink-0" />
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
