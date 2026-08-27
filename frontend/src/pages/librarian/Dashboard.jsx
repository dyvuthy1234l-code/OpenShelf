import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import librarianService from '../../services/librarianService';
import { REVEAL_VARIANTS } from '../../constants/motionTokens';

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setInitialLoading(true);
      setError(null);

      const libRes = await librarianService.getMyLibrary();
      const myLib = libRes.data || libRes.library || null;
      setLibrary(myLib);

      if (myLib) {
        const [repRes, catRes, memRes, reqRes] = await Promise.allSettled([
          librarianService.getReports({}),
          librarianService.getCategories(),
          librarianService.getMembers(),
          librarianService.getBorrowings({ per_page: 5, status: 'pending' }),
        ]);

        if (repRes.status === 'fulfilled') setReports(repRes.value?.data || null);
        if (catRes.status === 'fulfilled') setCategories(catRes.value?.data || []);
        if (memRes.status === 'fulfilled' && memRes.value?.summary) {
          setMemberSummary(memRes.value.summary);
        }

        let reqs = [];
        if (reqRes.status === 'fulfilled' && Array.isArray(reqRes.value?.data) && reqRes.value.data.length > 0) {
          reqs = reqRes.value.data;
        } else if (repRes.status === 'fulfilled' && Array.isArray(repRes.value?.data?.borrowing_history)) {
          reqs = repRes.value.data.borrowing_history.slice(0, 5);
        }
        setRecentRequests(reqs);
      }
    } catch (err) {
      setError('Unable to load analytics dashboard data. Please try again.');
    } finally {
      if (!isSilent) setInitialLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  // Background refetch on date range change
  useEffect(() => {
    if (initialLoading || !library) return;

    let isMounted = true;
    const updateReports = async () => {
      try {
        const reportParams = {};
        if (dateRange.startDate) reportParams.start_date = dateRange.startDate;
        if (dateRange.endDate) reportParams.end_date = dateRange.endDate;

        const repRes = await librarianService.getReports(reportParams);
        if (isMounted && repRes?.data) {
          setReports(repRes.data);
          if (Array.isArray(repRes.data.borrowing_history) && repRes.data.borrowing_history.length > 0) {
            setRecentRequests(repRes.data.borrowing_history.slice(0, 5));
          }
        }
      } catch {
        // Non-critical fallback
      }
    };

    updateReports();
    return () => { isMounted = false; };
  }, [dateRange.startDate, dateRange.endDate, library, initialLoading]);

  const handleDateRangeChange = ({ startDate, endDate, preset }) => {
    setDateRange({ startDate, endDate, preset });
  };

  return (
    <div className="flex-1 flex flex-col justify-between min-h-0 space-y-2.5 h-full w-full font-sans">
      {/* Header Section */}
      <DashboardHeader
        user={user}
        library={library}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onLibraryStatusChange={(updatedLib) => setLibrary(updatedLib)}
      />

      {/* Error State Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-3 shadow-2xs shrink-0">
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

      {/* Loading Skeleton */}
      {initialLoading && !reports ? (
        <div className="flex-1 space-y-2.5 animate-pulse min-h-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[100px] bg-white rounded-2xl border border-slate-200" />
            ))}
          </div>
          <div className="h-64 lg:h-[255px] bg-white rounded-2xl border border-slate-200" />
          <div className="h-40 lg:h-[155px] bg-white rounded-2xl border border-slate-200" />
        </div>
      ) : (
        <motion.div
          key={dateRange.preset}
          initial={{ opacity: 0.82, y: 3, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="flex-1 flex flex-col justify-between min-h-0 space-y-2.5"
        >
          {/* KPI ROW */}
          <AnalyticsKpiGrid reports={reports} memberSummary={memberSummary} />

          {/* MAIN ANALYTICS ROW (65% Borrowing Activity + 35% Popular Books) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch lg:h-[255px] min-h-0">
            <div className="lg:col-span-8 h-full min-h-0">
              <BorrowingActivityChart
                circulationData={reports?.monthly_circulation || []}
                borrowings={reports?.borrowing_history || []}
                library={library}
                preset={dateRange.preset}
              />
            </div>
            <div className="lg:col-span-4 h-full min-h-0">
              <PopularBooksChart borrowings={reports?.borrowing_history || []} />
            </div>
          </div>

          {/* BOTTOM ROW (50% Recent Requests + 50% Book Categories) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch lg:h-[155px] min-h-0">
            <div className="lg:col-span-6 h-full min-h-0">
              <RecentRequestsTable requests={reports?.borrowing_history && reports.borrowing_history.length > 0 ? reports.borrowing_history : recentRequests} />
            </div>
            <div className="lg:col-span-6 h-full min-h-0">
              <CategoryDistributionChart categories={categories} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
