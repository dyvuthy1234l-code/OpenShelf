import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import librarianService from '../../services/librarianService';

import DashboardHeader from '../../components/librarian/DashboardHeader';
import AnalyticsKpiGrid from '../../components/librarian/AnalyticsKpiGrid';
import BorrowingActivityChart from '../../components/librarian/BorrowingActivityChart';
import PopularBooksChart from '../../components/librarian/PopularBooksChart';
import CategoryDistributionChart from '../../components/librarian/CategoryDistributionChart';
import RecentRequestsTable from '../../components/librarian/RecentRequestsTable';

export default function Dashboard() {
  const { user } = useAuth();

  const [library, setLibrary] = useState(null);
  const [reports, setReports] = useState(null);
  const [categories, setCategories] = useState([]);
  const [memberSummary, setMemberSummary] = useState({ total_members: 0 });
  const [recentRequests, setRecentRequests] = useState([]);

  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '', preset: 'all' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError(null);

      // 1. Fetch librarian's library
      const libRes = await librarianService.getMyLibrary();
      const myLib = libRes.data || libRes.library || null;
      setLibrary(myLib);

      if (myLib) {
        const reportParams = {};
        if (dateRange.startDate) reportParams.start_date = dateRange.startDate;
        if (dateRange.endDate) reportParams.end_date = dateRange.endDate;

        const [repRes, catRes, memRes, reqRes] = await Promise.allSettled([
          librarianService.getReports(reportParams),
          librarianService.getCategories(),
          librarianService.getMembers(),
          librarianService.getBorrowings({ per_page: 5, status: 'pending' }),
        ]);

        if (repRes.status === 'fulfilled') setReports(repRes.value?.data || null);
        if (catRes.status === 'fulfilled') setCategories(catRes.value?.data || []);
        if (memRes.status === 'fulfilled') {
          if (memRes.value?.summary) setMemberSummary(memRes.value.summary);
        }

        let reqs = [];
        if (reqRes.status === 'fulfilled' && Array.isArray(reqRes.value?.data) && reqRes.value.data.length > 0) {
          reqs = reqRes.value.data;
        } else if (repRes.status === 'fulfilled' && Array.isArray(repRes.value?.data?.borrowing_history) && repRes.value.data.borrowing_history.length > 0) {
          reqs = repRes.value.data.borrowing_history.slice(0, 5);
        }
        setRecentRequests(reqs);
      }
    } catch (err) {
      if (!isSilent) setError('Unable to load analytics dashboard data. Please try again.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    fetchDashboardData(false);

    // Auto-refresh interval every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 30000);

    // Auto-refresh when tab regains focus
    const handleFocus = () => fetchDashboardData(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchDashboardData]);

  const handleDateRangeChange = ({ startDate, endDate, preset }) => {
    setDateRange({ startDate, endDate, preset });
  };

  return (
    <div className="flex-1 flex flex-col justify-between min-h-0 space-y-3 lg:overflow-hidden overflow-y-auto h-full w-full">
      {/* 1. Header Section (~75-85px) */}
      <DashboardHeader
        user={user}
        library={library}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onLibraryStatusChange={(updatedLib) => setLibrary(updatedLib)}
      />

      {/* Error State Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="flex-1 space-y-3 animate-pulse min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[108px] bg-white rounded-2xl border border-slate-200" />
            ))}
          </div>
          <div className="h-[255px] bg-white rounded-2xl border border-slate-200" />
          <div className="h-[155px] bg-white rounded-2xl border border-slate-200" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between min-h-0 space-y-3">
          {/* SECTION 2: KPI ROW (5 Equal Height Cards ~108px) */}
          <AnalyticsKpiGrid reports={reports} memberSummary={memberSummary} />

          {/* SECTION 3: MAIN ANALYTICS ROW (65% Borrowing Activity + 35% Popular Books ~255px) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch h-[255px] min-h-0">
            <div className="lg:col-span-8 h-full min-h-0">
              <BorrowingActivityChart
                circulationData={reports?.monthly_circulation || []}
                borrowings={reports?.borrowing_history || []}
                library={library}
              />
            </div>
            <div className="lg:col-span-4 h-full min-h-0">
              <PopularBooksChart borrowings={reports?.borrowing_history || []} />
            </div>
          </div>

          {/* SECTION 4: BOTTOM ROW (50% Recent Requests + 50% Book Categories ~155px) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch h-[155px] min-h-0">
            <div className="lg:col-span-6 h-full min-h-0">
              <RecentRequestsTable requests={recentRequests} />
            </div>
            <div className="lg:col-span-6 h-full min-h-0">
              <CategoryDistributionChart categories={categories} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
