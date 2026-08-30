import { useState, useMemo } from 'react';
import { Star } from 'lucide-react';
import BookCard from './BookCard';

export default function HighlyRatedMarquee({ books = [], loading = false, error = null }) {
  const [isPaused, setIsPaused] = useState(false);

  // Filter books with real ratings (> 0) and sort by rating DESC, then count DESC
  const ratedBooks = useMemo(() => {
    if (!books || books.length === 0) return [];
    const list = books.filter((b) => {
      const avg = Number(b.reviews_avg_rating ?? b.rating ?? 0);
      const count = Number(b.reviews_count ?? b.rating_count ?? 0);
      return avg > 0 && count > 0;
    });

    list.sort((a, b) => {
      const avgA = Number(a.reviews_avg_rating ?? a.rating ?? 0);
      const avgB = Number(b.reviews_avg_rating ?? b.rating ?? 0);
      if (avgB !== avgA) return avgB - avgA;

      const countA = Number(a.reviews_count ?? a.rating_count ?? 0);
      const countB = Number(b.reviews_count ?? b.rating_count ?? 0);
      return countB - countA;
    });

    return list;
  }, [books]);

  // Duplicate books array for infinite seamless right-to-left marquee loop
  const duplicatedBooks = useMemo(() => {
    if (ratedBooks.length === 0) return [];
    let list = [...ratedBooks];
    while (list.length < 8) {
      list = [...list, ...ratedBooks];
    }
    return [...list, ...list];
  }, [ratedBooks]);

  const animDuration = Math.max(25, duplicatedBooks.length * 3.5);

  if (loading) {
    return (
      <div className="flex items-center gap-4 overflow-hidden py-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-48 sm:w-56 shrink-0 bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-3 shadow-2xs animate-pulse"
          >
            <div className="w-full h-48 bg-slate-100 rounded-xl" />
            <div className="h-3.5 bg-slate-100 rounded-md w-3/4" />
            <div className="h-3 bg-slate-100 rounded-md w-1/2" />
            <div className="h-7 bg-slate-100 rounded-xl w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-rose-800 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold">
        {error}
      </div>
    );
  }

  if (ratedBooks.length === 0) {
    return (
      <div className="py-10 text-center bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-1">
          <Star className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900">No rated books available yet.</h3>
        <p className="text-xs text-slate-500">Books will appear here once members rate them.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden py-2 select-none">
      <style>{`
        @keyframes marquee-scroll-loop {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-marquee-loop {
          animation: marquee-scroll-loop ${animDuration}s linear infinite;
        }
      `}</style>

      {/* Edge Fade Gradients - matching page background in both light & dark mode */}
      <div className="absolute top-0 bottom-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[#F7FAFD] dark:from-[#07172B] via-[#F7FAFD]/80 dark:via-[#07172B]/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[#F7FAFD] dark:from-[#07172B] via-[#F7FAFD]/80 dark:via-[#07172B]/80 to-transparent z-10 pointer-events-none" />

      <div
        className="w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex items-stretch gap-4 w-max animate-marquee-loop"
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {duplicatedBooks.map((book, idx) => (
            <div
              key={`${book.id}-${idx}`}
              className="w-36 sm:w-44 shrink-0 h-full transition-transform duration-200 hover:scale-[1.03]"
            >
              <BookCard book={book} compact={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
