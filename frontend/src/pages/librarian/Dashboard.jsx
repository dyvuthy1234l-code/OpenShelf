import { useState, useMemo } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  useMyLibrary, 
  useLibrarianReports, 
  useLibrarianCategories, 
  useLibrarianMembers 
} from '../../hooks/queries/useLibrarianQueries';

import DashboardHeader from '../../components/librarian/DashboardHeader';
import AnalyticsKpiGrid from '../../components/librarian/AnalyticsKpiGrid';
import BorrowingActivityChart from '../../components/librarian/BorrowingActivityChart';
import PopularBooksChart from '../../components/librarian/PopularBooksChart';
import CategoryDistributionChart from '../../components/librarian/CategoryDistributionChart';
import CategoryOverviewChart from '../../components/librarian/CategoryOverviewChart';

export default function Dashboard() {
  const { user } = useAuth();

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
    preset: 'all',
  });

  const { data: libRes, refetch: refetchLib } = useMyLibrary();
  const library = libRes?.data || libRes?.library || null;

  const reportParams = useMemo(() => {
    const params = {};
    if (dateRange.startDate) params.start_date = dateRange.startDate;
    if (dateRange.endDate) params.end_date = dateRange.endDate;
    return params;
  }, [dateRange.startDate, dateRange.endDate]);

  const { data: repRes, isLoading: repLoading, error: repError, refetch: refetchRep } = useLibrarianReports(reportParams);
  const { data: catRes } = useLibrarianCategories();
  const { data: memRes } = useLibrarianMembers({ per_page: 1 });

  const reports = repRes?.data || repRes || null;
  const categories = catRes?.data || catRes || [];
  const memberSummary = memRes?.summary || { total_members: 0, active_borrowers: 0, overdue_borrowers: 0 };
  const initialLoading = repLoading && !reports;
  const error = repError ? 'Unable to load analytics dashboard data. Please try again.' : null;

  const fetchDashboardData = () => {
    refetchLib();
    refetchRep();
  };

  const handleDateRangeChange = ({
    startDate,
    endDate,
    preset,
  }) => {
    setDateRange({
      startDate,
      endDate,
      preset,
    });
  };

  return (
    <div
      className="
        w-full
        min-w-0
        min-h-0
        flex-1
        h-full
        flex
        flex-col
        justify-between
        overflow-hidden
        scrollbar-none
        font-sans
      "
    >
      {/* =========================
          HEADER
      ========================== */}
      <div className="shrink-0">
        <DashboardHeader
          user={user}
          library={library}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onLibraryStatusChange={(updatedLib) =>
            setLibrary(updatedLib)
          }
        />
      </div>

      {/* =========================
          ERROR
      ========================== */}
      {error && (
        <div
          className="
            mt-2.5
            shrink-0
            flex
            items-center
            justify-between
            gap-3
            rounded-2xl
            border
            border-rose-200
            bg-rose-50
            px-3
            py-2.5
            text-xs
            font-semibold
            text-rose-800
          "
        >
          <div className="flex min-w-0 items-center gap-2">
            <AlertCircle
              className="h-4 w-4 shrink-0 text-rose-600"
            />

            <span className="truncate">
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={() => fetchDashboardData(false)}
            className="
              inline-flex
              min-h-9
              shrink-0
              cursor-pointer
              items-center
              gap-1.5
              rounded-xl
              bg-rose-600
              px-3
              py-1.5
              text-xs
              font-bold
              text-white
              transition-colors
              hover:bg-rose-700
            "
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* =========================
          CONTENT
      ========================== */}
      {initialLoading && !reports ? (
        <div
          className="
            mt-2.5
            min-h-0
            flex-1
            space-y-2.5
            animate-pulse
          "
        >
          {/* KPI skeleton */}
          <div
            className="
              grid
              grid-cols-1
              gap-2.5
              sm:grid-cols-2
              lg:grid-cols-5
            "
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="
                  h-[86px]
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                "
              />
            ))}
          </div>

          {/* Analytics skeleton */}
          <div
            className="
              grid
              grid-cols-1
              gap-2.5
              lg:grid-cols-12
            "
          >
            <div
              className="
                h-[260px]
                rounded-2xl
                border
                border-slate-200
                bg-white
                lg:col-span-8
                lg:h-[235px]
              "
            />

            <div
              className="
                h-[220px]
                rounded-2xl
                border
                border-slate-200
                bg-white
                lg:col-span-4
                lg:h-[235px]
              "
            />
          </div>

          {/* Category skeleton */}
          <div
            className="
              grid
              grid-cols-1
              gap-2.5
              lg:grid-cols-12
            "
          >
            <div
              className="
                h-[280px]
                rounded-2xl
                border
                border-slate-200
                bg-white
                lg:col-span-6
                lg:h-[250px]
              "
            />

            <div
              className="
                h-[280px]
                rounded-2xl
                border
                border-slate-200
                bg-white
                lg:col-span-6
                lg:h-[250px]
              "
            />
          </div>
        </div>
      ) : (
        <motion.div
          initial={{
            opacity: 0,
            y: 6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.22,
            ease: 'easeOut',
          }}
          className="
            mt-2
            min-h-0
            flex-1
            h-full
            flex
            flex-col
            justify-between
            space-y-2
            lg:space-y-2.5
          "
        >
          {/* =========================
              KPI
          ========================== */}
          <section className="min-w-0 shrink-0">
            <AnalyticsKpiGrid
              reports={reports}
              memberSummary={memberSummary}
            />
          </section>

          {/* =========================
              ANALYTICS
          ========================== */}
          <section
            className="
              grid
              min-w-0
              flex-1
              min-h-0
              grid-cols-1
              items-stretch
              gap-2.5
              lg:grid-cols-12
            "
          >
            {/* Borrowing Activity */}
            <div
              className="
                min-w-0
                h-full
                min-h-0
                lg:col-span-8
              "
            >
              <BorrowingActivityChart
                circulationData={
                  reports?.monthly_circulation || []
                }
                borrowings={
                  reports?.borrowing_history || []
                }
                library={library}
                preset={dateRange.preset}
              />
            </div>

            {/* Popular Books */}
            <div
              className="
                min-w-0
                h-full
                min-h-0
                lg:col-span-4
              "
            >
              <PopularBooksChart
                borrowings={
                  reports?.borrowing_history || []
                }
              />
            </div>
          </section>

          {/* =========================
              CATEGORY
          ========================== */}
          <section
            className="
              grid
              min-w-0
              flex-1
              min-h-0
              grid-cols-1
              items-stretch
              gap-2.5
              lg:grid-cols-12
            "
          >
            {/* Donut Category Overview */}
            <div
              className="
                min-w-0
                h-full
                min-h-0
                lg:col-span-6
              "
            >
              <CategoryOverviewChart
                categories={categories}
                reports={reports}
              />
            </div>

            {/* Category Distribution */}
            <div
              className="
                min-w-0
                h-full
                min-h-0
                lg:col-span-6
              "
            >
              <CategoryDistributionChart
                categories={categories}
              />
            </div>
          </section>
        </motion.div>
      )}
    </div>
  );
}
