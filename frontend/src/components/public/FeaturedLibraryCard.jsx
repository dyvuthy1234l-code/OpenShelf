import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, BookOpen, ArrowRight, Clock, Star, Sparkles } from 'lucide-react';
import getImageUrl from '../../utils/imageUrl';

export default function FeaturedLibraryCard({ library }) {
  const [coverErr, setCoverErr] = useState(false);
  const [logoErr, setLogoErr] = useState(false);

  const logoUrl = getImageUrl(library.image_url || library.image || library.logo);
  const coverUrl = getImageUrl(library.cover_image_url || library.cover_image);

  const bookCount = library.books_count ?? (library.books ? library.books.length : 0);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group bg-white border border-slate-200/90 hover:border-amber-500/60 rounded-3xl overflow-hidden shadow-2xs hover:shadow-2xl transition-all duration-300 flex flex-col h-full relative select-none"
    >
      {/* 1. COVER BANNER HEADER */}
      <div className="relative h-40 sm:h-44 bg-slate-950 overflow-hidden shrink-0">
        {coverUrl && !coverErr ? (
          <img
            src={coverUrl}
            alt={`${library.name} Cover`}
            onError={() => setCoverErr(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/40 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
            <Building2 className="w-10 h-10 mb-1 text-amber-500/40" />
            <span className="text-[11px] text-amber-200/80 font-bold uppercase tracking-wider">OpenShelf Partner Library</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold shadow-md uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            FEATURED PARTNER
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            ● Active
          </span>
        </div>

        {/* Floating Book Count Pill */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-amber-300 text-[11px] font-extrabold shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>{bookCount} {bookCount === 1 ? 'Book' : 'Books'}</span>
          </span>
        </div>
      </div>

      {/* 2. OVERLAPPING LOGO & CARD CONTENT */}
      <div className="p-6 pt-0 flex flex-col flex-grow bg-white relative">
        {/* Overlapping Logo Avatar */}
        <div className="flex items-end justify-between -mt-10 mb-3 z-20">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 border-2 border-white shadow-md overflow-hidden shrink-0 group-hover:shadow-lg transition-shadow">
            {logoUrl && !logoErr ? (
              <img
                src={logoUrl}
                alt={`${library.name} Logo`}
                onError={() => setLogoErr(true)}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-200">
                <Building2 className="w-8 h-8" />
              </div>
            )}
          </div>
        </div>

        {/* Title & Location */}
        <div className="space-y-1 mb-3">
          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1 tracking-tight">
            {library.name}
          </h3>

          {library.address && (
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{library.address}</span>
            </div>
          )}
        </div>

        {/* Short Description */}
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-4 font-normal">
          {library.description || 'Discover academic titles, local collections, and quiet reading spaces at this featured partner library.'}
        </p>

        {/* Info Highlights (Province & Opening Hours) */}
        <div className="mt-auto space-y-2 pt-3 border-t border-slate-100/90">
          <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5 bg-amber-50/70 border border-amber-200/80 px-3 py-1 rounded-xl">
              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{library.city ? `Province: ${library.city}` : (library.address || 'Phnom Penh')}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl text-slate-600">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{library.opening_hours && !library.opening_hours.includes('Mollitia') ? library.opening_hours : 'Mon - Sat: 08:00 AM - 05:00 PM'}</span>
            </div>
          </div>

          <Link
            to={`/libraries/${library.id}`}
            className="inline-flex items-center justify-between w-full py-3 px-5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 group/btn cursor-pointer"
          >
            <span>Explore Library Profile</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform shrink-0" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
