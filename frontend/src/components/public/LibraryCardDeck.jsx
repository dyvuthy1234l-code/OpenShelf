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
      <div className="w-full max-w-md sm:max-w-lg h-80 sm:h-96 bg-slate-900/80 border border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center p-6 shadow-2xl">
        <Building2 className="w-14 h-14 text-amber-400/40 mb-3" />
        <p className="text-white font-bold text-base mb-1">OpenShelf Network</p>
        <p className="text-slate-400 text-xs">Connecting community libraries across Cambodia</p>
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
              className={`absolute top-0 left-0 right-0 cursor-pointer bg-[#111A2E] border ${
                isTop ? 'border-[#F59E0B]/45 shadow-[0_20px_50px_rgba(0,0,0,0.25)]' : 'border-[#26344D]'
              } rounded-3xl p-4 sm:p-5 overflow-hidden backdrop-blur-xl transition-all duration-300 group`}
            >
              {/* Top Cover Header Banner */}
              <div className="relative h-32 sm:h-40 bg-[#0B1220] rounded-2xl overflow-hidden border border-[#26344D]">
                {coverUrl ? (
                  <img src={coverUrl} alt={library.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#0B1220] via-[#111A2E] to-[#18181B] flex items-center justify-center text-[#F59E0B]/40">
                    <Building2 className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/80 via-transparent to-transparent pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-[#0B1220]/90 backdrop-blur-md border border-[#F59E0B]/40 text-[#FBBF24] px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Featured Partner</span>
                </div>
              </div>

              {/* Overlapping Logo Avatar & Library Header Details */}
              <div className="px-2 pt-0 relative space-y-2">
                <div className="flex items-end justify-between gap-3 -mt-7 sm:-mt-8 relative z-10">
                  {/* Overlapping Logo Avatar Badge */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 shadow-xl border-2 border-[#111A2E] overflow-hidden shrink-0 flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt={library.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full bg-[#F59E0B] rounded-xl flex items-center justify-center text-[#0B1220] font-black text-lg">
                        <Building2 className="w-7 h-7 text-[#0B1220]" />
                      </div>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-[10px] sm:text-xs font-bold mb-1">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span>● Active</span>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div>
                  <h4 className="text-base sm:text-lg font-black text-[#F8FAFC] line-clamp-1 group-hover:text-[#FBBF24] transition-colors tracking-tight">
                    {library.name}
                  </h4>
                  <p className="text-[11px] text-[#94A3B8] font-medium">Library ID: #{library.id}</p>
                </div>

                {/* Info Highlights (Province & Book Count) */}
                <div className="pt-2 border-t border-[#26344D] space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-[#CBD5E1] bg-[#0B1220] border border-[#26344D] px-2.5 py-1 rounded-xl truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                      <span className="truncate">{library.city ? `Province: ${library.city}` : (library.address || 'Phnom Penh')}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[#FBBF24] bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-2.5 py-1 rounded-xl shrink-0 font-bold">
                      <BookOpen className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>{bookCount} Books</span>
                    </div>
                  </div>

                  {/* Amber Button */}
                  <div className="inline-flex items-center justify-between w-full py-2.5 px-4 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0B1220] text-xs font-extrabold rounded-xl transition-all duration-200 shadow-md group/btn cursor-pointer">
                    <span>Explore Library Profile</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform shrink-0" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
