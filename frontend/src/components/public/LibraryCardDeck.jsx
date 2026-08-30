import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
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
      <div className="w-full max-w-md sm:max-w-lg h-64 sm:h-72 bg-white border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center text-center p-5 shadow-sm">
        <Building2 className="w-10 h-10 text-amber-500/50 mb-2" />
        <p className="text-slate-900 font-extrabold text-sm mb-0.5">OpenShelf Network</p>
        <p className="text-slate-500 text-xs">Connecting community libraries across Cambodia</p>
      </div>
    );
  }

  // Display top 3 cards in stack
  const cardCount = Math.min(libraries.length, 3);
  const visibleCards = [];
  for (let i = 0; i < cardCount; i++) {
    const idx = (activeIndex + i) % libraries.length;
    visibleCards.push({ library: libraries[idx], stackOffset: i });
  }

  return (
    <div className="relative w-full max-w-md sm:max-w-lg h-[295px] sm:h-[320px] lg:h-[330px] flex items-center justify-center select-none mx-auto overflow-visible">
      <AnimatePresence mode="sync">
        {visibleCards.reverse().map(({ library, stackOffset }) => {
          const isTop = stackOffset === 0;
          const coverUrl = getLibraryCoverUrl(library.cover_image_url || library.cover_image, 600);
          const logoUrl = getLibraryLogoUrl(library.image_url || library.image || library.logo, 160);
          const bookCount = library.books_count ?? (library.books ? library.books.length : 0);

          return (
            <motion.div
              key={library.id}
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{
                opacity: 1 - stackOffset * 0.15,
                scale: 1 - stackOffset * 0.04,
                y: stackOffset * 10,
                rotate: stackOffset === 0 ? 0 : stackOffset === 1 ? -2 : 2,
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
                  ? 'border-amber-300 shadow-lg shadow-slate-200/80'
                  : 'border-slate-200/80 shadow-xs bg-slate-50/90'
              } rounded-2xl p-3.5 sm:p-4 overflow-hidden transition-all duration-300 group`}
            >
              {/* Top Cover Header Banner */}
              <div className="relative h-24 sm:h-28 bg-slate-100 rounded-xl overflow-hidden border border-slate-200/80">
                {coverUrl ? (
                  <img src={coverUrl} alt={library.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-slate-100 via-amber-50/40 to-slate-50 flex items-center justify-center text-amber-500/60">
                    <Building2 className="w-9 h-9" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />

                {/* Top Badge - Light Theme */}
                <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-white/95 backdrop-blur-md border border-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-2xs">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Featured Partner</span>
                </div>
              </div>

              {/* Overlapping Logo Avatar & Library Header Details */}
              <div className="px-1 pt-0 relative space-y-2.5 mt-1.5">
                <div className="flex items-end justify-between gap-2.5 -mt-6 sm:-mt-7 relative z-10">
                  {/* Overlapping Logo Avatar Badge */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white p-0.5 shadow-md border-2 border-amber-500 overflow-hidden shrink-0 flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt={library.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-full bg-amber-500 rounded-lg flex items-center justify-center text-slate-950 font-black text-base">
                        <Building2 className="w-6 h-6 text-slate-950" />
                      </div>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-lg">
                    <BookOpen className="w-3 h-3 text-amber-600" />
                    <span>{bookCount} {bookCount === 1 ? 'Book' : 'Books'}</span>
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors truncate">
                    {library.name}
                  </h3>
                  {library.address && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium truncate">
                      <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">{library.address}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Link */}
                <div className="pt-1.5 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs font-extrabold text-amber-600 group-hover:text-amber-700 group-hover:underline inline-flex items-center gap-1">
                    <span>Visit Library</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">OpenShelf Network</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
