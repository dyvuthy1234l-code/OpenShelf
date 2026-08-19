import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, BookOpen, ChevronRight, Sparkles } from 'lucide-react';

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
      <div className="w-full max-w-md sm:max-w-lg h-80 sm:h-96 bg-[#163A63]/80 border border-[#E8E6DF]/20 rounded-3xl flex flex-col items-center justify-center text-center p-6 shadow-2xl">
        <Building2 className="w-14 h-14 text-[#D9A83E]/40 mb-3" />
        <p className="text-white font-bold text-base mb-1">OpenShelf Network</p>
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
    <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl h-[390px] sm:h-[430px] flex items-center justify-center select-none mx-auto overflow-visible">
      <AnimatePresence mode="sync">
        {visibleCards.reverse().map(({ library, stackOffset }) => {
          const isTop = stackOffset === 0;
          const coverUrl = library.cover_image_url || library.cover_image;
          const logoUrl = library.image_url || library.image;
          const bookCount = library.books_count ?? (library.books ? library.books.length : 0);

          return (
            <motion.div
              key={library.id}
              initial={{ opacity: 0, scale: 0.85, y: 25 }}
              animate={{
                opacity: 1 - stackOffset * 0.18,
                scale: 1 - stackOffset * 0.04,
                y: stackOffset * 14,
                rotate: stackOffset === 0 ? 0 : stackOffset === 1 ? -2.5 : 2.5,
                zIndex: 10 - stackOffset,
              }}
              exit={{ opacity: 0, scale: 0.8, y: -30, rotate: -8 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => {
                if (isTop) {
                  navigate(`/libraries/${library.id}`);
                } else {
                  setActiveIndex((prev) => (prev + stackOffset) % libraries.length);
                }
              }}
              className={`absolute top-0 left-0 right-0 cursor-pointer bg-[#123A63] border ${
                isTop ? 'border-[#D9A83E]/45 shadow-[0_20px_50px_rgba(11,31,58,0.35)]' : 'border-[#DCE6F0]/20'
              } rounded-3xl p-4 sm:p-5 overflow-hidden backdrop-blur-xl transition-all duration-300 group`}
            >
              {/* Top Cover Header Banner */}
              <div className="relative h-32 sm:h-40 bg-[#0B1F3A] rounded-2xl overflow-hidden border border-[#DCE6F0]/15">
                {coverUrl ? (
                  <img src={coverUrl} alt={library.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#0B1F3A] via-[#123A63] to-[#163F6B] flex items-center justify-center text-[#D9A83E]/40">
                    <Building2 className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/80 via-transparent to-transparent pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-[#0B1F3A]/90 backdrop-blur-md border border-[#D9A83E]/40 text-[#D9A83E] px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-[#D9A83E]" />
                  <span>Featured Partner</span>
                </div>
              </div>

              {/* Overlapping Logo Avatar & Library Header Details */}
              <div className="px-2 pt-0 relative space-y-3 mt-2">
                <div className="flex items-end justify-between gap-3 -mt-7 sm:-mt-8 relative z-10">
                  {/* Overlapping Logo Avatar Badge */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 shadow-xl border-2 border-[#123A63] overflow-hidden shrink-0 flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt={library.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full bg-[#D9A83E] rounded-xl flex items-center justify-center text-[#0B1F3A] font-black text-lg">
                        <Building2 className="w-7 h-7 text-[#0B1F3A]" />
                      </div>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#D9A83E] bg-[#0B1F3A]/80 border border-[#D9A83E]/30 px-3 py-1 rounded-xl backdrop-blur-sm">
                    <BookOpen className="w-3.5 h-3.5 text-[#D9A83E]" />
                    <span>{bookCount} {bookCount === 1 ? 'Book' : 'Books'}</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-[#D9A83E] transition-colors truncate">
                    {library.name}
                  </h3>
                  {library.address && (
                    <div className="flex items-center gap-1.5 text-xs text-[#CBD5E1] font-medium truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#D9A83E] shrink-0" />
                      <span className="truncate">{library.address}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Link */}
                <div className="pt-2 flex items-center justify-between border-t border-[#DCE6F0]/15">
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
