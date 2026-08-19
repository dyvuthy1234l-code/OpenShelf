import { useMemo } from 'react';

export default function StatusBreakdown({ breakdown = [], reportData = null }) {
  const items = useMemo(() => {
    // 1. If breakdown prop provided
    let list = Array.isArray(breakdown) && breakdown.length > 0 ? breakdown : [];

    // 2. Fallback to reportData status counts
    if (list.length === 0 && reportData) {
      list = [
        { name: 'Pending', value: reportData.pending_requests ?? 0, color: '#f59e0b' },
        { name: 'Approved', value: reportData.approved_requests ?? 0, color: '#2563eb' },
        { name: 'Borrowed', value: reportData.borrowed_books ?? 0, color: '#9333ea' },
        { name: 'Returned', value: reportData.returned_books ?? 0, color: '#10b981' },
        { name: 'Rejected', value: reportData.rejected_requests ?? 0, color: '#ef4444' },
      ];
    }

    const colorMap = {
      Pending: '#f59e0b',
      Approved: '#2563eb',
      Borrowed: '#9333ea',
      Returned: '#10b981',
      Rejected: '#ef4444',
    };

    return list.map((item) => ({
      name: item.name,
      value: Number(item.value || 0),
      color: item.color || colorMap[item.name] || '#64748b',
    }));
  }, [breakdown, reportData]);

  const total = useMemo(() => {
    return items.reduce((acc, i) => acc + Number(i.value || 0), 0);
  }, [items]);

  const circumference = 2 * Math.PI * 36; // radius = 36 => ~226.19

  const slices = useMemo(() => {
    let accumulatedPct = 0;
    return items.map((item) => {
      const val = Number(item.value || 0);
      const pct = total > 0 ? val / total : 0;
      const strokeLength = pct * circumference;
      const strokeDasharray = `${strokeLength} ${circumference - strokeLength}`;
      const strokeDashoffset = -(accumulatedPct * circumference);
      accumulatedPct += pct;

      return {
        ...item,
        pct: total > 0 ? Math.round(pct * 100) : 0,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [items, total, circumference]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 lg:p-5 flex flex-col justify-between shadow-2xs h-[260px] min-h-[260px]">
      {/* Header */}
      <div className="border-b border-slate-100 pb-2.5 shrink-0">
        <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
          REQUEST STATUS BREAKDOWN
        </h3>
        <p className="text-[10.5px] font-medium text-slate-400">
          Overall request status in selected period.
        </p>
      </div>

      {/* Main Content: Donut Chart on Left, Legend List on Right */}
      {total === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-xs text-slate-400 font-medium italic bg-slate-50 rounded-xl border border-dashed border-slate-200 my-1">
          No request status records found.
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 flex-1 min-h-0">
          {/* SVG Donut Chart with Center Count */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Background Circle */}
              <circle cx="50" cy="50" r="36" fill="none" stroke="#f1f5f9" strokeWidth="15" />

              {/* Colored Donut Slices */}
              {slices.map((slice, idx) => (
                <circle
                  key={idx}
                  cx="50"
                  cy="50"
                  r="36"
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="15"
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all duration-500"
                />
              ))}
            </svg>

            {/* Center Overlay Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none space-y-0">
              <span className="text-lg sm:text-xl font-black text-slate-900 leading-none">{total}</span>
              <span className="text-[8.5px] sm:text-[9px] font-extrabold text-slate-400 leading-tight">Total Requests</span>
            </div>
          </div>

          {/* Legend List on Right */}
          <div className="space-y-1.5 flex-1 min-w-0">
            {slices.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-extrabold text-slate-800 text-[11px] truncate">{item.name}</span>
                </div>
                <span className="font-extrabold text-slate-900 text-xs shrink-0 pl-1">
                  {item.value}{' '}
                  <span className="text-slate-400 font-bold text-[10px]">({item.pct}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
