import { useMemo } from 'react';
import { Tag } from 'lucide-react';

export default function PopularCategories({ categories = [], borrowings = [] }) {
  const categoryStats = useMemo(() => {
    // Map borrowings count per category
    const counts = {};

    borrowings.forEach((b) => {
      if (b.book && b.book.category_id) {
        const catId = b.book.category_id;
        counts[catId] = (counts[catId] || 0) + 1;
      }
    });

    return categories
      .map((cat) => ({
        ...cat,
        borrow_count: counts[cat.id] || 0,
      }))
      .sort((a, b) => b.borrow_count - a.borrow_count)
      .slice(0, 5);
  }, [categories, borrowings]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-amber-700">
            Most Popular Categories
          </h3>
          <p className="text-xs text-slate-500">Subject demand by total borrowed volumes</p>
        </div>
        <Tag className="w-5 h-5 text-amber-600 shrink-0" />
      </div>

      {categoryStats.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 italic">
          No category circulation data available.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {categoryStats.map((cat, idx) => (
            <div key={cat.id || idx} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="font-extrabold text-slate-900 text-xs truncate block">{cat.name}</span>
                  <p className="text-[11px] text-slate-500 truncate">{cat.books_count ?? 0} Catalogued Books</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-extrabold shrink-0 border border-slate-200">
                {cat.borrow_count} Borrows
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
