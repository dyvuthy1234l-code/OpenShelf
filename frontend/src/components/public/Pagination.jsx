import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage = 1, lastPage = 1, onPageChange }) {
  if (lastPage <= 1) return null;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1;

    for (let i = 1; i <= lastPage; i++) {
      if (
        i === 1 ||
        i === lastPage ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav aria-label="Pagination" className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-brand-border/80">
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="os-btn-secondary inline-flex min-h-11 items-center gap-1 px-3.5 py-2 text-xs font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="os-btn-secondary inline-flex min-h-11 items-center gap-1 px-3.5 py-2 text-xs font-bold"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400 font-semibold">
                ...
              </span>
            );
          }
          const isCurrent = p === currentPage;
          return (
            <button
              key={`page-${p}`}
              onClick={() => onPageChange(p)}
              aria-current={isCurrent ? 'page' : undefined}
              className={`w-11 h-11 rounded-xl text-xs font-bold transition-all ${
                isCurrent
                  ? 'bg-navy-800 text-white shadow-sm'
                  : 'os-btn-secondary'
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
