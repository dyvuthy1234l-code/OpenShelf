import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LIST_STAGGER, LIST_ITEM, REVEAL_VARIANTS } from '../../constants/motionTokens';
import { 
  Building2, ShieldCheck, Users, ArrowLeftRight, DollarSign, 
  RefreshCw, AlertCircle, CheckCircle2, ArrowRight, Activity, 
  AlertTriangle, ChevronRight, TrendingUp, Sparkles, BookOpen, Layers, Clock
} from 'lucide-react';
import { useAdminDashboard } from '../../hooks/queries/useAdminQueries';

export default function AdminDashboard() {
  // Global Filter State
  const [headerRange, setHeaderRange] = useState('all');
  const [activeSeries, setActiveSeries] = useState('all'); // 'all' | 'Libraries' | 'Members' | 'Borrowings'
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const chartRangeParam = headerRange;
  const { data: rawRes, isLoading: loading, isFetching, error: queryError, refetch } = useAdminDashboard({
    range: headerRange,
    chart_range: chartRangeParam,
  });

  const data = rawRes?.data || rawRes || null;
  const error = queryError ? 'Unable to load admin dashboard statistics.' : null;

  const fetchDashboardData = () => refetch();

  // Derived Trend Data directly from backend activity_trend
  const trendData = data?.activity_trend || [];

  const maxVal = useMemo(() => {
    if (!trendData.length) return 10;
    const values = trendData.flatMap((d) => [d.Libraries || 0, d.Members || 0, d.Borrowings || 0]);
    return Math.max(...values, 5);
  }, [trendData]);

  const totalLibraries = data?.total_libraries ?? 0;
  const activeLibrarians = data?.active_librarians ?? 0;
  const totalMembers = data?.total_members ?? 0;
  const activeBorrowings = data?.active_borrowings ?? 0;
  const platformRevenue = Number(data?.platform_revenue ?? 0);
  const subscriptionRevenue = Number(data?.subscription_revenue ?? 0);
  const fineRevenue = Number(data?.fine_revenue ?? 0);

  const libActive = data?.library_status?.active ?? 0;
  const libPending = data?.library_status?.pending ?? 0;
  const libInactive = data?.library_status?.inactive ?? 0;
  const libTotal = Math.max(totalLibraries, 1);

  const activePct = Math.round((libActive / libTotal) * 100);
  const pendingPct = Math.round((libPending / libTotal) * 100);
  const inactivePct = Math.round((libInactive / libTotal) * 100);

  const pendingActions = data?.pending_actions || [];
  const recentLibraries = (data?.recent_libraries || []).slice(0, 4);

  // SVG Chart Dimensions & Helpers
  const svgWidth = 640;
  const svgHeight = 160;
  const paddingX = 35;
  const paddingY = 20;
  const graphW = svgWidth - paddingX * 2;
  const graphH = svgHeight - paddingY * 2;

  const getPoints = (key) => {
    if (!trendData.length) return [];
    return trendData.map((d, i) => {
      const x = paddingX + (i / Math.max(trendData.length - 1, 1)) * graphW;
      const val = d[key] || 0;
      const y = paddingY + graphH - (val / Math.max(maxVal, 1)) * graphH;
      return { x, y, val, month: d.month };
    });
  };

  const libPoints = useMemo(() => getPoints('Libraries'), [trendData, maxVal]);
  const mebPoints = useMemo(() => getPoints('Members'), [trendData, maxVal]);
  const borPoints = useMemo(() => getPoints('Borrowings'), [trendData, maxVal]);

  const createSmoothPath = (pts) => {
    if (!pts.length) return '';
    if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
    let path = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const mx = (p0.x + p1.x) / 2;
      path += ` C ${mx},${p0.y} ${mx},${p1.y} ${p1.x},${p1.y}`;
    }
    return path;
  };

  const createAreaPath = (pts) => {
    if (!pts.length) return '';
    const curve = createSmoothPath(pts);
    const last = pts[pts.length - 1];
    const first = pts[0];
    return `${curve} L ${last.x},${svgHeight - paddingY} L ${first.x},${svgHeight - paddingY} Z`;
  };

  const chartSubtitle = useMemo(() => {
    if (headerRange === 'today') return "Today's hourly platform registration and borrowing timeline.";
    if (headerRange === 'month') return "Weekly platform activity breakdown for this month.";
    if (headerRange === 'year') return "Monthly platform growth throughout this calendar year.";
    return "Multi-metric platform network growth and borrowing momentum over time.";
  }, [headerRange]);

  return (
    <div className="flex-1 flex flex-col justify-between min-h-0 space-y-2.5 h-full w-full font-sans">
      {/* 1. TOP HEADER & GLOBAL DASHBOARD PERIOD SELECTOR */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 w-full">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase font-black tracking-widest text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
              System Administration
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight mt-0.5 flex items-center gap-2">
            Admin Overview & Analytics
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">
            Platform health, network growth metrics, and real-time operations.
          </p>
        </div>

        {/* Global Controls & Period Filter */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Quick Actions Bar */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
            <Link
              to="/admin/libraries"
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-white transition-all inline-flex items-center gap-1 shadow-2xs"
            >
              <Building2 className="w-3 h-3 text-amber-600" />
              <span>Libraries</span>
            </Link>
            <Link
              to="/admin/librarians"
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-white transition-all inline-flex items-center gap-1 shadow-2xs"
            >
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>Librarians</span>
            </Link>
            <Link
              to="/admin/subscriptions"
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 hover:bg-white transition-all inline-flex items-center gap-1 shadow-2xs"
            >
              <DollarSign className="w-3 h-3 text-emerald-600" />
              <span>Revenue</span>
            </Link>
          </div>

          {/* Time Period Filter Pills with Smooth Sliding Highlight */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shrink-0 relative">
            {[
              { key: 'all', label: 'All Time' },
              { key: 'today', label: 'Today' },
              { key: 'month', label: 'This Month' },
              { key: 'year', label: 'This Year' },
            ].map((item) => {
              const isSelected = headerRange === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setHeaderRange(item.key)}
                  className={`relative px-3 py-1 rounded-lg text-[11.5px] font-black transition-colors duration-150 cursor-pointer z-10 select-none ${
                    isSelected ? 'text-slate-950 font-black' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="adminPeriodPill"
                      className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-400 rounded-lg shadow-xs -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="flex items-center gap-1">
                    {item.label}
                    {isSelected && isFetching && (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        className="inline-block w-2.5 h-2.5 border-2 border-slate-950 border-t-transparent rounded-full ml-0.5"
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 shadow-2xs shrink-0 w-full">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchDashboardData(false)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex-1 min-h-0 space-y-2.5 animate-pulse w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[105px] bg-white rounded-2xl border border-slate-200" />
            ))}
          </div>
          <div className="flex-1 h-64 lg:h-[240px] bg-white rounded-2xl border border-slate-200" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between min-h-0 space-y-2.5 w-full">
          {/* 2. 5 MODERN SUMMARY KPI CARDS WITH NUMBER ROLL ANIMATION */}
          <motion.div
            variants={LIST_STAGGER}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 shrink-0 w-full"
          >
            {/* Card 1: Total Libraries */}
            <motion.div variants={LIST_ITEM} className="bg-gradient-to-b from-white to-amber-50/20 border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all duration-200 flex flex-col justify-between h-[105px] group relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-500">Total Libraries</span>
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center font-extrabold shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                  <Building2 className="w-4 h-4 text-slate-950" />
                </div>
              </div>
              <div>
                <div className="overflow-hidden h-7 flex items-center">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={`${headerRange}-${totalLibraries}`}
                      initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="text-2xl font-black text-slate-900 tracking-tight block leading-none"
                    >
                      {totalLibraries}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className="inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 mt-1">
                  Registered branches
                </span>
              </div>
            </motion.div>

            {/* Card 2: Active Librarians */}
            <motion.div variants={LIST_ITEM} className="bg-gradient-to-b from-white to-blue-50/20 border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between h-[105px] group relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-500">Active Librarians</span>
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-extrabold shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <div className="overflow-hidden h-7 flex items-center">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={`${headerRange}-${activeLibrarians}`}
                      initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="text-2xl font-black text-slate-900 tracking-tight block leading-none"
                    >
                      {activeLibrarians}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className="inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200/80 mt-1">
                  Verified staff
                </span>
              </div>
            </motion.div>

            {/* Card 3: Total Members */}
            <motion.div variants={LIST_ITEM} className="bg-gradient-to-b from-white to-indigo-50/20 border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between h-[105px] group relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-500">Total Members</span>
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-extrabold shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <div className="overflow-hidden h-7 flex items-center">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={`${headerRange}-${totalMembers}`}
                      initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="text-2xl font-black text-slate-900 tracking-tight block leading-none"
                    >
                      {totalMembers}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className="inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200/80 mt-1">
                  Registered readers
                </span>
              </div>
            </motion.div>

            {/* Card 4: Active Borrowings */}
            <motion.div variants={LIST_ITEM} className="bg-gradient-to-b from-white to-emerald-50/20 border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between h-[105px] group relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-500">Active Borrowings</span>
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-extrabold shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                  <ArrowLeftRight className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <div className="overflow-hidden h-7 flex items-center">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={`${headerRange}-${activeBorrowings}`}
                      initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="text-2xl font-black text-slate-900 tracking-tight block leading-none"
                    >
                      {activeBorrowings}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className="inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 mt-1">
                  In circulation
                </span>
              </div>
            </motion.div>

            {/* Card 5: Platform Revenue */}
            <motion.div variants={LIST_ITEM} className="bg-gradient-to-b from-white to-emerald-50/30 border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all duration-200 flex flex-col justify-between h-[105px] group relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-500">Platform Revenue</span>
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-extrabold shrink-0 shadow-xs group-hover:scale-110 transition-transform">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <div className="overflow-hidden h-7 flex items-center">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={`${headerRange}-${platformRevenue}`}
                      initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -12, filter: 'blur(3px)' }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="text-2xl font-black text-slate-900 tracking-tight block leading-none"
                    >
                      ${platformRevenue.toFixed(2)}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span className="inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 mt-1">
                  Subscriptions + Fines
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* 3. MAIN ANALYTICS & OPERATIONS AREA (LEFT 65% / RIGHT 35%) (FLEX-1 EXPANDS TO FILL SCREEN) */}
          <motion.div {...REVEAL_VARIANTS} className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch flex-1 min-h-0 w-full pb-1">
            {/* LEFT: MODERN MULTI-LAYER AREA WAVE CHART (65% / lg:col-span-8) */}
            <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs h-full min-h-0 overflow-hidden relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2 shrink-0">
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight uppercase flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    Platform Growth Momentum
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">{chartSubtitle}</p>
                </div>

                {/* Series Interactive Legend Filter */}
                <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 text-[10.5px] font-black">
                  <button
                    onClick={() => setActiveSeries('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      activeSeries === 'all' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    All Metrics
                  </button>
                  <button
                    onClick={() => setActiveSeries('Libraries')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeSeries === 'Libraries' ? 'bg-amber-50 text-amber-900 border border-amber-200/80 shadow-2xs' : 'text-slate-500 hover:text-amber-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Libraries</span>
                  </button>
                  <button
                    onClick={() => setActiveSeries('Members')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeSeries === 'Members' ? 'bg-blue-50 text-blue-900 border border-blue-200/80 shadow-2xs' : 'text-slate-500 hover:text-blue-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Members</span>
                  </button>
                  <button
                    onClick={() => setActiveSeries('Borrowings')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeSeries === 'Borrowings' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 shadow-2xs' : 'text-slate-500 hover:text-emerald-700'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Borrows</span>
                  </button>
                </div>
              </div>

              {/* Modern Area Wave Curve Graph */}
              {trendData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/80 rounded-xl border border-dashed border-slate-200 space-y-1">
                  <Activity className="w-6 h-6 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-500">No platform activity recorded for this period.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-end min-h-0 pt-3 relative overflow-hidden">
                  {/* Tooltip Card on Hover */}
                  {hoveredIdx !== null && trendData[hoveredIdx] && (
                    <div className="absolute top-2 right-4 z-20 bg-slate-950/95 backdrop-blur-md text-white px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-xl text-xs flex items-center gap-3 animate-in fade-in zoom-in-95">
                      <span className="font-black text-amber-400 border-r border-slate-700 pr-2.5">{trendData[hoveredIdx].month}</span>
                      <div className="flex items-center gap-3 font-bold text-[11.5px]">
                        {(activeSeries === 'all' || activeSeries === 'Libraries') && (
                          <span className="text-amber-300">🏛️ {trendData[hoveredIdx].Libraries || 0} Libs</span>
                        )}
                        {(activeSeries === 'all' || activeSeries === 'Members') && (
                          <span className="text-blue-300">👥 {trendData[hoveredIdx].Members || 0} Members</span>
                        )}
                        {(activeSeries === 'all' || activeSeries === 'Borrowings') && (
                          <span className="text-emerald-300">📖 {trendData[hoveredIdx].Borrowings || 0} Borrows</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Animated SVG Area Chart */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${headerRange}-${activeSeries}`}
                      initial={{ opacity: 0, scale: 0.985 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.985 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="w-full h-full flex flex-col justify-end"
                    >
                      <svg
                        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                        className="w-full h-full min-h-[160px] overflow-visible"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          {/* Gradient: Libraries (Amber) */}
                          <linearGradient id="amberAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                          </linearGradient>

                          {/* Gradient: Members (Blue) */}
                          <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                          </linearGradient>

                          {/* Gradient: Borrowings (Emerald) */}
                          <linearGradient id="emeraldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Subtle Horizontal Grid lines */}
                        {[0.25, 0.5, 0.75, 1].map((p, i) => {
                          const y = paddingY + graphH * (1 - p);
                          return (
                            <line
                              key={i}
                              x1={paddingX}
                              y1={y}
                              x2={svgWidth - paddingX}
                              y2={y}
                              stroke="#E2E8F0"
                              strokeDasharray="4 4"
                              strokeWidth="1"
                            />
                          );
                        })}

                        {/* Area 1: Libraries */}
                        {(activeSeries === 'all' || activeSeries === 'Libraries') && (
                          <>
                            <path d={createAreaPath(libPoints)} fill="url(#amberAreaGrad)" />
                            <path d={createSmoothPath(libPoints)} fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                          </>
                        )}

                        {/* Area 2: Members */}
                        {(activeSeries === 'all' || activeSeries === 'Members') && (
                          <>
                            <path d={createAreaPath(mebPoints)} fill="url(#blueAreaGrad)" />
                            <path d={createSmoothPath(mebPoints)} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
                          </>
                        )}

                        {/* Area 3: Borrowings */}
                        {(activeSeries === 'all' || activeSeries === 'Borrowings') && (
                          <>
                            <path d={createAreaPath(borPoints)} fill="url(#emeraldAreaGrad)" />
                            <path d={createSmoothPath(borPoints)} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                          </>
                        )}

                        {/* Interactive Vertical Guide & Points */}
                        {trendData.map((d, i) => {
                          const x = paddingX + (i / Math.max(trendData.length - 1, 1)) * graphW;
                          const isHovered = hoveredIdx === i;

                          return (
                            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
                              {/* Invisible hover zone */}
                              <rect
                                x={x - 20}
                                y={paddingY}
                                width="40"
                                height={graphH}
                                fill="transparent"
                              />

                              {/* Hover Vertical Guide */}
                              {isHovered && (
                                <line
                                  x1={x}
                                  y1={paddingY}
                                  x2={x}
                                  y2={svgHeight - paddingY}
                                  stroke="#64748B"
                                  strokeWidth="1.5"
                                  strokeDasharray="2 2"
                                />
                              )}

                              {/* Glowing Dots */}
                              {(activeSeries === 'all' || activeSeries === 'Libraries') && libPoints[i] && (
                                <circle
                                  cx={x}
                                  cy={libPoints[i].y}
                                  r={isHovered ? 5 : 3}
                                  fill="#F59E0B"
                                  stroke="#FFF"
                                  strokeWidth="2"
                                  className="transition-all duration-150"
                                />
                              )}

                              {(activeSeries === 'all' || activeSeries === 'Members') && mebPoints[i] && (
                                <circle
                                  cx={x}
                                  cy={mebPoints[i].y}
                                  r={isHovered ? 5 : 3}
                                  fill="#3B82F6"
                                  stroke="#FFF"
                                  strokeWidth="2"
                                  className="transition-all duration-150"
                                />
                              )}

                              {(activeSeries === 'all' || activeSeries === 'Borrowings') && borPoints[i] && (
                                <circle
                                  cx={x}
                                  cy={borPoints[i].y}
                                  r={isHovered ? 5 : 3}
                                  fill="#10B981"
                                  stroke="#FFF"
                                  strokeWidth="2"
                                  className="transition-all duration-150"
                                />
                              )}

                              {/* X-Axis Month Label */}
                              <text
                                x={x}
                                y={svgHeight - 4}
                                textAnchor="middle"
                                className={`text-[9.5px] font-black uppercase tracking-wider ${isHovered ? 'fill-slate-900 font-extrabold' : 'fill-slate-400'}`}
                              >
                                {d.month}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* RIGHT SIDE (35% / lg:col-span-4): NETWORK STATUS & REVENUE SUMMARY STACKED */}
            <div className="lg:col-span-4 flex flex-col gap-3 min-h-0 h-full justify-between">
              {/* TOP: NETWORK STATUS */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2 shadow-2xs flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 shrink-0">
                  <span className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    Network Branches
                  </span>
                  <Link to="/admin/libraries" className="text-[10px] font-black text-amber-700 hover:underline">
                    {totalLibraries} Total →
                  </Link>
                </div>

                <div className="space-y-2.5 text-xs flex-1 flex flex-col justify-center">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-extrabold text-[11px]">
                      <span className="flex items-center gap-1.5 text-slate-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        Active Branches
                      </span>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={`${headerRange}-${libActive}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="text-slate-900 font-black"
                        >
                          {libActive} <span className="text-slate-400 text-[10px]">({activePct}%)</span>
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${activePct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-extrabold text-[11px]">
                      <span className="flex items-center gap-1.5 text-slate-800">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        Pending Approval
                      </span>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={`${headerRange}-${libPending}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="text-slate-900 font-black"
                        >
                          {libPending} <span className="text-slate-400 text-[10px]">({pendingPct}%)</span>
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pendingPct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-extrabold text-[11px]">
                      <span className="flex items-center gap-1.5 text-slate-800">
                        <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                        Inactive / Suspended
                      </span>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={`${headerRange}-${libInactive}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="text-slate-900 font-black"
                        >
                          {libInactive} <span className="text-slate-400 text-[10px]">({inactivePct}%)</span>
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-slate-400 to-slate-300 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${inactivePct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM: REVENUE SUMMARY */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-2 shadow-2xs flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 shrink-0">
                  <span className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    Revenue Streams
                  </span>
                  <Link to="/admin/subscriptions" className="text-[10px] font-black text-amber-700 hover:underline">
                    Billing Details →
                  </Link>
                </div>

                <div className="space-y-2 text-xs flex-1 flex flex-col justify-center">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 block">Subscriptions</span>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={`${headerRange}-${subscriptionRevenue}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="font-black text-slate-900 text-sm block"
                        >
                          ${subscriptionRevenue.toFixed(2)}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 block">Late Fines</span>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={`${headerRange}-${fineRevenue}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="font-black text-slate-900 text-sm block"
                        >
                          ${fineRevenue.toFixed(2)}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1.5 rounded-xl text-white font-black shadow-xs">
                    <span className="text-[11px] uppercase tracking-wider font-extrabold">Total Gross Volume</span>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={`${headerRange}-${platformRevenue}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="text-sm font-black block"
                      >
                        ${platformRevenue.toFixed(2)}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
