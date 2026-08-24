import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, ShieldCheck, Users, ArrowLeftRight, DollarSign, 
  RefreshCw, AlertCircle, CheckCircle2, ArrowRight, Activity, 
  AlertTriangle, ChevronRight, TrendingUp, Sparkles 
} from 'lucide-react';
import adminService from '../../services/adminService';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Global Filter State
  const [headerRange, setHeaderRange] = useState('all');

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError(null);
      // Map headerRange to backend chart_range dynamically
      const chartRangeParam = headerRange === 'month' ? 'month' : 'year';
      const res = await adminService.getDashboard({ range: headerRange, chart_range: chartRangeParam });
      setData(res.data || null);
    } catch (err) {
      if (!isSilent) setError('Unable to load admin dashboard statistics.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [headerRange]);

  useEffect(() => {
    fetchDashboardData(false);

    // Background polling every 30s
    const interval = setInterval(() => fetchDashboardData(true), 30000);
    const handleFocus = () => fetchDashboardData(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchDashboardData]);

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
  const recentLibraries = (data?.recent_libraries || []).slice(0, 3);

  // Handle header range change with intelligent chart range auto-sync
  const handleHeaderRangeChange = (key) => {
    setHeaderRange(key);
  };

  return (
    <div className="flex-1 flex flex-col justify-between min-h-0 space-y-2.5 h-full w-full font-sans">
      {/* 1. MODERN TOP HEADER & GLOBAL DASHBOARD PERIOD SELECTOR (~68-72px) */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 w-full">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] uppercase font-black tracking-widest text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
              System Administration
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight mt-0.5 flex items-center gap-2">
            Admin Dashboard
          </h1>
          <p className="text-[11px] text-slate-500 font-medium">
            Platform overview, system health, and real-time network statistics.
          </p>
        </div>

        {/* Global Dashboard Time Period Selector */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9.5px] uppercase font-black tracking-widest text-slate-400 hidden md:inline">
              Dashboard Period:
            </span>
            <div className="flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 shrink-0">
              {[
                { key: 'all', label: 'All Time' },
                { key: 'today', label: 'Today' },
                { key: 'month', label: 'This Month' },
                { key: 'year', label: 'This Year' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleHeaderRangeChange(item.key)}
                  className={`px-3 py-1 rounded-lg text-[11.5px] font-extrabold transition-all cursor-pointer ${
                    headerRange === item.key
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-xs scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
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
              <div key={i} className="h-[100px] bg-white rounded-2xl border border-slate-200" />
            ))}
          </div>
          <div className="flex-1 h-64 lg:h-[240px] bg-white rounded-2xl border border-slate-200" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between min-h-0 space-y-2.5 w-full">
          {/* 2. 5 MODERN SUMMARY KPI CARDS IN EQUAL HEIGHT ROW (~100px) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 shrink-0 w-full">
            {/* Card 1: Total Libraries */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:shadow-md hover:border-amber-200 transition-all duration-200 flex flex-col justify-between h-[100px] group">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-500">Total Libraries</span>
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-extrabold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Building2 className="w-4 h-4 text-slate-950" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight block leading-none">{totalLibraries}</span>
                <span className="inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 mt-0.5">
                  Registered branches
                </span>
              </div>
            </div>

            {/* Card 2: Active Librarians */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between h-[100px] group">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-500">Active Librarians</span>
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-extrabold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight block leading-none">{activeLibrarians}</span>
                <span className="inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200/80 mt-0.5">
                  Active accounts
                </span>
              </div>
            </div>

            {/* Card 3: Total Members */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between h-[100px] group">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-500">Total Members</span>
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-extrabold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight block leading-none">{totalMembers}</span>
                <span className="inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200/80 mt-0.5">
                  Registered members
                </span>
              </div>
            </div>

            {/* Card 4: Active Borrowings */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between h-[100px] group">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-500">Active Borrowings</span>
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-extrabold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <ArrowLeftRight className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight block leading-none">{activeBorrowings}</span>
                <span className="inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 mt-0.5">
                  Books borrowed
                </span>
              </div>
            </div>

            {/* Card 5: Platform Revenue */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between h-[100px] group">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-500">Platform Revenue</span>
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-extrabold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight block leading-none">${platformRevenue.toFixed(2)}</span>
                <span className="inline-block text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 mt-0.5">
                  Subscriptions + Fines
                </span>
              </div>
            </div>
          </div>

          {/* 3. MAIN ANALYTICS AREA (LEFT 65% / RIGHT 35%) (FLEX-1 EXPANDS TO FILL SCREEN) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch flex-1 min-lg:h-[240px] w-full">
            {/* LEFT: PLATFORM ACTIVITY (65% / lg:col-span-8) */}
            <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs h-full min-lg:h-[240px] overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-2 shrink-0">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-tight uppercase flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    Platform Activity
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">Library and borrowing activity over time.</p>
                </div>

                {/* Series Legend Only */}
                <div className="flex items-center gap-3 text-[10px] font-extrabold">
                  <span className="flex items-center gap-1.5 text-amber-700"><span className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-2xs" /> Libraries</span>
                  <span className="flex items-center gap-1.5 text-blue-700"><span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-2xs" /> Members</span>
                  <span className="flex items-center gap-1.5 text-emerald-700"><span className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-2xs" /> Borrowings</span>
                </div>
              </div>

              {/* Activity Bar Chart Visual */}
              {trendData.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-2.5 bg-slate-50/80 rounded-xl border border-dashed border-slate-200 space-y-1">
                  <Activity className="w-4 h-4 text-slate-300 mx-auto" />
                  <p className="text-[11px] font-bold text-slate-500">No platform activity recorded for this period.</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-end min-h-0 pt-1">
                  <div className="flex-1 min-h-[135px] flex items-end justify-between gap-3 sm:gap-4 px-1.5 border-b border-slate-100 pb-1">
                    {trendData.map((d, idx) => {
                      const libPct = Math.round(((d.Libraries || 0) / maxVal) * 100);
                      const mebPct = Math.round(((d.Members || 0) / maxVal) * 100);
                      const borPct = Math.round(((d.Borrowings || 0) / maxVal) * 100);

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                          <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                            <div
                              style={{ height: `${Math.max(libPct, 8)}%` }}
                              className="w-full max-w-[12px] bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md transition-all duration-300 group-hover:from-amber-700 group-hover:to-amber-500 relative flex items-center justify-center shadow-xs"
                            >
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 text-[8.5px] font-black text-white bg-slate-900 px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-10 pointer-events-none">
                                {d.Libraries || 0} Libs
                              </div>
                            </div>

                            <div
                              style={{ height: `${Math.max(mebPct, 8)}%` }}
                              className="w-full max-w-[12px] bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-md transition-all duration-300 group-hover:from-blue-800 group-hover:to-blue-600 relative flex items-center justify-center shadow-xs"
                            >
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 text-[8.5px] font-black text-white bg-slate-900 px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-10 pointer-events-none">
                                {d.Members || 0} Mebs
                              </div>
                            </div>

                            <div
                              style={{ height: `${Math.max(borPct, 8)}%` }}
                              className="w-full max-w-[12px] bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-t-md transition-all duration-300 group-hover:from-emerald-800 group-hover:to-emerald-600 relative flex items-center justify-center shadow-xs"
                            >
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 text-[8.5px] font-black text-white bg-slate-900 px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-10 pointer-events-none">
                                {d.Borrowings || 0} Borrows
                              </div>
                            </div>
                          </div>

                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">{d.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDE (35% / lg:col-span-4): NETWORK STATUS & REVENUE SUMMARY STACKED (~230px TOTAL) */}
            <div className="lg:col-span-4 flex flex-col gap-2 min-h-0 h-[230px]">
              {/* TOP: NETWORK STATUS (110px) */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 space-y-1 shadow-2xs h-[110px] flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-0.5 shrink-0">
                  <span className="font-black text-slate-900 text-[11px] uppercase tracking-wider">Network Status</span>
                  <Building2 className="w-3 h-3 text-amber-600 shrink-0" />
                </div>

                <div className="space-y-1 text-[10px] flex-1 flex flex-col justify-center">
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between font-extrabold">
                      <span className="flex items-center gap-1 text-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        Active Libraries
                      </span>
                      <span className="text-slate-900 font-black">{libActive} <span className="text-slate-400 text-[9px] font-semibold">({activePct}%)</span></span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${activePct}%` }} />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between font-extrabold">
                      <span className="flex items-center gap-1 text-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        Pending Approval
                      </span>
                      <span className="text-slate-900 font-black">{libPending} <span className="text-slate-400 text-[9px] font-semibold">({pendingPct}%)</span></span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${pendingPct}%` }} />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between font-extrabold">
                      <span className="flex items-center gap-1 text-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                        Inactive Libraries
                      </span>
                      <span className="text-slate-900 font-black">{libInactive} <span className="text-slate-400 text-[9px] font-semibold">({inactivePct}%)</span></span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-slate-400 to-slate-300 rounded-full transition-all duration-500" style={{ width: `${inactivePct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM: REVENUE SUMMARY (112px) */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 space-y-1 shadow-2xs h-[112px] flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 pb-0.5 shrink-0">
                  <span className="font-black text-slate-900 text-[11px] uppercase tracking-wider">Revenue Summary</span>
                  <DollarSign className="w-3 h-3 text-emerald-600 shrink-0" />
                </div>

                <div className="space-y-1 text-xs flex-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between text-[10.5px] px-0.5">
                    <span className="font-semibold text-slate-600">Subscriptions</span>
                    <span className="font-black text-slate-900">${subscriptionRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] px-0.5">
                    <span className="font-semibold text-slate-600">Fines</span>
                    <span className="font-black text-slate-900">${fineRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50/90 to-teal-50/80 px-2 py-0.5 rounded-lg border border-emerald-200/90 text-emerald-950 font-black shadow-2xs">
                    <span className="text-[10px] font-black text-emerald-900">Total Revenue</span>
                    <span className="text-[11px] font-black text-emerald-700">${platformRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. BOTTOM ROW (LEFT 65% RECENT LIBRARIES / RIGHT 35% ADMIN ATTENTION) (~142px PERFECT FIT, NO CLIPPING) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch shrink-0">
            {/* LEFT: RECENT LIBRARIES (65% / lg:col-span-8) */}
            <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-2.5 pt-2 pb-2 flex flex-col justify-between shadow-2xs h-[142px] overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1 shrink-0">
                <div>
                  <h3 className="text-xs font-black text-slate-900 tracking-tight leading-tight uppercase">
                    Recent Libraries
                  </h3>
                  <p className="text-[9px] text-slate-500 font-medium">Newly registered library branches in network.</p>
                </div>
                <Link
                  to="/admin/libraries"
                  className="text-[10px] font-black text-amber-700 hover:text-amber-800 flex items-center gap-1 transition-colors group"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {recentLibraries.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center p-2 text-xs text-slate-400 font-medium italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  No recent libraries found.
                </div>
              ) : (
                <div className="flex-1 overflow-hidden min-h-0 flex flex-col justify-center py-0.5">
                  <div className="divide-y divide-slate-100 text-xs">
                    {recentLibraries.map((lib) => (
                      <div key={lib.id} className="py-0.5 flex items-center justify-between gap-2 hover:bg-amber-50/40 px-1 rounded-md transition-colors">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-5.5 h-5.5 rounded-md bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-bold shrink-0">
                            <Building2 className="w-3 h-3 text-amber-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 truncate text-[11px] leading-tight">{lib.name}</p>
                            <p className="text-[8.5px] text-slate-400 truncate leading-none">Librarian: {lib.librarian_name || lib.librarian?.name || 'Unassigned'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[8px] font-black px-2 py-0.2 rounded-full uppercase border ${
                            lib.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
                              : lib.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200/90'
                              : 'bg-slate-100 text-slate-600 border-slate-200/90'
                          }`}>
                            {lib.status || 'Active'}
                          </span>
                          <Link
                            to={`/admin/libraries`}
                            className="p-0.5 text-slate-400 hover:text-slate-900 rounded transition-colors"
                            title="View Library Details"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: ADMIN ATTENTION (35% / lg:col-span-4) - EQUAL HEIGHT 142px, NO CLIPPING */}
            <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-2.5 pt-2 pb-2 flex flex-col justify-between shadow-2xs h-[142px] overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1 shrink-0">
                <div>
                  <h3 className="text-xs font-black text-slate-900 tracking-tight leading-tight uppercase">
                    Admin Attention
                  </h3>
                  <p className="text-[9px] text-slate-500 font-medium">Pending platform actions requiring review.</p>
                </div>
                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
              </div>

              {libPending > 0 || pendingActions.length > 0 ? (
                <div className="flex-1 overflow-y-auto space-y-1 py-0.5 text-xs">
                  {libPending > 0 && (
                    <Link
                      to="/admin/libraries"
                      className="p-1.5 bg-amber-50/90 border border-amber-200 rounded-xl flex items-center justify-between gap-2 hover:bg-amber-100/90 transition-all block group shadow-2xs"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-ping" />
                        <span className="font-black text-amber-950 text-[10.5px] truncate">
                          {libPending} Library {libPending === 1 ? 'Approval' : 'Approvals'} Pending
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-amber-700 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )}

                  {pendingActions.map((action, idx) => (
                    <Link
                      key={idx}
                      to={action.path || action.target || '/admin'}
                      className="p-1.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2 hover:bg-slate-100 transition-all block group"
                    >
                      <span className="font-extrabold text-slate-800 text-[10.5px] truncate">{action.title || action.label || 'Action Required'}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-1.5 bg-gradient-to-r from-emerald-50/90 to-teal-50/70 rounded-xl border border-emerald-200/80 text-emerald-900 gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-[11.5px] text-emerald-950 leading-tight">Everything is up to date</p>
                    <p className="text-[9px] text-emerald-800 font-medium leading-none">All library branches &amp; requests are processed.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
