import { useMemo } from 'react';

export default function OverdueFineTrendCard({ circulationData = [] }) {
  const chartPoints = useMemo(() => {
    if (!circulationData || circulationData.length === 0) {
      return [
        { label: 'Jan', overdue: 2, fines: 10 },
        { label: 'Feb', overdue: 4, fines: 25 },
        { label: 'Mar', overdue: 3, fines: 15 },
        { label: 'Apr', overdue: 5, fines: 30 },
        { label: 'May', overdue: 2, fines: 20 },
        { label: 'Jun', overdue: 4, fines: 35 },
        { label: 'Jul', overdue: 6, fines: 45 },
        { label: 'Aug', overdue: 3, fines: 25 },
      ];
    }

    return circulationData.slice(-6).map((d) => ({
      label: d.month || 'M',
      overdue: Number(d.Overdue || d.overdue || 0),
      fines: Number(d.FineRevenue || d.fines || 0),
    }));
  }, [circulationData]);

  const maxVal = useMemo(() => {
    const vals = chartPoints.flatMap((p) => [p.overdue, p.fines]);
    return Math.max(...vals, 10);
  }, [chartPoints]);

  const svgWidth = 220;
  const svgHeight = 75;
  const padL = 20;
  const padR = 10;
  const padT = 10;
  const padB = 18;

  const getX = (i) => padL + (i / Math.max(chartPoints.length - 1, 1)) * (svgWidth - padL - padR);
  const getY = (val) => padT + (1 - val / maxVal) * (svgHeight - padT - padB);

  const ovePts = chartPoints.map((p, i) => `${getX(i)},${getY(p.overdue)}`).join(' ');
  const finPts = chartPoints.map((p, i) => `${getX(i)},${getY(p.fines)}`).join(' ');

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs h-[165px] flex flex-col justify-between">
      <div className="space-y-0.5 shrink-0">
        <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">OVERDUE & FINE TREND</h4>
        <p className="text-[9.5px] font-medium text-slate-400">Overdue books and fines collected.</p>
        <div className="flex items-center gap-3 text-[10px] font-bold pt-0.5">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-slate-600">Overdue Books</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Fine Amount (USD)</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative flex items-center justify-center pt-1">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full" preserveAspectRatio="none">
          <polyline fill="none" stroke="#e11d48" strokeWidth="2" points={ovePts} />
          <polyline fill="none" stroke="#10b981" strokeWidth="2" points={finPts} />

          {chartPoints.map((p, i) => (
            <g key={i}>
              <circle cx={getX(i)} cy={getY(p.overdue)} r="3" fill="#e11d48" stroke="#ffffff" strokeWidth="1" />
              <circle cx={getX(i)} cy={getY(p.fines)} r="3" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
              <text x={getX(i)} y={svgHeight - 2} textAnchor="middle" fontSize="8" fontWeight="600" fill="#94a3b8">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
