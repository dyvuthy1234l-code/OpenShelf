import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AnimatedPagination({ currentPage, lastPage, onPageChange }) {
  if (!lastPage || lastPage <= 1) return null;

  const pages = Array.from({ length: lastPage }, (_, i) => i + 1);

  // Sliding window logic to show limited pages
  const getVisiblePages = () => {
    if (lastPage <= 5) return pages;
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= lastPage - 2) return [lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };

  const visiblePages = getVisiblePages();

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 sm:gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {visiblePages.map((p) => {
        const isActive = p === currentPage;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex items-center justify-center w-11 h-11 rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-sm ${
              isActive ? 'text-amber-950 border border-amber-400' : 'text-slate-600 bg-white hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activePageIndicator"
                className="absolute inset-0 bg-amber-400 rounded-xl"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
            <span className="relative z-10">{p}</span>
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        aria-label="Next page"
        className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
