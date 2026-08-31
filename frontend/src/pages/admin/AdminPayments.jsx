import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  DollarSign, CreditCard, AlertCircle, CheckCircle2, Clock,
  TrendingUp, Download, Search, RotateCcw, Eye, ChevronLeft,
  ChevronRight, Calendar, Building2, User, BookOpen, Layers, X,
  LayoutGrid, List, MapPin, Receipt
} from 'lucide-react';
import adminService from '../../services/adminService';
import { PAGE_MOTION_VARIANTS, LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';
import AdminPagination from '../../components/admin/AdminPagination';
import { useAdminPayments, useAdminLibraries } from '../../hooks/queries/useAdminQueries';

export default function AdminPayments() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Search, Filters & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all, subscription, fine
  const [statusFilter, setStatusFilter] = useState('all'); // all, paid, pending, failed
  const [libraryFilter, setLibraryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, month, quarter, year
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Query parameters
  const queryParams = useMemo(() => ({
    page: currentPage,
    per_page: perPage,
    search: searchQuery,
    type: typeFilter,
    status: statusFilter,
    library: libraryFilter,
    date: dateFilter,
  }), [currentPage, perPage, searchQuery, typeFilter, statusFilter, libraryFilter, dateFilter]);

  const { data: payRes, isLoading: loading, error: queryErr, refetch: loadData } = useAdminPayments(queryParams);
  const { data: libRes } = useAdminLibraries({ per_page: -1 });

  const data = payRes?.data || {};
  const payments = data.payments || payRes?.payments || [];
  const libraries = libRes?.data || [];
  const pagination = payRes?.meta || { current_page: currentPage, last_page: 1, total: 0, from: null, to: null };
  const summary = payRes?.summary || { total_revenue: 0, subscription_revenue: 0, fine_revenue: 0, pending_count: 0, pending_total: 0 };

  // Prefetch next page for 0ms instant pagination
  useEffect(() => {
    if (pagination.last_page > currentPage) {
      queryClient.prefetchQuery({
        queryKey: ['admin', 'payments', { ...queryParams, page: currentPage + 1 }],
        queryFn: () => adminService.getPayments({ ...queryParams, page: currentPage + 1 }),
        staleTime: 1000 * 60 * 2,
      });
    }
  }, [currentPage, queryParams, pagination.last_page, queryClient]);

  // Normalize payments
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

  // Financial Calculations
  const subscriptionRevenue = Number(summary.subscription_revenue || 0);
  const fineRevenue = Number(summary.fine_revenue || 0);
  const totalRevenue = Number(summary.total_revenue || 0);
  const pendingCount = summary.pending_count || 0;
  const pendingTotal = Number(summary.pending_total || 0);

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="flex-1 flex flex-col min-h-0 space-y-2 overflow-y-auto h-full pr-1 pb-1 font-sans">
      {/* 1. PAGE HEADER (COMPACT EXECUTIVE STRIP) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:px-3.5 sm:py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-black tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md inline-block">
              Financial Management • {totalItems} Transactions
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight mt-0.5">Payments &amp; Revenue</h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Monitor subscription fees, late penalty settlements, and platform revenue streams.
          </p>
        </div>

        {/* Integrated Time Period Selector & Export Report */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/80 text-xs">
            {[
              { key: 'all', label: 'All Time' },
              { key: 'month', label: 'This Month' },
              { key: 'quarter', label: 'Last 3M' },
              { key: 'year', label: 'This Year' },
            ].map((df) => (
              <button
                key={df.key}
                onClick={() => {
                  setDateFilter(df.key);
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
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
            className="inline-flex items-center justify-center gap-1.5 px-3 h-8.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT 4-COLUMN STAT STRIP (Interactive Click-to-Filter) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0">
        {/* Card 1: Total Revenue */}
        <button
          type="button"
          onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            statusFilter === 'all' && typeFilter === 'all' ? 'ring-2 ring-emerald-500/30 border-emerald-500 bg-emerald-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-emerald-800 block truncate">Total Revenue</span>
            <span className="text-base font-black text-emerald-950 leading-none">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Card 2: Subscription Revenue */}
        <button
          type="button"
          onClick={() => { setTypeFilter('subscription'); setStatusFilter('all'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            typeFilter === 'subscription' ? 'ring-2 ring-blue-500/30 border-blue-500 bg-blue-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Plan Subscriptions</span>
            <span className="text-base font-black text-blue-950 leading-none">
              ${subscriptionRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Card 3: Fine Revenue */}
        <button
          type="button"
          onClick={() => { setTypeFilter('fine'); setStatusFilter('all'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            typeFilter === 'fine' ? 'ring-2 ring-amber-500/30 border-amber-500 bg-amber-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Fine Penalties</span>
            <span className="text-base font-black text-amber-950 leading-none">
              ${fineRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Card 4: Pending Payments */}
        <button
          type="button"
          onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-slate-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            statusFilter === 'pending' ? 'ring-2 ring-amber-500/30 border-amber-500 bg-amber-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Pending Verification</span>
            <span className="text-base font-black text-slate-900 leading-none">
              {pendingCount} <span className="text-xs text-slate-500 font-bold">(${pendingTotal.toFixed(2)})</span>
            </span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR */}
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
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Dropdowns, View Switcher & Clear */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Payment Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
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
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid / Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          {/* Library Filter */}
          <select
            value={libraryFilter}
            onChange={(e) => {
              setLibraryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer max-w-[130px] truncate"
          >
            <option value="all">All Libraries</option>
            {libraries.map((lib) => (
              <option key={lib.id} value={lib.name}>
                {lib.name}
              </option>
            ))}
          </select>

          {/* View Switcher: Table vs Grid */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Clear Filters */}
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN PAYMENTS CONTAINER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex-1 min-h-0 flex flex-col justify-between h-full">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium animate-pulse">
            Loading transaction directory...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-12 text-center p-6 space-y-2 flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto border border-amber-200/80">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
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
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-2xs"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          /* TABLE VIEW MODE */
          <div className="overflow-auto flex-1 min-h-0 h-full">
            <table className="w-full text-left text-xs align-middle border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-black uppercase text-[9.5px] tracking-wider sticky top-0 bg-slate-50 z-10">
                  <th className="py-2 px-3.5">Payment Ref</th>
                  <th className="py-2 px-3.5">Payer Account</th>
                  <th className="py-2 px-3.5">Payment Type</th>
                  <th className="py-2 px-3.5">Library Branch</th>
                  <th className="py-2 px-3.5">Amount</th>
                  <th className="py-2 px-3.5">Date</th>
                  <th className="py-2 px-3.5">Status</th>
                  <th className="py-2 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paginatedPayments.map((p) => {
                  const isSub = p.type === 'subscription';
                  const isPaid = p.status === 'paid' || p.status === 'success' || p.status === 'completed';

                  return (
                    <tr
                      key={`${p.type}-${p.id}`}
                      onClick={() => navigate(`/admin/payments/${p.type === 'fine' ? p.id : (p.rawId ?? p.id)}`)}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                    >
                      {/* 1. Payment ID Column */}
                      <td className="py-2 px-3.5">
                        <span className="font-mono font-bold text-slate-900 text-[11px] block">{p.id}</span>
                        <span className="text-[10px] text-slate-400 block font-medium mt-0.5">{p.method}</span>
                      </td>

                      {/* 2. Payer Column */}
                      <td className="py-2 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7.5 h-7.5 rounded-full bg-amber-100 border border-slate-200 text-slate-800 font-black text-xs flex items-center justify-center overflow-hidden shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                            {p.payerAvatar ? (
                              <img src={p.payerAvatar} alt={p.payerName} className="w-full h-full object-cover" />
                            ) : (
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(p.payerName || 'P')}&background=fef3c7&color=b45309&bold=true`}
                                alt={p.payerName}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-black text-slate-900 group-hover:text-amber-700 transition-colors block text-xs leading-tight truncate">
                              {p.payerName}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium mt-0.5 truncate">{p.payerEmail || 'N/A'}</span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Type Column */}
                      <td className="py-2 px-3.5">
                        <span className={`inline-flex items-center gap-1 text-[9px] uppercase font-black px-2 py-0.5 rounded-full border ${
                          isSub
                            ? 'bg-blue-50 text-blue-800 border-blue-200/80'
                            : 'bg-amber-50 text-amber-800 border-amber-200/80'
                        }`}>
                          {isSub ? <CreditCard className="w-2.5 h-2.5 text-blue-600" /> : <Receipt className="w-2.5 h-2.5 text-amber-600" />}
                          {isSub ? 'Subscription' : 'Fine Penalty'}
                        </span>
                      </td>

                      {/* 4. Library Column */}
                      <td className="py-2 px-3.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-bold text-slate-900 truncate max-w-[140px] text-xs">
                            {p.libraryName || 'General Platform'}
                          </span>
                        </div>
                      </td>

                      {/* 5. Amount Column */}
                      <td className="py-2 px-3.5 tabular-nums">
                        <span className={`font-black text-xs block ${isPaid ? 'text-slate-900' : p.status === 'pending' ? 'text-amber-800' : 'text-rose-600'}`}>
                          ${p.amount.toFixed(2)}
                        </span>
                      </td>

                      {/* 6. Date Column */}
                      <td className="py-2 px-3.5 text-slate-500 text-[10.5px] font-semibold tabular-nums">
                        {p.date
                          ? new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'N/A'}
                      </td>

                      {/* 7. Status Column with Live Pulse Dot */}
                      <td className="py-2 px-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
                            : p.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200/90'
                            : 'bg-rose-50 text-rose-700 border-rose-200/90'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isPaid ? 'bg-emerald-500' : p.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          {isPaid ? 'PAID' : (p.status ? p.status.toUpperCase() : 'PENDING')}
                        </span>
                      </td>

                      {/* 8. Actions Column */}
                      <td className="py-2 px-3.5 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/admin/payments/${p.type === 'fine' ? p.id : (p.rawId ?? p.id)}`)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-slate-700 hover:text-amber-900 bg-slate-100 hover:bg-amber-100/70 rounded-lg text-[10.5px] font-black transition-all cursor-pointer shadow-2xs"
                          title="View Details"
                        >
                          <Eye className="w-3 h-3 text-slate-600 group-hover:text-amber-700" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARD GRID VIEW MODE */
          <div className="p-3.5 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {paginatedPayments.map((p) => {
                const isSub = p.type === 'subscription';
                const isPaid = p.status === 'paid' || p.status === 'success' || p.status === 'completed';

                return (
                  <div
                    key={`${p.type}-${p.id}`}
                    onClick={() => navigate(`/admin/payments/${p.type === 'fine' ? p.id : (p.rawId ?? p.id)}`)}
                    className="bg-white border border-slate-200/90 hover:border-amber-400 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top row: Amount + Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[10px] text-slate-400 block">{p.id}</span>
                          <span className="text-base font-black text-slate-900 block mt-0.5">${p.amount.toFixed(2)}</span>
                        </div>

                        <span className={`inline-flex items-center gap-1 text-[8.5px] uppercase font-black px-2 py-0.5 rounded-full border shrink-0 ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : p.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${isPaid ? 'bg-emerald-500' : p.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                          {isPaid ? 'PAID' : p.status}
                        </span>
                      </div>

                      {/* Payer Chip */}
                      <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                        <span className="text-[8.5px] font-black uppercase text-slate-400 block tracking-wider">
                          {isSub ? 'Librarian Subscriber' : 'Member Payer'}
                        </span>
                        <p className="font-black text-slate-900 text-xs truncate">{p.payerName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{p.payerEmail}</p>
                      </div>

                      {/* Library & Date */}
                      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600">
                        <span className="truncate max-w-[120px] font-semibold">{p.libraryName}</span>
                        <span className="text-slate-400 text-[10.5px]">
                          {p.date ? new Date(p.date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/admin/payments/${p.type === 'fine' ? p.id : (p.rawId ?? p.id)}`)}
                        className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-[11px] font-black shadow-2xs transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Clean Pinned Pagination Footer */}
        <div className="shrink-0">
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
            showDetails={true}
          />
        </div>
      </div>
    </motion.div>
  );
}
