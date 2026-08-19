import { useMemo } from 'react';

export default function BorrowingTrendCard({ circulationData = [] }) {
  const chartPoints = useMemo(() => {
    if (!circulationData || circulationData.length === 0) {
      return [
        { label: 'Jan', borrowed: 4, returned: 2 },
        { label: 'Feb', borrowed: 6, returned: 3 },
        { label: 'Mar', borrowed: 5, returned: 4 },
        { label: 'Apr', borrowed: 7, returned: 3 },
        { label: 'May', borrowed: 6, returned: 5 },
        { label: 'Jun', borrowed: 8, returned: 4 },
        { label: 'Jul', borrowed: 7, returned: 5 },
        { label: 'Aug', borrowed: 9, returned: 6 },
      ];
    }

    return circulationData.slice(-6).map((d) => ({
      label: d.month || 'M',
      borrowed: Number(d.Borrowed || d.borrowed || 0),
      returned: Number(d.Returns || 0),
    }));
  }, [circulationData]);

  const maxVal = useMemo(() => {
    const vals = chartPoints.flatMap((p) => [p.borrowed, p.returned]);
    return Math.max(...vals, 8);
  }, [chartPoints]);

  const svgWidth = 220;
  const svgHeight = 75;
  const padL = 20;
  const padR = 10;
  const padT = 10;
  const padB = 18;

  const getX = (i) => padL + (i / Math.max(chartPoints.length - 1, 1)) * (svgWidth - padL - padR);
  const getY = (val) => padT + (1 - val / maxVal) * (svgHeight - padT - padB);

  const borPts = chartPoints.map((p, i) => `${getX(i)},${getY(p.borrowed)}`).join(' ');
  const retPts = chartPoints.map((p, i) => `${getX(i)},${getY(p.returned)}`).join(' ');

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs h-[165px] flex flex-col justify-between">
      <div className="space-y-0.5 shrink-0">
        <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">BORROWING TREND</h4>
        <p className="text-[9.5px] font-medium text-slate-400">Trend of borrowed and returned books.</p>
        <div className="flex items-center gap-3 text-[10px] font-bold pt-0.5">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-slate-600">Borrowed</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-slate-600">Returned</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative flex items-center justify-center pt-1">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full" preserveAspectRatio="none">
          <polyline fill="none" stroke="#2563eb" strokeWidth="2" points={borPts} />
          <polyline fill="none" stroke="#10b981" strokeWidth="2" points={retPts} />

          {chartPoints.map((p, i) => (
            <g key={i}>
              <circle cx={getX(i)} cy={getY(p.borrowed)} r="3" fill="#2563eb" stroke="#ffffff" strokeWidth="1" />
              <circle cx={getX(i)} cy={getY(p.returned)} r="3" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
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
