import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AnimatedPagination({ currentPage, lastPage, onPageChange }) {
  const safeLastPage = Math.max(1, Math.floor(Number(lastPage) || 1));
  const safeCurrentPage = Math.max(1, Math.min(Math.floor(Number(currentPage) || 1), safeLastPage));

  if (safeLastPage <= 1) return null;

  const pages = Array.from({ length: safeLastPage }, (_, i) => i + 1);

  // Sliding window logic to show limited pages
  const getVisiblePages = () => {
    if (safeLastPage <= 5) return pages;
    if (safeCurrentPage <= 3) return [1, 2, 3, 4, 5];
    if (safeCurrentPage >= safeLastPage - 2) return [safeLastPage - 4, safeLastPage - 3, safeLastPage - 2, safeLastPage - 1, safeLastPage];
    return [safeCurrentPage - 2, safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, safeCurrentPage + 2];
  };

  const visiblePages = getVisiblePages();

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 sm:gap-2.5 mt-10 select-none">
      {/* Previous Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => onPageChange(safeCurrentPage - 1)}
        disabled={safeCurrentPage === 1}
        aria-label="Previous page"
        className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white border border-slate-200/90 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-50 hover:border-amber-400 hover:text-amber-700 transition-colors shadow-2xs cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
      </motion.button>

      {/* Page Number Buttons */}
      {visiblePages.map((p) => {
        const isActive = p === safeCurrentPage;
        return (
          <motion.button
            key={p}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onPageChange(p)}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex items-center justify-center w-11 h-11 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
              isActive
                ? 'text-slate-950 font-black shadow-md'
                : 'text-slate-600 bg-white hover:bg-amber-50/80 border border-slate-200/90 hover:border-amber-300 hover:text-amber-700 shadow-2xs'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activePagePill"
                className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-amber-400 to-amber-300 border border-amber-500 rounded-2xl shadow-md"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{p}</span>
          </motion.button>
        );
      })}

      {/* Next Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => onPageChange(safeCurrentPage + 1)}
        disabled={safeCurrentPage === safeLastPage}
        aria-label="Next page"
        className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white border border-slate-200/90 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-50 hover:border-amber-400 hover:text-amber-700 transition-colors shadow-2xs cursor-pointer"
      >
        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
      </motion.button>
    </nav>
  );
}
