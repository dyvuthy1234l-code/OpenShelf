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
      <div className="w-full max-w-xl sm:max-w-2xl h-80 sm:h-96 bg-white/95 border border-amber-400/40 rounded-[28px] flex flex-col items-center justify-center text-center p-8 shadow-2xl backdrop-blur-md">
        <Building2 className="w-14 h-14 text-amber-500 mb-3" />
        <p className="text-slate-900 font-black text-lg mb-1">OpenShelf Network</p>
        <p className="text-slate-600 text-sm font-semibold">Connecting top rated community libraries across Cambodia</p>
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
    <div className="relative w-full max-w-xl sm:max-w-2xl lg:max-w-2xl h-[410px] sm:h-[445px] lg:h-[465px] flex items-center justify-center select-none mx-auto overflow-visible">
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
                y: stackOffset * 14,
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
                  ? 'border-amber-400 shadow-2xl ring-4 ring-amber-400/30'
                  : 'border-slate-200/90 shadow-md bg-slate-100/95'
              } rounded-[28px] p-5 sm:p-6 overflow-hidden transition-all duration-300 group`}
            >
              {/* Top Cover Header Banner */}
              <div className="relative h-36 sm:h-48 bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80">
                {coverUrl ? (
                  <img src={coverUrl} alt={library.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-[#0B1F3A] to-slate-800 flex items-center justify-center text-amber-400">
                    <Building2 className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Top Rated Rank Badge */}
                <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 bg-slate-950/90 backdrop-blur-md border border-amber-400/80 text-amber-400 px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{rankLabel}</span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 bg-amber-500 text-slate-950 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg">
                  <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                  <span>{ratingScore}</span>
                </div>
              </div>

              {/* Overlapping Logo Avatar & Library Details */}
              <div className="px-2 pt-0 relative space-y-3.5 mt-2.5">
                <div className="flex items-end justify-between gap-3 -mt-9 sm:-mt-11 relative z-10">
                  {/* Overlapping Logo Avatar Badge */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 shadow-2xl border-2 border-amber-500 overflow-hidden shrink-0 flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt={library.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-black text-xl">
                        <Building2 className="w-8 h-8 text-slate-950" />
                      </div>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-900 bg-amber-100 border border-amber-300 px-3.5 py-1.5 rounded-xl shadow-xs">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>{bookCount} {bookCount === 1 ? 'Book' : 'Books'}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-950 group-hover:text-amber-600 transition-colors truncate">
                    {library.name}
                  </h3>
                  {library.address && (
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 font-extrabold truncate">
                      <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate">{library.address}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Link */}
                <div className="pt-3 flex items-center justify-between border-t border-slate-200/90">
                  <span className="text-xs sm:text-sm font-black text-amber-600 group-hover:text-amber-700 group-hover:underline inline-flex items-center gap-1.5">
                    <span>Visit Library</span>
                    <ChevronRight className="w-4 h-4 text-amber-600" />
                  </span>
                  <span className="text-xs text-slate-500 font-black">OpenShelf Network</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
