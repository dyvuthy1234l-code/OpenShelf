import { useState, useMemo } from 'react';

export default function BorrowingActivityChart({ circulationData = [], borrowings = [], library = null, preset = 'all' }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Map global header preset to chart time filter
  const timeFilter = useMemo(() => {
    switch (preset) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      case 'all':
      default:
        return 'All Time';
    }
  }, [preset]);

  // Check if real circulation data is provided from Laravel backend API
  const hasRealData = useMemo(() => {
    return (Array.isArray(circulationData) && circulationData.length > 0) || (Array.isArray(borrowings) && borrowings.length > 0);
  }, [circulationData, borrowings]);

  // Multi-series line chart data mapping (Requests, Approved, Borrowed, Returns) based on selected timeFilter
  const chartPoints = useMemo(() => {
    const now = new Date();

    const isSameDay = (d1, d2) => d1 && d2 && d1.toDateString() === d2.toDateString();

    // 1. TODAY FILTER (Dynamic Hourly Checkpoints based on Library Opening & Closing Hours)
    if (timeFilter === 'Today') {
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

      const slots = hourCheckpoints.map((h, idx) => {
        const nextH = idx < hourCheckpoints.length - 1 ? hourCheckpoints[idx + 1] : 24;
        return {
          label: formatLabel(h),
          start: h,
          end: nextH,
        };
      });

      return slots.map((slot) => {
        let reqs = 0, appr = 0, borr = 0, rets = 0;

        (borrowings || []).forEach((b) => {
          const cDate = b.created_at || b.requested_at ? new Date(b.created_at || b.requested_at) : null;
          const aDate = b.approved_at ? new Date(b.approved_at) : null;
          const bDate = b.borrowed_at ? new Date(b.borrowed_at) : null;
          const rDate = b.returned_at ? new Date(b.returned_at) : null;

          if (cDate && isSameDay(cDate, now) && cDate.getHours() >= slot.start && cDate.getHours() < slot.end) reqs++;
          if (aDate && isSameDay(aDate, now) && aDate.getHours() >= slot.start && aDate.getHours() < slot.end) appr++;
          if (bDate && isSameDay(bDate, now) && bDate.getHours() >= slot.start && bDate.getHours() < slot.end) borr++;
          if (rDate && isSameDay(rDate, now) && rDate.getHours() >= slot.start && rDate.getHours() < slot.end) rets++;

          if (!aDate && b.status === 'approved' && cDate && isSameDay(cDate, now) && cDate.getHours() >= slot.start && cDate.getHours() < slot.end) appr++;
          if (!bDate && (b.status === 'borrowed' || b.status === 'picked_up') && cDate && isSameDay(cDate, now) && cDate.getHours() >= slot.start && cDate.getHours() < slot.end) borr++;
          if (!rDate && b.status === 'returned' && cDate && isSameDay(cDate, now) && cDate.getHours() >= slot.start && cDate.getHours() < slot.end) rets++;
        });

        return { label: slot.label, requests: reqs, approved: appr, borrowed: borr, returns: rets };
      });
    }

    // 2. THIS WEEK FILTER (Days of current week: Mon-Sun)
    if (timeFilter === 'This Week') {
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

    // 3. THIS MONTH FILTER (Weeks of current month: Week 1 to Week 5)
    if (timeFilter === 'This Month') {
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

    // 4. THIS YEAR FILTER (12 Months: Jan - Dec)
    if (timeFilter === 'This Year') {
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

        // Fallback to circulationData if present for that month
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

    // 5. ALL TIME FILTER (Full monthly historical progression)
    if (Array.isArray(circulationData) && circulationData.length > 0) {
      return circulationData.map((d) => ({
        label: d.month || d.date || 'M',
        requests: Number(d.Requests ?? d.requests ?? 0),
        approved: Number(d.Approved ?? d.approved ?? 0),
        borrowed: Number(d.Borrowed ?? d.borrowed ?? 0),
        returns: Number(d.Returns ?? d.returns ?? 0),
      }));
    }

    return [];
  }, [circulationData, borrowings, timeFilter]);

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

  // Dynamic Max value scale calculation
  const maxVal = useMemo(() => {
    const vals = chartPoints.flatMap((p) => [p.requests, p.approved, p.borrowed, p.returns]);
    const max = Math.max(...vals, 8);
    return Math.ceil(max / 4) * 4 || 12;
  }, [chartPoints]);

  const yAxisTicks = useMemo(() => {
    const step = maxVal / 3;
    return [maxVal, Math.round(step * 2), Math.round(step), 0];
  }, [maxVal]);

  // Dimensions & SVG Math calculations
  const svgWidth = 500;
  const svgHeight = 110;
  const paddingLeft = 32;
  const paddingRight = 20;
  const paddingTop = 8;
  const paddingBottom = 18;

  const chartAreaWidth = svgWidth - paddingLeft - paddingRight;
  const chartAreaHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (index) => {
    if (chartPoints.length <= 1) return paddingLeft + chartAreaWidth / 2;
    return paddingLeft + (index / (chartPoints.length - 1)) * chartAreaWidth;
  };

  const getY = (val) => {
    const ratio = val / maxVal;
    return paddingTop + chartAreaHeight - ratio * chartAreaHeight;
  };

  // Generate SVG polyline path strings
  const seriesData = useMemo(() => {
    const requestsPts = chartPoints.map((p, i) => `${getX(i)},${getY(p.requests)}`).join(' ');
    const approvedPts = chartPoints.map((p, i) => `${getX(i)},${getY(p.approved)}`).join(' ');
    const borrowedPts = chartPoints.map((p, i) => `${getX(i)},${getY(p.borrowed)}`).join(' ');
    const returnsPts = chartPoints.map((p, i) => `${getX(i)},${getY(p.returns)}`).join(' ');

    return { requestsPts, approvedPts, borrowedPts, returnsPts };
  }, [chartPoints, maxVal]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 lg:p-3 flex flex-col justify-between shadow-2xs space-y-1 h-full min-h-0">
      {/* Chart Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-2 shrink-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight uppercase flex items-center gap-1.5">
              <svg className="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Borrowing Activity
            </h3>
            {hasRealData && (
              <span className="text-[8.5px] font-extrabold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/80 uppercase tracking-wider">
                Live Data
              </span>
            )}
          </div>
          <p className="text-[10px] font-medium text-slate-500">
            {timeFilter === 'Today' ? "Today's hourly circulation progression." : "Monthly borrowing and return activity."}
          </p>

          {/* Legend Items with Dynamic Totals */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] font-extrabold pt-1 flex-nowrap overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1 bg-amber-50/90 border border-amber-200/80 px-1.5 py-0.5 rounded-md whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-2xs shrink-0" />
              <span className="text-slate-800 font-extrabold text-[10px]">
                Requests <strong className="text-amber-600 font-black">({totals.requests})</strong>
              </span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50/90 border border-blue-200/80 px-1.5 py-0.5 rounded-md whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-2xs shrink-0" />
              <span className="text-slate-800 font-extrabold text-[10px]">
                Approved <strong className="text-blue-600 font-black">({totals.approved})</strong>
              </span>
            </div>
            <div className="flex items-center gap-1 bg-purple-50/90 border border-purple-200/80 px-1.5 py-0.5 rounded-md whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 shadow-2xs shrink-0" />
              <span className="text-slate-800 font-extrabold text-[10px]">
                Borrowed <strong className="text-purple-600 font-black">({totals.borrowed})</strong>
              </span>
            </div>
            <div className="flex items-center gap-1 bg-emerald-50/90 border border-emerald-200/80 px-1.5 py-0.5 rounded-md whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-2xs shrink-0" />
              <span className="text-slate-800 font-extrabold text-[10px]">
                Returns <strong className="text-emerald-600 font-black">({totals.returns})</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Series Line Chart Container */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center pt-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Horizontal Grid lines & Y-Axis Labels */}
          {yAxisTicks.map((tickVal, idx) => {
            const y = getY(tickVal);
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fontWeight="600"
                  fill="#94a3b8"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* 1. Requests Line (Orange #f59e0b) */}
          <polyline
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={seriesData.requestsPts}
          />

          {/* 2. Approved Line (Blue #2563eb) */}
          <polyline
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={seriesData.approvedPts}
          />

          {/* 3. Borrowed Line (Purple #9333ea) */}
          <polyline
            fill="none"
            stroke="#9333ea"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={seriesData.borrowedPts}
          />

          {/* 4. Returns Line (Green #10b981) */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={seriesData.returnsPts}
          />

          {/* Data Point Circles with Interactive Tooltips */}
          {chartPoints.map((p, i) => {
            const cx = getX(i);
            const cyReq = getY(p.requests);
            const cyApp = getY(p.approved);
            const cyBor = getY(p.borrowed);
            const cyRet = getY(p.returns);

            return (
              <g
                key={i}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredPoint({ ...p, idx: i, cx })}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Vertical Hover Line */}
                <line
                  x1={cx}
                  y1={paddingTop}
                  x2={cx}
                  y2={svgHeight - paddingBottom}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />

                {/* Requests Point Circle */}
                <circle
                  cx={cx}
                  cy={cyReq}
                  r={hoveredPoint?.idx === i ? "5" : "4"}
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all"
                />

                {/* Approved Point Circle */}
                <circle
                  cx={cx}
                  cy={cyApp}
                  r={hoveredPoint?.idx === i ? "5" : "4"}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all"
                />

                {/* Borrowed Point Circle */}
                <circle
                  cx={cx}
                  cy={cyBor}
                  r={hoveredPoint?.idx === i ? "5" : "4"}
                  fill="#9333ea"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all"
                />

                {/* Returns Point Circle */}
                <circle
                  cx={cx}
                  cy={cyRet}
                  r={hoveredPoint?.idx === i ? "5" : "4"}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all"
                />

                {/* X-Axis Labels */}
                <text
                  x={cx}
                  y={svgHeight - 4}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="700"
                  fill="#64748b"
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            style={{
              left: `${(hoveredPoint.cx / svgWidth) * 100}%`,
              transform: 'translateX(-50%)',
            }}
            className="absolute top-1 z-20 bg-slate-900 text-white text-[10px] p-2 rounded-xl shadow-lg border border-slate-700 pointer-events-none space-y-0.5 whitespace-nowrap"
          >
            <div className="font-extrabold border-b border-slate-700 pb-0.5 text-amber-400">
              {hoveredPoint.label}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Requests: <strong>{Math.round(hoveredPoint.requests)}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Approved: <strong>{Math.round(hoveredPoint.approved)}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Borrowed: <strong>{Math.round(hoveredPoint.borrowed)}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Returns: <strong>{Math.round(hoveredPoint.returns)}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
