import { useMemo } from 'react';
import { Tag } from 'lucide-react';

export default function CategoryDistributionChart({ categories = [] }) {
  const totalBooks = useMemo(() => {
    return categories.reduce((acc, cat) => acc + (cat.books_count ?? 0), 0);
  }, [categories]);

  const colorPalette = ['#d99a18', '#1a73e8', '#137333', '#9333ea', '#e11d48', '#0284c7', '#65a30d'];

  const topCategories = useMemo(() => {
    return categories.slice(0, 4);
  }, [categories]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 lg:p-4 space-y-2 shadow-2xs h-[155px] flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 shrink-0">
        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight">
          Book Categories
        </h3>
        <Tag className="w-4 h-4 text-amber-600 shrink-0" />
      </div>

      {topCategories.length === 0 ? (
        <div className="flex-1 text-center text-[10px] text-slate-400 font-medium italic bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center min-h-0">
          <span>No category data available.</span>
        </div>
      ) : (
        <div className="space-y-1.5 flex-1 overflow-hidden flex flex-col justify-center min-h-0">
          {topCategories.map((cat, idx) => {
            const count = cat.books_count ?? 0;
            const pct = totalBooks > 0 ? Math.round((count / totalBooks) * 100) : 0;
            const color = colorPalette[idx % colorPalette.length];

            return (
              <div key={cat.id || idx} className="space-y-0.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-extrabold text-slate-800 flex items-center gap-1.5 truncate max-w-[160px]">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    {cat.name}
                  </span>
                  <span className="font-bold text-slate-600 text-[10px]">
                    {count} {count === 1 ? 'book' : 'books'} ({pct}%)
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
