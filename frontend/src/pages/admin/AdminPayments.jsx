import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, CreditCard, AlertCircle, CheckCircle2, Clock, 
  TrendingUp, Download, Search, RotateCcw, Eye, ChevronLeft, 
  ChevronRight, Calendar, Building2, User, BookOpen, Layers, X 
} from 'lucide-react';
import adminService from '../../services/adminService';
import AdminPagination from '../../components/admin/AdminPagination';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, subscription, fine
  const [statusFilter, setStatusFilter] = useState('all'); // all, paid, pending, failed
  const [libraryFilter, setLibraryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, month, quarter, year

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, from: null, to: null });
  const [summary, setSummary] = useState({ total_revenue: 0, subscription_revenue: 0, fine_revenue: 0, pending_count: 0, pending_total: 0 });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [payRes, libRes] = await Promise.all([
        adminService.getPayments({
          page: currentPage,
          per_page: perPage,
          search: searchQuery,
          type: typeFilter,
          status: statusFilter,
          library: libraryFilter,
          date: dateFilter,
        }),
        adminService.getLibraries({ per_page: -1 }),
      ]);
      const data = payRes.data || {};
      setPayments(data.payments || []);
      setLibraries(libRes.data || []);
      setPagination(payRes.meta || pagination);
      setSummary(payRes.summary || summary);
      return payRes;
    } catch {
      setError('Failed to load financial records.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchQuery, typeFilter, statusFilter, libraryFilter, dateFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, statusFilter, libraryFilter, dateFilter]);

  // Normalize the already-paginated server response into the table shape.
  const allPayments = useMemo(() => {
    return payments.map((p) => {
      if (p.type === 'fine') {
        return {
          id: p.id,
          rawId: p.raw_id || p.id,
          type: 'fine',
          payerName: p.payer_name || p.user?.name || 'Member',
          payerEmail: p.payer_email || p.user?.email || '',
          payerAvatar: p.user?.avatar_url,
          libraryName: p.library_name || p.library?.name || 'Library Branch',
          libraryId: p.library?.id,
          amount: Number(p.amount || 0),
          method: p.payment_method || 'Fine Settlement',
          status: p.status || 'paid',
          date: p.paid_at || p.created_at,
          original: p,
        };
      }

      return {
        id: p.transaction_id || `SUB-${p.id}`,
        rawId: p.id,
        type: 'subscription',
        payerName: p.user?.name || 'Librarian',
        payerEmail: p.user?.email || '',
        payerAvatar: p.user?.avatar_url,
        libraryName: p.user?.library?.name || 'Library Branch',
        libraryId: p.user?.library?.id,
        amount: Number(p.amount || 0),
        method: p.payment_method || 'Online Payment',
        status: p.status || 'paid',
        date: p.paid_at || p.created_at,
        original: p,
      };
    });
  }, [payments]);

  const filteredPayments = allPayments;
  const paginatedPayments = allPayments;
  const totalItems = pagination.total || 0;
  const totalPages = pagination.last_page || 1;

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setLibraryFilter('all');
    setDateFilter('all');
    setCurrentPage(1);
  };

  // Export CSV Report
  const handleExportCSV = () => {
    if (filteredPayments.length === 0) return;
    const headers = ['Payment ID', 'Type', 'Payer', 'Email', 'Library', 'Amount ($)', 'Method', 'Date', 'Status'];
    const rows = filteredPayments.map((p) => [
      p.id,
      p.type.toUpperCase(),
      `"${p.payerName}"`,
      `"${p.payerEmail}"`,
      `"${p.libraryName}"`,
      p.amount.toFixed(2),
      `"${p.method}"`,
      p.date ? new Date(p.date).toLocaleDateString() : 'N/A',
      p.status.toUpperCase(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `OpenShelf_Payment_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Financial Calculations (ONLY SUCCESSFUL PAYMENTS COUNTED TOWARDS REVENUE)
  const subscriptionRevenue = Number(summary.subscription_revenue || 0);
  const fineRevenue = Number(summary.fine_revenue || 0);
  const totalRevenue = Number(summary.total_revenue || 0);
  const pendingCount = summary.pending_count || 0;
  const pendingTotal = Number(summary.pending_total || 0);
  const revenueTrend = summary.revenue_trend || [];
  const maxChartVal = Math.max(...revenueTrend.map((d) => Number(d.Total || 0)), 50);

  // Contribution Percentages
  const subPercent = totalRevenue > 0 ? Math.round((subscriptionRevenue / totalRevenue) * 100) : 0;
  const finePercent = totalRevenue > 0 ? 100 - subPercent : 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-2 overflow-y-auto h-full pr-1 pb-1 font-sans">
      {/* 1. PAGE HEADER (CLIENT-READY FINANCIAL MANAGEMENT) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <span className="text-[9px] uppercase font-black tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md inline-block">
            Financial Management
          </span>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight mt-0.5">Payments &amp; Revenue</h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Monitor subscription payments, fine collections, and financial activity across the OpenShelf platform.
          </p>
        </div>

        {/* Integrated Time Period Selector & Export Report */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 text-xs">
            {[
              { key: 'all', label: 'All Time' },
              { key: 'month', label: 'This Month' },
              { key: 'quarter', label: 'Last 3 Months' },
              { key: 'year', label: 'This Year' },
            ].map((df) => (
              <button
                key={df.key}
                onClick={() => {
                  setDateFilter(df.key);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  dateFilter === df.key
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {df.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            disabled={filteredPayments.length === 0}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 h-9 sm:h-10 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY CARDS (2x2 GRID ON MOBILE, 4-COL ON DESKTOP) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 shrink-0">
        {/* Card 1: Total Revenue (Strongest Financial Card) */}
        <div className="bg-white border border-emerald-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between h-[82px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full -z-0" />
          <div className="relative z-10">
            <span className="text-[9px] uppercase font-black tracking-wider text-emerald-800 block">Total Revenue</span>
            <span className="text-xl font-black text-emerald-950 tracking-tight block leading-tight mt-0.5">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="inline-block text-[9px] font-bold text-emerald-700 mt-0.5">Selected period</span>
          </div>
          <div className="w-7.5 h-7.5 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs relative z-10">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        {/* Card 2: Subscription Revenue */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between h-[82px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Subscription Revenue</span>
            <span className="text-xl font-black text-blue-950 tracking-tight block leading-tight mt-0.5">${subscriptionRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="inline-block text-[9px] font-bold text-blue-700 mt-0.5">Successful plan payments</span>
          </div>
          <div className="w-7.5 h-7.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
          </div>
        </div>

        {/* Card 3: Fine Revenue */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between h-[82px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Fine Revenue</span>
            <span className="text-xl font-black text-amber-950 tracking-tight block leading-tight mt-0.5">${fineRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="inline-block text-[9px] font-bold text-amber-700 mt-0.5">Collected fines</span>
          </div>
          <div className="w-7.5 h-7.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          </div>
        </div>

        {/* Card 4: Pending Payments */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between h-[82px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Pending Payments</span>
            <span className="text-xl font-black text-slate-900 tracking-tight block leading-tight mt-0.5">{pendingCount}</span>
            <span className="inline-block text-[9px] font-bold text-amber-700 mt-0.5">Awaiting verification (${pendingTotal.toFixed(2)})</span>
          </div>
          <div className="w-7.5 h-7.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
        </div>
      </div>

      {/* 3. REVENUE BREAKDOWN VISUAL COMPARISON */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 shadow-2xs shrink-0 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase font-black tracking-wider text-slate-500">Revenue Breakdown</span>
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1.5 text-blue-900">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
              Subscriptions (${subscriptionRevenue.toFixed(2)} - {subPercent}%)
            </span>
            <span className="flex items-center gap-1.5 text-amber-900">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Fines (${fineRevenue.toFixed(2)} - {finePercent}%)
            </span>
          </div>
        </div>

        {/* Compact Horizontal Stack Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex shadow-2xs border border-slate-200/60">
          <div
            style={{ width: `${subPercent}%` }}
            className="h-full bg-blue-600 transition-all duration-500"
            title={`Subscriptions: $${subscriptionRevenue.toFixed(2)} (${subPercent}%)`}
          />
          <div
            style={{ width: `${finePercent}%` }}
            className="h-full bg-amber-500 transition-all duration-500"
            title={`Fines: $${fineRevenue.toFixed(2)} (${finePercent}%)`}
          />
        </div>
      </div>

      {/* 4. FILTER & SEARCH TOOLBAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2 sm:p-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        {/* Left: Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search payment ID, payer, or library..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Right: Dropdowns & Reset */}
        <div className="flex items-center gap-2">
          {/* Payment Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="subscription">Subscription</option>
            <option value="fine">Fine Payment</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid / Successful</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed / Unpaid</option>
          </select>

          {/* Library Filter */}
          <select
            value={libraryFilter}
            onChange={(e) => {
              setLibraryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer max-w-[150px] truncate"
          >
            <option value="all">All Libraries</option>
            {libraries.map((lib) => (
              <option key={lib.id} value={lib.name}>
                {lib.name}
              </option>
            ))}
          </select>

          {/* Clear Filters */}
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* 5. MAIN PAYMENTS TABLE CONTAINER (EXPANDS VERTICALLY TO FILL AVAILABLE HEIGHT) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex-1 min-h-0 flex flex-col justify-between h-full">
        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400 font-medium animate-pulse">
            Loading transaction directory...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-8 text-center p-6 space-y-2">
            <DollarSign className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-black text-slate-800">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || libraryFilter !== 'all' || dateFilter !== 'all'
                ? 'No payments match your current filters.'
                : 'No payment records yet.'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || libraryFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search query or resetting filters.'
                : 'Transactions will appear here when subscriptions or fine penalties are processed.'}
            </p>
            {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || libraryFilter !== 'all' || dateFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-2xs"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-auto flex-1 min-h-0 h-full">
            <table className="w-full min-w-full max-w-[800px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider sticky top-0 bg-slate-50 z-10">
                  <th className="py-2.5 px-3.5">Payment</th>
                  <th className="py-2.5 px-3.5">Payer</th>
                  <th className="py-2.5 px-3.5">Type</th>
                  <th className="py-2.5 px-3.5">Library</th>
                  <th className="py-2.5 px-3.5">Amount</th>
                  <th className="py-2.5 px-3.5">Date</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paginatedPayments.map((p) => {
                  const isSub = p.type === 'subscription';
                  const isPaid = p.status === 'paid' || p.status === 'success' || p.status === 'completed';

                  return (
                    <tr key={`${p.type}-${p.id}`} className="hover:bg-amber-50/30 transition-colors">
                      {/* Payment ID Column */}
                      <td className="py-2.5 px-3.5">
                        <span className="font-mono font-bold text-slate-500 text-[11px] block">{p.id}</span>
                        <span className="text-[10px] text-slate-400 block font-medium mt-0.5">{p.method}</span>
                      </td>

                      {/* Payer Column */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8.5 h-8.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center overflow-hidden shrink-0 border border-white shadow-2xs">
                            {p.payerAvatar ? (
                              <img src={p.payerAvatar} alt={p.payerName} className="w-full h-full object-cover" />
                            ) : (
                              p.payerName[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block text-xs leading-tight">{p.payerName}</span>
                            <span className="text-[10px] text-slate-400 block font-medium mt-0.5">{p.payerEmail || 'N/A'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Type Column */}
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                          isSub
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {isSub ? 'Subscription' : 'Fine'}
                        </span>
                      </td>

                      {/* Library Column */}
                      <td className="py-3 px-4 font-extrabold text-slate-800 max-w-[140px] truncate text-xs">
                        {p.libraryName || 'Not provided'}
                      </td>

                      {/* Amount Column */}
                      <td className="py-3 px-4">
                        <span className={`font-black text-sm block ${isPaid ? 'text-slate-900' : p.status === 'pending' ? 'text-amber-800' : 'text-rose-600'}`}>
                          ${p.amount.toFixed(2)}
                        </span>
                      </td>

                      {/* Date Column */}
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {p.date
                          ? new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'N/A'}
                      </td>

                      {/* Status Column */}
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : p.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {isPaid ? 'PAID' : p.status}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-2.5 px-3.5 text-right">
                        <Link
                          to={`/admin/payments/${p.type === 'fine' ? p.id : (p.rawId ?? p.id)}`}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors inline-block cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <AdminPagination
          currentPage={currentPage}
          lastPage={totalPages}
          total={totalItems}
          from={pagination.from}
          to={pagination.to}
          perPage={perPage}
          onPageChange={setCurrentPage}
          onPerPageChange={(value) => { setPerPage(value); setCurrentPage(1); }}
          label="payments"
        />
      </div>
    </div>
  );
}
