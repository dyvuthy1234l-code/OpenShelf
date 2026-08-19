import { ChevronLeft, ChevronRight } from 'lucide-react';

function buildPageItems(currentPage, lastPage) {
  if (lastPage <= 7) return Array.from({ length: lastPage }, (_, index) => index + 1);

  const pages = new Set([1, 2, lastPage - 1, lastPage, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < lastPage) pages.add(currentPage + 1);

  const sorted = [...pages].filter((page) => page >= 1 && page <= lastPage).sort((a, b) => a - b);
  const items = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) items.push(`ellipsis-${page}`);
    items.push(page);
  });
  return items;
}

export default function AdminPagination({
  currentPage = 1,
  lastPage = 1,
  total = 0,
  from = null,
  to = null,
  perPage = 10,
  onPageChange,
  onPerPageChange,
  label = 'records',
  showDetails = false,
}) {
  if (total === 0) return null;

  const firstItem = from ?? ((currentPage - 1) * perPage) + 1;
  const lastItem = to ?? Math.min(currentPage * perPage, total);
  const pageItems = buildPageItems(currentPage, lastPage);

  return (
    <div className="bg-slate-50/90 backdrop-blur-xs border-t border-slate-200/90 px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-center gap-2 text-xs select-none">
      {showDetails && (
        <div className="flex flex-wrap items-center gap-3 text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            Showing <strong className="font-black text-slate-900 px-1 py-0.5 bg-white rounded-md border border-slate-200/70 shadow-2xs">{firstItem}–{lastItem}</strong> of{' '}
            <strong className="font-black text-slate-900 px-1 py-0.5 bg-white rounded-md border border-slate-200/70 shadow-2xs">{total}</strong> {label}
          </span>

          {onPerPageChange && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <select
                value={perPage}
                onChange={(event) => onPerPageChange(Number(event.target.value))}
                className="px-2.5 py-1 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-2xs transition-all cursor-pointer"
                aria-label={`${label} per page`}
              >
                {[10, 25, 50].map((option) => (
                  <option key={option} value={option}>{option} per page</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200/90 rounded-lg font-bold text-slate-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:cursor-not-allowed hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition-all cursor-pointer"
        >
          <ChevronLeft className="w-3 h-3" />
          <span className="hidden sm:inline text-[11px] font-bold">Previous</span>
        </button>

        {pageItems.map((item) => (
          typeof item === 'string' ? (
            <span key={item} className="w-7 h-7 flex items-center justify-center text-slate-400 font-bold text-[11px]">…</span>
          ) : (
            <button
              type="button"
              key={item}
              onClick={() => onPageChange(item)}
              className={`w-7 h-7 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center justify-center ${
                currentPage === item
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-xs border border-amber-400/50 scale-[1.02]'
                  : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
              }`}
            >
              {item}
            </button>
          )
        ))}

        <button
          type="button"
          disabled={currentPage >= lastPage}
          onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200/90 rounded-lg font-bold text-slate-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:cursor-not-allowed hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition-all cursor-pointer"
        >
          <span className="hidden sm:inline text-[11px] font-bold">Next</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

