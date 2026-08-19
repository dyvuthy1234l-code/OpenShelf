import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle, FileText, Download, Info } from 'lucide-react';
import librarianService from '../../services/librarianService';

import PageHeader from '../../components/librarian/common/PageHeader';
import ReportFilters from '../../components/librarian/reports/ReportFilters';
import ReportStats from '../../components/librarian/reports/ReportStats';
import BorrowingChart from '../../components/librarian/reports/BorrowingChart';
import StatusBreakdown from '../../components/librarian/reports/StatusBreakdown';
import CategoryDistributionCard from '../../components/librarian/reports/CategoryDistributionCard';
import FineSummary from '../../components/librarian/reports/FineSummary';
import TopActiveMembers from '../../components/librarian/reports/TopActiveMembers';
import PopularBooks from '../../components/librarian/reports/PopularBooks';

export default function ReportsPage() {
  const [rawReport, setRawReport] = useState(null);
  const [categories, setCategories] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Date Range Preset Filter (default preset: 'month')
  const [preset, setPreset] = useState('month');

  // Fetch static categories once on mount
  useEffect(() => {
    librarianService.getCategories()
      .then((res) => setCategories(res.data || res.categories || []))
      .catch(() => setCategories([]));
  }, []);

  // Fetch report data dynamically when preset changes
  const fetchReportsData = useCallback(async (selectedPreset) => {
    const currentPreset = selectedPreset || preset;
    try {
      if (rawReport) {
        setIsUpdating(true);
      } else {
        setInitialLoading(true);
      }
      setError(null);

      const reportParams = { date_range: currentPreset };
      const reportRes = await librarianService.getReports(reportParams);
      setRawReport(reportRes.data || null);
    } catch (err) {
      setError('Unable to load library reports & analytics.');
    } finally {
      setInitialLoading(false);
      setIsUpdating(false);
    }
  }, [preset, rawReport]);

  useEffect(() => {
    fetchReportsData(preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  const handlePresetFilter = ({ preset: newPreset }) => {
    if (newPreset !== preset) {
      setPreset(newPreset);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const list = rawReport?.borrowing_history || [];
    if (!list || !list.length) {
      alert('No borrowing data available to export.');
      return;
    }
    const headers = ['ID', 'User', 'Book', 'Status', 'Requested At', 'Returned At', 'Fine Amount'];
    const rows = list.map((b) => [
      b.id,
      `"${(b.user?.name || '').replace(/"/g, '""')}"`,
      `"${(b.book?.title || '').replace(/"/g, '""')}"`,
      b.status,
      b.created_at || b.requested_at || '',
      b.returned_at || '',
      b.fine_amount || 0,
    ]);

    const csvString = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    // Add UTF-8 BOM (\uFEFF) for proper Excel/Unicode CSV support
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `library_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3.5 lg:overflow-y-auto h-full w-full pr-1 pb-4">
      {/* 1. Header with Title & Export Actions */}
      <PageHeader
        eyebrow="DETAILED PERFORMANCE ANALYSIS"
        title="Library Reports"
        description="Analyze borrowing activity, returns, overdue books, and library performance."
      >
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-[#102A43] font-extrabold text-xs rounded-xl border border-[#DCE6F0] transition-colors shadow-xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Print / Save PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2D8A61] hover:bg-[#236F4E] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Export CSV</span>
          </button>
        </div>
      </PageHeader>

      {/* Error Alert Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchReportsData(preset)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* 2. DATE FILTER CONTROL BAR (Always visible & interactive) */}
      <div className="print:hidden">
        <ReportFilters
          activePreset={preset}
          onApply={handlePresetFilter}
          isFiltering={isUpdating}
        />
      </div>

      {/* Loading Skeleton on Initial Page Load Only */}
      {initialLoading ? (
        <div className="space-y-3.5 animate-pulse flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[115px] bg-white rounded-2xl border border-[#DCE6F0]" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-8 h-[260px] bg-white rounded-2xl border border-[#DCE6F0]" />
            <div className="lg:col-span-4 h-[260px] bg-white rounded-2xl border border-[#DCE6F0]" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-6 h-[230px] bg-white rounded-2xl border border-[#DCE6F0]" />
            <div className="lg:col-span-6 h-[230px] bg-white rounded-2xl border border-[#DCE6F0]" />
          </div>
        </div>
      ) : (
        <motion.div
          animate={{ opacity: isUpdating ? 0.65 : 1, y: isUpdating ? 2 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex-1 flex flex-col min-h-0 space-y-3.5"
        >
          {/* 3. 4 KPI CARDS (Total Books, Active Borrowings, Completed Returns, Overdue Books) */}
          <ReportStats reportData={rawReport} />

          {/* 4. MAIN ANALYTICS ROW (65% Circulation Activity + 35% Request Status Breakdown) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
            <div className="lg:col-span-8">
              <BorrowingChart
                circulationData={rawReport?.monthly_circulation || []}
                borrowings={rawReport?.borrowing_history || []}
                timeFilter={preset}
                library={rawReport}
              />
            </div>
            <div className="lg:col-span-4">
              <StatusBreakdown breakdown={rawReport?.status_breakdown || []} reportData={rawReport} />
            </div>
          </div>

          {/* 5. DEEP ANALYTICS ROW 1 (Overdue & Fine Trend + Book Distribution by Category) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
            <div className="lg:col-span-6">
              <FineSummary reportData={rawReport} circulationData={rawReport?.monthly_circulation || []} />
            </div>
            <div className="lg:col-span-6">
              <CategoryDistributionCard categories={categories} borrowings={rawReport?.borrowing_history || []} reportData={rawReport} />
            </div>
          </div>

          {/* 6. DEEP ANALYTICS ROW 2 (Top Borrowed Books + Top Active Members) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
            <div className="lg:col-span-6">
              <PopularBooks borrowings={rawReport?.borrowing_history || []} reportData={rawReport} />
            </div>
            <div className="lg:col-span-6">
              <TopActiveMembers reportData={rawReport} borrowings={rawReport?.borrowing_history || []} />
            </div>
          </div>

          {/* 7. REAL-TIME DISCLAIMER BANNER */}
          <div className="flex items-center gap-2 text-[10.5px] font-bold text-[#64748B] bg-white border border-[#DCE6F0] px-3.5 py-2 rounded-xl shrink-0 print:hidden">
            <Info className="w-3.5 h-3.5 text-[#123A63] shrink-0" />
            <span>Reports are based on real-time library database records and reflect current performance analysis.</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
