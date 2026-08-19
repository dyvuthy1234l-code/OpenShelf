import { useMemo } from 'react';

export default function CategoryDistributionCard({ categories = [], borrowings = [], reportData = null }) {
  const categoryStats = useMemo(() => {
    const colors = ['#f59e0b', '#2563eb', '#10b981', '#9333ea', '#ec4899', '#06b6d4', '#64748b'];

    // 1. Backend provided book category distribution (from books table join)
    if (reportData?.category_distribution && Array.isArray(reportData.category_distribution) && reportData.category_distribution.length > 0) {
      return reportData.category_distribution.map((cat, idx) => ({
        id: cat.id || idx,
        name: cat.name,
        count: Number(cat.count || 0),
        color: colors[idx % colors.length],
      })).slice(0, 5);
    }

    // 2. Compute fallback from categories array
    if (categories && categories.length > 0) {
      const list = categories.map((cat, idx) => ({
        id: cat.id || idx,
        name: cat.name,
        count: Number(cat.books_count ?? 0),
        color: colors[idx % colors.length],
      }));
      return list.sort((a, b) => b.count - a.count).slice(0, 5);
    }

    return [];
  }, [categories, reportData]);

  const total = useMemo(() => {
    return categoryStats.reduce((acc, i) => acc + Number(i.count || 0), 0);
  }, [categoryStats]);

  const maxCount = useMemo(() => {
    return Math.max(...categoryStats.map((c) => c.count), 1);
  }, [categoryStats]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 lg:p-5 flex flex-col justify-between shadow-2xs h-[230px] min-h-[230px]">
      {/* Header */}
      <div className="border-b border-slate-100 pb-2.5 shrink-0">
        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
          BOOK DISTRIBUTION BY CATEGORY
        </h3>
        <p className="text-[10.5px] font-medium text-slate-400">
          Books distribution by category. Total: <strong className="text-slate-700">{total} books</strong>
        </p>
      </div>

      {/* Main Content: Clean Horizontal Bar Chart */}
      {categoryStats.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-xs text-slate-400 font-medium italic bg-slate-50 rounded-xl border border-dashed border-slate-200 my-1">
          No category distribution data recorded.
        </div>
      ) : (
        <div className="space-y-2 flex-1 min-h-0 flex flex-col justify-center py-1">
          {categoryStats.map((item) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            const barWidth = Math.max(Math.round((item.count / maxCount) * 100), 6);

            return (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-800 text-[11px] truncate max-w-[130px] sm:max-w-[160px]" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-slate-900 text-xs shrink-0 font-extrabold">
                    {item.count} <span className="text-slate-400 text-[10px] font-medium">({pct}%)</span>
                  </span>
                </div>

                {/* Bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%`, backgroundColor: item.color }}
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
