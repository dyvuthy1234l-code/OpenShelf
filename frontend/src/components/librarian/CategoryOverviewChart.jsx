import { useMemo } from 'react';
import { Layers, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CategoryOverviewChart({ categories = [], reports = null }) {
  // Extract category distribution data from reports or fallback to categories list
  const categoryData = useMemo(() => {
    let list = [];
    if (Array.isArray(reports?.category_distribution) && reports.category_distribution.length > 0) {
      list = reports.category_distribution.map((item) => ({
        id: item.id,
        name: item.name,
        count: Number(item.count ?? item.books_count ?? 0),
      }));
    } else if (Array.isArray(categories) && categories.length > 0) {
      list = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        count: Number(cat.books_count ?? cat.count ?? 0),
      }));
    }

    // Sort by count descending
    list.sort((a, b) => b.count - a.count);

    // Take top 4 categories and group the rest into "Others" if more than 5
    if (list.length > 5) {
      const top4 = list.slice(0, 4);
      const rest = list.slice(4);
      const othersCount = rest.reduce((acc, c) => acc + c.count, 0);
      return [
        ...top4,
        { id: 'others', name: 'Others', count: othersCount },
      ];
    }

    return list;
  }, [reports, categories]);

  // Compute total books count
  const totalBooks = useMemo(() => {
    if (reports?.total_books && Number(reports.total_books) > 0) {
      return Number(reports.total_books);
    }
    return categoryData.reduce((acc, item) => acc + item.count, 0);
  }, [reports, categoryData]);

  // Color palette matching OpenShelf theme exactly
  const colorPalette = ['#2563eb', '#10b981', '#9333ea', '#f43f5e', '#f59e0b', '#0284c7', '#84cc16'];

  // SVG Donut Chart Math Calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.29

  const donutSlices = useMemo(() => {
    if (totalBooks <= 0 || categoryData.length === 0) return [];

    let accumulatedAngle = -90; // Start at top (12 o'clock)
    let accumulatedOffset = 0;

    return categoryData.map((cat, idx) => {
      const pct = totalBooks > 0 ? (cat.count / totalBooks) * 100 : 0;
      const roundedPct = Math.round(pct);
      const strokeDash = (pct / 100) * circumference;
      const strokeGap = circumference - strokeDash;
      const dashOffset = -accumulatedOffset;

      // Label positioning angle at midpoint of slice
      const sliceAngle = (pct / 100) * 360;
      const midAngle = accumulatedAngle + sliceAngle / 2;
      const rad = (midAngle * Math.PI) / 180;
      const labelX = 80 + radius * Math.cos(rad);
      const labelY = 80 + radius * Math.sin(rad);

      accumulatedOffset += strokeDash;
      accumulatedAngle += sliceAngle;

      return {
        ...cat,
        pct: roundedPct,
        exactPct: pct,
        color: colorPalette[idx % colorPalette.length],
        strokeDasharray: `${strokeDash} ${strokeGap}`,
        strokeDashoffset: dashOffset,
        labelX,
        labelY,
      };
    });
  }, [categoryData, totalBooks, circumference]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 lg:p-4 shadow-2xs h-auto min-h-[250px] lg:h-[250px] flex flex-col justify-between space-y-2.5">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
        <div className="flex flex-col min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-600 shrink-0" />
            <h3 className="text-xs font-black text-slate-900 tracking-tight leading-none uppercase">
              Category Overview
            </h3>
          </div>
          <p className="text-[10px] font-medium text-slate-500 leading-none">
            Distribution of books by category
          </p>
        </div>

        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-lg border border-slate-200/70 shrink-0 shadow-2xs">
          <span>All Books</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>
      </div>

      {/* Main Content Body */}
      {categoryData.length === 0 ? (
        <div className="flex-1 text-center text-xs text-slate-400 font-medium italic bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center p-6 min-h-[140px]">
          No category distribution available.
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 items-center min-h-0">
          {/* Donut Chart Viewport (5 Columns on Desktop) */}
          <div className="md:col-span-5 flex items-center justify-center relative py-1">
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 160 160"
                className="w-full h-full transform -rotate-90 overflow-visible"
              >
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="22"
                />

                {/* Animated Segment Slices */}
                {donutSlices.map((slice, idx) => (
                  <motion.circle
                    key={slice.id || idx}
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="22"
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    strokeLinecap="butt"
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray: slice.strokeDasharray }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.08 }}
                    className="transition-all duration-300 hover:opacity-90 cursor-pointer"
                  />
                ))}

                {/* Percentage Labels inside segments for larger slices */}
                {donutSlices.map((slice, idx) => {
                  if (slice.pct < 10) return null;
                  return (
                    <g
                      key={`lbl-${idx}`}
                      className="transform rotate-90"
                      style={{ transformOrigin: '80px 80px' }}
                    >
                      <text
                        x={slice.labelX}
                        y={slice.labelY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="9"
                        fontWeight="900"
                        fill="#ffffff"
                        className="pointer-events-none drop-shadow-xs select-none"
                      >
                        {slice.pct}%
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Center Donut Label Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <motion.span
                  key={totalBooks}
                  initial={{ opacity: 0.5, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-black text-slate-900 leading-none tracking-tight"
                >
                  {totalBooks}
                </motion.span>
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider mt-0.5">
                  Total Books
                </span>
              </div>
            </div>
          </div>

          {/* Legend Items List (7 Columns on Desktop) */}
          <div className="md:col-span-7 space-y-1.5 py-0.5">
            {donutSlices.map((item, idx) => (
              <motion.div
                key={item.id || idx}
                initial={{ opacity: 0.5, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-extrabold text-slate-800 text-[11px] truncate max-w-[110px] sm:max-w-[130px]">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-bold text-slate-500 min-w-[50px] text-right">
                    {item.count} {item.count === 1 ? 'book' : 'books'}
                  </span>
                  <span className="text-[10px] font-black text-slate-900 bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 rounded-md min-w-[32px] text-center shadow-2xs">
                    {item.pct}%
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
