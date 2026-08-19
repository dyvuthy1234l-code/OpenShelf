import { useMemo, useState } from 'react';

export default function BorrowingChart({ circulationData = [], borrowings = [], timeFilter = 'month', library = null }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Multi-series line chart data mapping - dynamically switches between hourly (Today), daily (Week), weekly (Month), monthly (Year), and all time progression
  const chartPoints = useMemo(() => {
    const tf = (timeFilter || 'month').toLowerCase();
    const now = new Date();
    const isSameDay = (d1, d2) => d1 && d2 && d1.toDateString() === d2.toDateString();

    if (tf === 'today') {
      let startHour = 8;
      let endHour = 17;

      const parseTimeStr = (tStr) => {
        if (!tStr) return null;
        const match = tStr.match(/^(\d{1,2}):(\d{2})/);
        if (match) {
          let h = parseInt(match[1], 10);
          const isPm = tStr.toLowerCase().includes('pm');
          const isAm = tStr.toLowerCase().includes('am');
          if (isPm && h < 12) h += 12;
          if (isAm && h === 12) h = 0;
          return h;
        }
        return null;
      };

      const openParsed = parseTimeStr(library?.opening_time);
      const closeParsed = parseTimeStr(library?.closing_time);

      if (openParsed !== null) startHour = openParsed;
      if (closeParsed !== null) endHour = closeParsed;

      if (openParsed === null || closeParsed === null) {
        const hoursStr = library?.opening_hours || '';
        const timesMatch = hoursStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?.*?(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timesMatch) {
          let h1 = parseInt(timesMatch[1], 10);
          const period1 = timesMatch[3]?.toUpperCase();
          if (period1 === 'PM' && h1 < 12) h1 += 12;
          if (period1 === 'AM' && h1 === 12) h1 = 0;

          let h2 = parseInt(timesMatch[4], 10);
          const period2 = timesMatch[6]?.toUpperCase();
          if (period2 === 'PM' && h2 < 12) h2 += 12;
          if (period2 === 'AM' && h2 === 12) h2 = 0;

          if (h1 >= 0 && h1 <= 23) startHour = h1;
          if (h2 > startHour && h2 <= 23) endHour = h2;
        }
      }

      if (endHour <= startHour) {
        endHour = Math.min(startHour + 9, 23);
      }

      const hourCheckpoints = [];
      const span = endHour - startHour;
      const step = span > 6 ? 2 : 1;

      for (let h = startHour; h < endHour; h += step) {
        hourCheckpoints.push(h);
      }
      if (!hourCheckpoints.includes(endHour)) {
        hourCheckpoints.push(endHour);
      }

      const formatLabel = (h) => {
        if (h === 0 || h === 24) return '12 AM';
        if (h === 12) return '12 PM';
        if (h > 12) return `${h - 12} PM`;
        return `${h} AM`;
      };

      const timeSlots = hourCheckpoints.map((h, idx) => {
        const nextH = idx < hourCheckpoints.length - 1 ? hourCheckpoints[idx + 1] : 24;
        return {
          label: formatLabel(h),
          startHour: h,
          endHour: nextH,
        };
      });

      return timeSlots.map((slot) => {
        let reqs = 0, appr = 0, borr = 0, rets = 0;

        (borrowings || []).forEach((b) => {
          const cDate = b.created_at || b.requested_at ? new Date(b.created_at || b.requested_at) : null;
          const aDate = b.approved_at ? new Date(b.approved_at) : null;
          const bDate = b.borrowed_at ? new Date(b.borrowed_at) : null;
          const rDate = b.returned_at ? new Date(b.returned_at) : null;

          if (cDate && isSameDay(cDate, now) && cDate.getHours() >= slot.startHour && cDate.getHours() < slot.endHour) reqs++;
          if (aDate && isSameDay(aDate, now) && aDate.getHours() >= slot.startHour && aDate.getHours() < slot.endHour) appr++;
          if (bDate && isSameDay(bDate, now) && bDate.getHours() >= slot.startHour && bDate.getHours() < slot.endHour) borr++;
          if (rDate && isSameDay(rDate, now) && rDate.getHours() >= slot.startHour && rDate.getHours() < slot.endHour) rets++;

          if (!aDate && b.status === 'approved' && cDate && isSameDay(cDate, now) && cDate.getHours() >= slot.startHour && cDate.getHours() < slot.endHour) appr++;
          if (!bDate && (b.status === 'borrowed' || b.status === 'picked_up') && cDate && isSameDay(cDate, now) && cDate.getHours() >= slot.startHour && cDate.getHours() < slot.endHour) borr++;
          if (!rDate && b.status === 'returned' && cDate && isSameDay(cDate, now) && cDate.getHours() >= slot.startHour && cDate.getHours() < slot.endHour) rets++;
        });

        return { label: slot.label, requests: reqs, approved: appr, borrowed: borr, returns: rets };
      });
    }

    if (tf.includes('week')) {
      const currentDay = now.getDay();
      const distanceToMon = (currentDay + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - distanceToMon);
      monday.setHours(0, 0, 0, 0);

      const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return weekDays.map((dayName, idx) => {
        const dayDate = new Date(monday);
        dayDate.setDate(monday.getDate() + idx);

        let reqs = 0, appr = 0, borr = 0, rets = 0;

        (borrowings || []).forEach((b) => {
          const cDate = b.created_at || b.requested_at ? new Date(b.created_at || b.requested_at) : null;
          const aDate = b.approved_at ? new Date(b.approved_at) : null;
          const bDate = b.borrowed_at ? new Date(b.borrowed_at) : null;
          const rDate = b.returned_at ? new Date(b.returned_at) : null;

          if (cDate && isSameDay(cDate, dayDate)) reqs++;
          if (aDate && isSameDay(aDate, dayDate)) appr++;
          if (bDate && isSameDay(bDate, dayDate)) borr++;
          if (rDate && isSameDay(rDate, dayDate)) rets++;

          if (!aDate && b.status === 'approved' && cDate && isSameDay(cDate, dayDate)) appr++;
          if (!bDate && (b.status === 'borrowed' || b.status === 'picked_up') && cDate && isSameDay(cDate, dayDate)) borr++;
          if (!rDate && b.status === 'returned' && cDate && isSameDay(cDate, dayDate)) rets++;
        });

        return { label: dayName, requests: reqs, approved: appr, borrowed: borr, returns: rets };
      });
    }

    if (tf.includes('month')) {
      const year = now.getFullYear();
      const month = now.getMonth();

      const monthWeeks = [
        { label: 'Week 1', startDay: 1, endDay: 7 },
        { label: 'Week 2', startDay: 8, endDay: 14 },
        { label: 'Week 3', startDay: 15, endDay: 21 },
        { label: 'Week 4', startDay: 22, endDay: 28 },
        { label: 'Week 5', startDay: 29, endDay: 31 },
      ];

      return monthWeeks.map((week) => {
        let reqs = 0, appr = 0, borr = 0, rets = 0;

        (borrowings || []).forEach((b) => {
          const inRange = (dt) => dt && dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() >= week.startDay && dt.getDate() <= week.endDay;

          const cDate = b.created_at || b.requested_at ? new Date(b.created_at || b.requested_at) : null;
          const aDate = b.approved_at ? new Date(b.approved_at) : null;
          const bDate = b.borrowed_at ? new Date(b.borrowed_at) : null;
          const rDate = b.returned_at ? new Date(b.returned_at) : null;

          if (inRange(cDate)) reqs++;
          if (inRange(aDate)) appr++;
          if (inRange(bDate)) borr++;
          if (inRange(rDate)) rets++;

          if (!aDate && b.status === 'approved' && inRange(cDate)) appr++;
          if (!bDate && (b.status === 'borrowed' || b.status === 'picked_up') && inRange(cDate)) borr++;
          if (!rDate && b.status === 'returned' && inRange(cDate)) rets++;
        });

        return { label: week.label, requests: reqs, approved: appr, borrowed: borr, returns: rets };
      });
    }

    if (tf.includes('year')) {
      const year = now.getFullYear();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      return monthNames.map((mName, mIdx) => {
        let reqs = 0, appr = 0, borr = 0, rets = 0;

        (borrowings || []).forEach((b) => {
          const inMonth = (dt) => dt && dt.getFullYear() === year && dt.getMonth() === mIdx;

          const cDate = b.created_at || b.requested_at ? new Date(b.created_at || b.requested_at) : null;
          const aDate = b.approved_at ? new Date(b.approved_at) : null;
          const bDate = b.borrowed_at ? new Date(b.borrowed_at) : null;
          const rDate = b.returned_at ? new Date(b.returned_at) : null;

          if (inMonth(cDate)) reqs++;
          if (inMonth(aDate)) appr++;
          if (inMonth(bDate)) borr++;
          if (inMonth(rDate)) rets++;

          if (!aDate && b.status === 'approved' && inMonth(cDate)) appr++;
          if (!bDate && (b.status === 'borrowed' || b.status === 'picked_up') && inMonth(cDate)) borr++;
          if (!rDate && b.status === 'returned' && inMonth(cDate)) rets++;
        });

        const cicMonth = (circulationData || []).find((c) => c.month === mName);
        if (cicMonth && reqs === 0 && appr === 0 && borr === 0 && rets === 0) {
          reqs = Number(cicMonth.Requests || 0);
          appr = Number(cicMonth.Approved || 0);
          borr = Number(cicMonth.Borrowed || cicMonth.borrowed || 0);
          rets = Number(cicMonth.Returns || 0);
        }

        return { label: mName, requests: reqs, approved: appr, borrowed: borr, returns: rets };
      });
    }

    if (!circulationData || !Array.isArray(circulationData) || circulationData.length === 0) {
      return [];
    }

    return circulationData.map((d) => ({
      label: d.month || d.date || 'M',
      requests: Number(d.Requests ?? d.requests ?? 0),
      approved: Number(d.Approved ?? d.approved ?? 0),
      borrowed: Number(d.Borrowed ?? d.borrowed ?? 0),
      returns: Number(d.Returns ?? d.returns ?? 0),
    }));
  }, [circulationData, borrowings, timeFilter]);

  const maxVal = useMemo(() => {
    if (chartPoints.length === 0) return 12;
    const vals = chartPoints.flatMap((p) => [p.requests, p.approved, p.borrowed, p.returns]);
    const max = Math.max(...vals, 4);
    return Math.ceil(max / 4) * 4 || 12;
  }, [chartPoints]);

  const yAxisTicks = useMemo(() => {
    const step = maxVal / 3;
    return [maxVal, Math.round(step * 2), Math.round(step), 0];
  }, [maxVal]);

  const svgWidth = 600;
  const svgHeight = 150;
  const paddingLeft = 32;
  const paddingRight = 24;
  const paddingTop = 12;
  const paddingBottom = 26;

  const chartAreaWidth = svgWidth - paddingLeft - paddingRight;
  const chartAreaHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (i) => {
    if (chartPoints.length <= 1) return paddingLeft + chartAreaWidth / 2;
    return paddingLeft + (i / (chartPoints.length - 1)) * chartAreaWidth;
  };
  const getY = (val) => paddingTop + chartAreaHeight - (val / maxVal) * chartAreaHeight;

  const seriesData = useMemo(() => {
    if (chartPoints.length === 0) {
      return { requestsPts: '', approvedPts: '', borrowedPts: '', returnsPts: '' };
    }

    const requestsPts = chartPoints.map((p, i) => `${getX(i)},${getY(p.requests)}`).join(' ');
    const approvedPts = chartPoints.map((p, i) => `${getX(i)},${getY(p.approved)}`).join(' ');
    const borrowedPts = chartPoints.map((p, i) => `${getX(i)},${getY(p.borrowed)}`).join(' ');
    const returnsPts = chartPoints.map((p, i) => `${getX(i)},${getY(p.returns)}`).join(' ');

    return { requestsPts, approvedPts, borrowedPts, returnsPts };
  }, [chartPoints, maxVal]);

  // Calculate totals for legend badges
  const totals = useMemo(() => {
    return chartPoints.reduce(
      (acc, p) => {
        acc.requests += Number(p.requests || 0);
        acc.approved += Number(p.approved || 0);
        acc.borrowed += Number(p.borrowed || 0);
        acc.returns += Number(p.returns || 0);
        return acc;
      },
      { requests: 0, approved: 0, borrowed: 0, returns: 0 }
    );
  }, [chartPoints]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 lg:p-5 flex flex-col justify-between shadow-2xs h-[260px] min-h-[260px]">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-2.5 shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
              CIRCULATION ACTIVITY
            </h3>
            {timeFilter === 'today' && (
              <span className="text-[9px] font-extrabold px-2 py-0.5 bg-amber-50 text-amber-900 rounded-full border border-amber-200 uppercase">
                Today (Hourly)
              </span>
            )}
          </div>
          <p className="text-[10.5px] font-medium text-slate-400">
            {timeFilter === 'today'
              ? "Today's hourly circulation progression."
              : 'Requests, approvals, borrowings and returns over time.'}
          </p>
        </div>

        {/* Legend Items with Dynamic Totals */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] font-bold shrink-0 pt-0.5 flex-nowrap overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 bg-amber-50/90 border border-amber-200/80 px-1.5 py-0.5 rounded-md whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="text-slate-800 font-extrabold text-[10px]">
              Requests <strong className="text-amber-600 font-black">({totals.requests})</strong>
            </span>
          </div>
          <div className="flex items-center gap-1 bg-blue-50/90 border border-blue-200/80 px-1.5 py-0.5 rounded-md whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
            <span className="text-slate-800 font-extrabold text-[10px]">
              Approved <strong className="text-blue-600 font-black">({totals.approved})</strong>
            </span>
          </div>
          <div className="flex items-center gap-1 bg-purple-50/90 border border-purple-200/80 px-1.5 py-0.5 rounded-md whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
            <span className="text-slate-800 font-extrabold text-[10px]">
              Borrowed <strong className="text-purple-600 font-black">({totals.borrowed})</strong>
            </span>
          </div>
          <div className="flex items-center gap-1 bg-emerald-50/90 border border-emerald-200/80 px-1.5 py-0.5 rounded-md whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
            <span className="text-slate-800 font-extrabold text-[10px]">
              Returns <strong className="text-emerald-600 font-black">({totals.returns})</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Multi-Series Line Chart Container */}
      {chartPoints.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-xs text-slate-400 font-medium italic bg-slate-50 rounded-xl border border-dashed border-slate-200 my-1">
          No circulation activity recorded for this period.
        </div>
      ) : (
        <div className="flex-1 min-h-0 relative flex items-center justify-center pt-1">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Horizontal Grid lines */}
            {yAxisTicks.map((tickVal, idx) => {
              const y = getY(tickVal);
              return (
                <g key={idx}>
                  <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  <text x={paddingLeft - 6} y={y + 3} textAnchor="end" fontSize="9" fontWeight="600" fill="#94a3b8">
                    {tickVal}
                  </text>
                </g>
              );
            })}

            {/* 1. Requests Line (Orange #f59e0b) */}
            <polyline fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points={seriesData.requestsPts} />
            {/* 2. Approved Line (Blue #2563eb) */}
            <polyline fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points={seriesData.approvedPts} />
            {/* 3. Borrowed Line (Purple #9333ea) */}
            <polyline fill="none" stroke="#9333ea" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points={seriesData.borrowedPts} />
            {/* 4. Returns Line (Green #10b981) */}
            <polyline fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" points={seriesData.returnsPts} />

            {/* Data Points & Hover Handlers */}
            {chartPoints.map((p, i) => {
              const cx = getX(i);
              return (
                <g key={i} className="group cursor-pointer" onMouseEnter={() => setHoveredPoint({ ...p, idx: i, cx })} onMouseLeave={() => setHoveredPoint(null)}>
                  <circle cx={cx} cy={getY(p.requests)} r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx={cx} cy={getY(p.approved)} r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx={cx} cy={getY(p.borrowed)} r="3.5" fill="#9333ea" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx={cx} cy={getY(p.returns)} r="3.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                  <text x={cx} y={svgHeight - 3} textAnchor="middle" fontSize="9" fontWeight="700" fill="#64748b">
                    {p.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {hoveredPoint && (
            <div style={{ left: `${(hoveredPoint.cx / svgWidth) * 100}%`, transform: 'translateX(-50%)' }} className="absolute top-1 z-20 bg-slate-900 text-white text-[10px] p-2.5 rounded-xl shadow-lg border border-slate-700 pointer-events-none space-y-0.5 whitespace-nowrap">
              <div className="font-extrabold text-amber-400 border-b border-slate-700 pb-0.5">{hoveredPoint.label}</div>
              <div className="flex justify-between gap-3 text-slate-300"><span>Requests:</span> <strong className="text-amber-400">{Math.round(hoveredPoint.requests)}</strong></div>
              <div className="flex justify-between gap-3 text-slate-300"><span>Approved:</span> <strong className="text-blue-400">{Math.round(hoveredPoint.approved)}</strong></div>
              <div className="flex justify-between gap-3 text-slate-300"><span>Borrowed:</span> <strong className="text-purple-400">{Math.round(hoveredPoint.borrowed)}</strong></div>
              <div className="flex justify-between gap-3 text-slate-300"><span>Returns:</span> <strong className="text-emerald-400">{Math.round(hoveredPoint.returns)}</strong></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
