import { useMemo } from 'react';
import { Tag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CategoryDistributionChart({ categories = [] }) {
  const totalBooks = useMemo(() => {
    return categories.reduce((acc, cat) => acc + Number(cat.books_count ?? cat.count ?? 0), 0);
  }, [categories]);

  const colorPalette = ['#2563eb', '#10b981', '#9333ea', '#f43f5e', '#f59e0b', '#0284c7', '#84cc16'];

  const topCategories = useMemo(() => {
    return categories.slice(0, 5);
  }, [categories]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 lg:p-4 space-y-2.5 shadow-2xs h-auto min-h-[250px] lg:h-[250px] flex flex-col justify-between">
      {/* Header with View All action link */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
        <h3 className="text-xs font-black text-slate-900 tracking-tight leading-none uppercase flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-amber-600 shrink-0" />
          Book Categories
        </h3>

        <Link
          to="/librarian/categories"
          className="text-[10px] font-black text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors group shrink-0"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {topCategories.length === 0 ? (
        <div className="flex-1 text-center text-xs text-slate-400 font-medium italic bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center p-6 min-h-[140px]">
          <span>No category data available.</span>
        </div>
      ) : (
        <div className="space-y-2 flex-1 flex flex-col justify-around py-0.5 min-h-0">
          {topCategories.map((cat, idx) => {
            const count = Number(cat.books_count ?? cat.count ?? 0);
            const pct = totalBooks > 0 ? Math.round((count / totalBooks) * 100) : 0;
            const color = colorPalette[idx % colorPalette.length];

            return (
              <motion.div
                key={cat.id || idx}
                initial={{ opacity: 0.5, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-800 flex items-center gap-2 truncate max-w-[170px] text-[11px]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: color }} />
                    {cat.name}
                  </span>
                  <span className="font-bold text-slate-600 text-[10px]">
                    {count} {count === 1 ? 'book' : 'books'} ({pct}%)
                  </span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                  <div
                    className="h-full rounded-full transition-all duration-300 shadow-2xs"
                    style={{ width: `${Math.max(pct, 4)}%`, backgroundColor: color }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
