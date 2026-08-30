import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, BookOpen, ChevronRight, Star } from 'lucide-react';
import { getLibraryLogoUrl, getLibraryCoverUrl } from '../../utils/imageUrl';

export default function LibraryCardDeck({ libraries = [] }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-cycle deck every 4.5 seconds
  useEffect(() => {
    if (!libraries || libraries.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % libraries.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [libraries]);

  if (!libraries || libraries.length === 0) {
    return (
      <div className="w-full max-w-lg sm:max-w-xl h-72 sm:h-80 bg-white/95 border border-amber-400/40 rounded-[24px] flex flex-col items-center justify-center text-center p-6 shadow-2xl backdrop-blur-md">
        <Building2 className="w-12 h-12 text-amber-500 mb-2" />
        <p className="text-slate-900 font-black text-base mb-1">OpenShelf Network</p>
        <p className="text-slate-600 text-xs">Connecting top rated community libraries across Cambodia</p>
      </div>
    );
  }

  // Display top 3 cards in stack
  const cardCount = Math.min(libraries.length, 3);
  const visibleCards = [];
  for (let i = 0; i < cardCount; i++) {
    const idx = (activeIndex + i) % libraries.length;
    visibleCards.push({ library: libraries[idx], rankIndex: idx, stackOffset: i });
  }

  return (
    <div className="relative w-full max-w-lg sm:max-w-xl lg:max-w-xl h-[345px] sm:h-[375px] lg:h-[390px] flex items-center justify-center select-none mx-auto overflow-visible">
      <AnimatePresence mode="sync">
        {visibleCards.reverse().map(({ library, rankIndex, stackOffset }) => {
          const isTop = stackOffset === 0;
          const coverUrl = getLibraryCoverUrl(library.cover_image_url || library.cover_image, 600);
          const logoUrl = getLibraryLogoUrl(library.image_url || library.image || library.logo, 160);
          const bookCount = library.books_count ?? (library.books ? library.books.length : 0);
          const ratingScore = (Number(library.rating || library.reviews_avg_rating) || 4.9).toFixed(1);
          const rankLabel = `#${rankIndex + 1} Top Rated Library`;

          return (
            <motion.div
              key={library.id}
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{
                opacity: 1 - stackOffset * 0.15,
                scale: 1 - stackOffset * 0.04,
                y: stackOffset * 12,
                rotate: stackOffset === 0 ? 0 : stackOffset === 1 ? -2.5 : 2.5,
                zIndex: 10 - stackOffset,
              }}
              exit={{ opacity: 0, scale: 0.8, y: -25, rotate: -6 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => {
                if (isTop) {
                  navigate(`/libraries/${library.id}`);
                } else {
                  setActiveIndex((prev) => (prev + stackOffset) % libraries.length);
                }
              }}
              className={`absolute top-0 left-0 right-0 cursor-pointer bg-white border ${
                isTop
                  ? 'border-amber-400 shadow-2xl ring-2 ring-amber-400/40'
                  : 'border-slate-200/90 shadow-md bg-slate-100/95'
              } rounded-[24px] p-4 sm:p-5 overflow-hidden transition-all duration-300 group`}
            >
              {/* Top Cover Header Banner */}
              <div className="relative h-28 sm:h-36 bg-slate-900 rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200/80">
                {coverUrl ? (
                  <img src={coverUrl} alt={library.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-[#0B1F3A] to-slate-800 flex items-center justify-center text-amber-400">
                    <Building2 className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Top Rated Rank Badge */}
                <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-slate-950/90 backdrop-blur-md border border-amber-400/80 text-amber-400 px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1.5 shadow-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{rankLabel}</span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 shadow-md">
                  <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
                  <span>{ratingScore}</span>
                </div>
              </div>

              {/* Overlapping Logo Avatar & Library Details */}
              <div className="px-1.5 pt-0 relative space-y-3 mt-2">
                <div className="flex items-end justify-between gap-3 -mt-7 sm:-mt-8 relative z-10">
                  {/* Overlapping Logo Avatar Badge */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white p-0.5 shadow-xl border-2 border-amber-500 overflow-hidden shrink-0 flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt={library.name} className="w-full h-full object-cover rounded-lg sm:rounded-xl" />
                    ) : (
                      <div className="w-full h-full bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center text-slate-950 font-black text-lg">
                        <Building2 className="w-7 h-7 text-slate-950" />
                      </div>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl shadow-xs">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span>{bookCount} {bookCount === 1 ? 'Book' : 'Books'}</span>
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-950 group-hover:text-amber-600 transition-colors truncate">
                    {library.name}
                  </h3>
                  {library.address && (
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 font-bold truncate">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{library.address}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Link */}
                <div className="pt-2.5 flex items-center justify-between border-t border-slate-200/90">
                  <span className="text-xs sm:text-sm font-black text-amber-600 group-hover:text-amber-700 group-hover:underline inline-flex items-center gap-1">
                    <span>Visit Library</span>
                    <ChevronRight className="w-4 h-4 text-amber-600" />
                  </span>
                  <span className="text-[11px] text-slate-500 font-black">OpenShelf Network</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
