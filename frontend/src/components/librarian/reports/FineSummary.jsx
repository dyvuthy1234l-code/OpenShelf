import { useMemo } from 'react';
import { DollarSign, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function FineSummary({ reportData, circulationData = [] }) {
  const overdueCount = Number(reportData?.overdue_books ?? 0);
  const collected = Number(reportData?.collected_fines ?? 0);
  const unpaid = Number(reportData?.unpaid_fines ?? reportData?.outstanding_fines ?? 0);

  // Financial Trend data from backend monthly_circulation array
  const trendPoints = useMemo(() => {
    if (!circulationData || !Array.isArray(circulationData) || circulationData.length === 0) {
      return [];
    }
    return circulationData.map((d) => ({
      month: d.month || 'M',
      fineVal: Number(d.FineRevenue || d.fines || 0),
    }));
  }, [circulationData]);

  const maxFineMonthly = useMemo(() => {
    if (!trendPoints.length) return 10;
    const values = trendPoints.map((d) => d.fineVal);
    const max = Math.max(...values, 5);
    return Math.ceil(max / 5) * 5 || 10;
  }, [trendPoints]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 lg:p-5 flex flex-col justify-between shadow-2xs h-[230px] min-h-[230px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
            OVERDUE & FINE TREND
          </h3>
          <p className="text-[10.5px] font-medium text-slate-400">
            Overdue books tracking and fine collection performance.
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
          <DollarSign className="w-4 h-4" />
        </div>
      </div>

      {/* 3 Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 shrink-0 my-1">
        {/* 1. Overdue Books */}
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-2 sm:p-2.5 space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-extrabold text-rose-800 tracking-wider">Overdue</span>
            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
          </div>
          <span className="text-base sm:text-lg font-black text-rose-950 block leading-tight">{overdueCount}</span>
          <span className="text-[9.5px] text-rose-700 font-bold block truncate">Overdue loans</span>
        </div>

        {/* 2. Collected Fines */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2 sm:p-2.5 space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-extrabold text-emerald-800 tracking-wider">Collected</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          </div>
          <span className="text-base sm:text-lg font-black text-emerald-950 block leading-tight">${collected.toFixed(2)}</span>
          <span className="text-[9.5px] text-emerald-700 font-bold block truncate">Paid fines</span>
        </div>

        {/* 3. Outstanding Unpaid Fines */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2 sm:p-2.5 space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-extrabold text-amber-800 tracking-wider">Unpaid</span>
            <Clock className="w-3 h-3 text-amber-600 shrink-0" />
          </div>
          <span className="text-base sm:text-lg font-black text-amber-950 block leading-tight">${unpaid.toFixed(2)}</span>
          <span className="text-[9.5px] text-amber-700 font-bold block truncate">Outstanding</span>
        </div>
      </div>

      {/* Fine Revenue Trend Bar Visualizer */}
      <div className="pt-1.5 border-t border-slate-100 flex-1 min-h-0 flex flex-col justify-end">
        {trendPoints.length === 0 ? (
          <div className="py-2 text-center text-[10.5px] text-slate-400 font-medium italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
            No fine trend records for this period.
          </div>
        ) : (
          <div className="h-14 flex items-end justify-between gap-1.5 px-1 pt-1">
            {trendPoints.map((d, idx) => {
              const pct = Math.round((d.fineVal / maxFineMonthly) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                  <div
                    style={{ height: `${Math.max(pct, 12)}%` }}
                    className="w-full max-w-[28px] bg-emerald-500 rounded-t-md transition-all duration-300 group-hover:bg-emerald-600 relative flex items-center justify-center shadow-2xs"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 text-[9px] font-extrabold text-emerald-950 bg-emerald-100 px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap z-10 pointer-events-none">
                      ${d.fineVal.toFixed(2)}
                    </div>
                  </div>
                  <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[36px]">{d.month}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
