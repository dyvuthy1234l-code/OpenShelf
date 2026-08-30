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
      <div className="w-full max-w-md sm:max-w-lg h-64 sm:h-72 bg-[#163A63]/80 border border-[#E8E6DF]/20 rounded-2xl flex flex-col items-center justify-center text-center p-5 shadow-xl">
        <Building2 className="w-10 h-10 text-[#D9A83E]/40 mb-2" />
        <p className="text-white font-bold text-sm mb-0.5">OpenShelf Network</p>
        <p className="text-[#CAD2DC] text-xs">Connecting community libraries across Cambodia</p>
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
    <div className="relative w-full max-w-md sm:max-w-lg h-[290px] sm:h-[320px] lg:h-[330px] flex items-center justify-center select-none mx-auto overflow-visible">
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
                opacity: 1 - stackOffset * 0.18,
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
              className={`absolute top-0 left-0 right-0 cursor-pointer bg-[#123A63] border ${
                isTop ? 'border-[#D9A83E]/45 shadow-[0_15px_35px_rgba(11,31,58,0.35)]' : 'border-[#DCE6F0]/20'
              } rounded-2xl p-3.5 sm:p-4 overflow-hidden backdrop-blur-xl transition-all duration-300 group`}
            >
              {/* Top Cover Header Banner */}
              <div className="relative h-24 sm:h-28 bg-[#0B1F3A] rounded-xl overflow-hidden border border-[#DCE6F0]/15">
                {coverUrl ? (
                  <img src={coverUrl} alt={library.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#0B1F3A] via-[#123A63] to-[#163F6B] flex items-center justify-center text-[#D9A83E]/40">
                    <Building2 className="w-9 h-9" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/80 via-transparent to-transparent pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 bg-[#0B1F3A]/90 backdrop-blur-md border border-[#D9A83E]/40 text-[#D9A83E] px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3 text-[#D9A83E]" />
                  <span>Featured Partner</span>
                </div>
              </div>

              {/* Overlapping Logo Avatar & Library Header Details */}
              <div className="px-1 pt-0 relative space-y-2.5 mt-1.5">
                <div className="flex items-end justify-between gap-2.5 -mt-6 sm:-mt-7 relative z-10">
                  {/* Overlapping Logo Avatar Badge */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white p-0.5 shadow-lg border-2 border-[#123A63] overflow-hidden shrink-0 flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt={library.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-full bg-[#D9A83E] rounded-lg flex items-center justify-center text-[#0B1F3A] font-black text-base">
                        <Building2 className="w-6 h-6 text-[#0B1F3A]" />
                      </div>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#D9A83E] bg-[#0B1F3A]/80 border border-[#D9A83E]/30 px-2.5 py-0.5 rounded-lg backdrop-blur-sm">
                    <BookOpen className="w-3 h-3 text-[#D9A83E]" />
                    <span>{bookCount} {bookCount === 1 ? 'Book' : 'Books'}</span>
                  </span>
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-[#D9A83E] transition-colors truncate">
                    {library.name}
                  </h3>
                  {library.address && (
                    <div className="flex items-center gap-1 text-xs text-[#CBD5E1] font-medium truncate">
                      <MapPin className="w-3 h-3 text-[#D9A83E] shrink-0" />
                      <span className="truncate">{library.address}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Link */}
                <div className="pt-1.5 flex items-center justify-between border-t border-[#DCE6F0]/15">
                  <span className="text-xs font-extrabold text-[#D9A83E] group-hover:underline inline-flex items-center gap-1">
                    <span>Visit Library</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#D9A83E]" />
                  </span>
                  <span className="text-[10px] text-[#CBD5E1] font-bold">OpenShelf Network</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
