import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { 
  CreditCard, CheckCircle2, Clock, AlertTriangle, XCircle, 
  DollarSign, Search, RotateCcw, Eye, ChevronLeft, ChevronRight, 
  X, Plus, Settings, Calendar, Building2, ShieldCheck,
  Crown, Pencil, Trash2, Archive, ArrowLeft, MoreVertical, LayoutGrid, List, MapPin
} from 'lucide-react';
import adminService from '../../services/adminService';
import { PAGE_MOTION_VARIANTS, LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';
import AdminPagination from '../../components/admin/AdminPagination';
import { useAdminSubscriptions, useAdminPlans, useAdminLibrarians } from '../../hooks/queries/useAdminQueries';

export default function AdminSubscriptions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Search, Filters & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Plans & Subscriptions Modal State
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [stoppingPlan, setStoppingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [openMenuPlanId, setOpenMenuPlanId] = useState(null);

  // Librarian & Subscription Modals State
  const [addSubscriptionOpen, setAddSubscriptionOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [cancelingSubscription, setCancelingSubscription] = useState(null);
  const [deletingSubscription, setDeletingSubscription] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [formError, setFormError] = useState('');

  // New/Edit Plan Form State
  const [planForm, setPlanForm] = useState({
    name: '',
    price: '',
    duration_days: 30,
    description: '',
  });

  // New/Edit Subscription Form State
  const [subscriptionForm, setSubscriptionForm] = useState({
    user_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: 'active',
  });

  // Query parameters
  const queryParams = useMemo(() => ({
    page: currentPage,
    per_page: perPage,
    search: searchQuery,
    status: statusFilter,
    plan: planFilter,
    date: dateFilter,
  }), [currentPage, perPage, searchQuery, statusFilter, planFilter, dateFilter]);

  const { data: subRes, isLoading: loading, error: queryErr, refetch: loadData } = useAdminSubscriptions(queryParams);
  const { data: planResData } = useAdminPlans();
  const { data: libResData } = useAdminLibrarians({ per_page: -1 });

  const subscriptions = subRes?.data || [];
  const plans = planResData?.data || planResData || [];
  const librarians = libResData?.data || [];
  const pagination = subRes?.meta || { current_page: currentPage, last_page: 1, total: 0, from: null, to: null };
  const summary = subRes?.summary || { total: 0, active: 0, expiring: 0, expired: 0, revenue: 0 };
  const error = queryErr ? 'Failed to load subscription records.' : null;

  // Prefetch next page for 0ms instant pagination
  useEffect(() => {
    if (pagination.last_page > currentPage) {
      queryClient.prefetchQuery({
        queryKey: ['admin', 'subscriptions', { ...queryParams, page: currentPage + 1 }],
        queryFn: () => adminService.getSubscriptions({ ...queryParams, page: currentPage + 1 }),
        staleTime: 1000 * 60 * 2,
      });
    }
  }, [currentPage, queryParams, pagination.last_page, queryClient]);

  // Derived Subscriptions with Expiry Checks
  const enrichedSubscriptions = useMemo(() => {
    return subscriptions.map((sub) => {
      let calculatedStatus = sub.status || 'active';
      let diffDays = null;

      if (sub.end_date) {
        const end = new Date(sub.end_date);
        const now = new Date();
        const diffMs = end - now;
        diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          calculatedStatus = 'expired';
        } else if (diffDays <= 7 && calculatedStatus === 'active') {
          calculatedStatus = 'expiring_soon';
        }
      }

      return {
        ...sub,
        calculatedStatus,
        diffDays,
      };
    });
  }, [subscriptions]);

  const filteredSubscriptions = enrichedSubscriptions;
  const paginatedSubscriptions = enrichedSubscriptions;
  const totalItems = pagination.total || 0;
  const totalPages = pagination.last_page || 1;

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPlanFilter('all');
    setDateFilter('all');
    setCurrentPage(1);
  };

  // Plan Handlers
  const handleOpenAddPlan = () => {
    setPlanForm({ name: '', price: '', duration_days: 30, description: '' });
    setFormError('');
    setEditingPlan(null);
    setAddPlanOpen(true);
  };

  const handleOpenEditPlan = (plan) => {
    setPlanForm({
      name: plan.name || '',
      price: plan.price || '',
      duration_days: plan.duration_days || 30,
      description: plan.description || '',
    });
    setFormError('');
    setEditingPlan(plan);
    setAddPlanOpen(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (actionLoading) return;

    try {
      setActionLoading(true);
      setFormError('');
      if (editingPlan) {
        await adminService.updatePlan(editingPlan.id, planForm);
        setActionMessage('Subscription plan updated successfully.');
      } else {
        await adminService.createPlan(planForm);
        setActionMessage('New subscription plan created.');
      }
      setTimeout(() => setActionMessage(''), 3500);
      setAddPlanOpen(false);
      setEditingPlan(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save subscription plan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchivePlanDirect = async (plan) => {
    try {
      setActionLoading(true);
      setFormError('');
      await adminService.archivePlan(plan.id);
      setActionMessage(`Subscription plan "${plan.name}" archived.`);
      setTimeout(() => setActionMessage(''), 3500);
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to archive plan.');
      setTimeout(() => setActionError(''), 3500);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePlanConfirm = async () => {
    if (!deletingPlan || actionLoading) return;
    try {
      setActionLoading(true);
      setFormError('');
      setDeleteError('');
      await adminService.deletePlan(deletingPlan.id);
      setActionMessage('Subscription plan deleted successfully.');
      setTimeout(() => setActionMessage(''), 3500);
      setDeletingPlan(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
    } catch (err) {
      const msg = err?.response?.data?.message || 'This plan cannot be deleted because it is linked to existing subscriptions or payment history. Use Archive / Close instead.';
      setDeleteError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Subscription Handlers
  const handleOpenAddSubscription = () => {
    const defaultPlan = plans[0] || {};
    const defaultLib = librarians[0] || {};
    const today = new Date().toISOString().split('T')[0];
    const days = defaultPlan.duration_days || 30;
    const endDate = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

    setSubscriptionForm({
      user_id: defaultLib.id || '',
      plan_id: defaultPlan.id || '',
      start_date: today,
      end_date: endDate,
      status: 'active',
    });
    setFormError('');
    setAddSubscriptionOpen(true);
  };

  const handleSaveSubscription = async (e) => {
    e.preventDefault();
    if (actionLoading) return;

    if (new Date(subscriptionForm.end_date) < new Date(subscriptionForm.start_date)) {
      setFormError('End date cannot be earlier than start date.');
      return;
    }

    try {
      setActionLoading(true);
      setFormError('');

      if (editingSubscription) {
        await adminService.updateSubscription(editingSubscription.id, subscriptionForm);
        setActionMessage('Subscription updated successfully.');
      } else {
        await adminService.createSubscription(subscriptionForm);
        setActionMessage('Subscription created successfully.');
      }

      setTimeout(() => setActionMessage(''), 3500);
      setAddSubscriptionOpen(false);
      setEditingSubscription(null);
      await loadData();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancelSubscription = async () => {
    if (!cancelingSubscription || actionLoading) return;
    try {
      setActionLoading(true);
      await adminService.cancelSubscription(cancelingSubscription.id);
      setActionMessage(`Subscription for "${cancelingSubscription.user?.name || 'Librarian'}" has been cancelled.`);
      setTimeout(() => setActionMessage(''), 3500);
      setCancelingSubscription(null);
      await loadData();
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Failed to cancel subscription.');
      setTimeout(() => setActionError(''), 3500);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDeleteSubscription = async () => {
    if (!deletingSubscription || actionLoading) return;
    try {
      setActionLoading(true);
      await adminService.deleteSubscription(deletingSubscription.id);
      setActionMessage('Subscription record deleted.');
      setTimeout(() => setActionMessage(''), 3500);
      setDeletingSubscription(null);
      await loadData();
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Cannot delete subscription with payment history. Please cancel instead.');
      setTimeout(() => setActionError(''), 3500);
    } finally {
      setActionLoading(false);
    }
  };

  // Summary Card Calculations
  const countActive = summary.active;
  const countExpiring = summary.expiring;
  const countExpired = summary.expired;
  const subscriptionRevenue = summary.revenue;

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="flex-1 flex flex-col min-h-0 space-y-2 overflow-y-auto h-full pr-1 pb-1 font-sans">
      {/* 1. PAGE HEADER (COMPACT EXECUTIVE STRIP) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:px-3.5 sm:py-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-black tracking-widest text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md inline-block">
              Billing & Access • {pagination.total} Records
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight mt-0.5">Library Subscriptions</h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
            Manage library plan subscriptions, renewals, pricing tiers, and active status.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleOpenAddSubscription}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 h-8.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subscription</span>
          </button>
          <button
            onClick={() => setPlansModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 h-8.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Manage Plans</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs shrink-0">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Error Banner */}
      {actionError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-rose-600 hover:text-rose-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. COMPACT 4-COLUMN STAT STRIP (Interactive Click-to-Filter) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            statusFilter === 'active' ? 'ring-2 ring-emerald-500/30 border-emerald-500 bg-emerald-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Active Plans</span>
            <span className="text-base font-black text-emerald-700 leading-none">{countActive}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setStatusFilter('expiring_soon'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            statusFilter === 'expiring_soon' ? 'ring-2 ring-amber-500/30 border-amber-500 bg-amber-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Expiring (7 Days)</span>
            <span className="text-base font-black text-amber-800 leading-none">{countExpiring}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setStatusFilter('expired'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-rose-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            statusFilter === 'expired' ? 'ring-2 ring-rose-500/30 border-rose-500 bg-rose-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Expired Plans</span>
            <span className="text-base font-black text-rose-700 leading-none">{countExpired}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-700 flex items-center justify-center font-bold shrink-0">
            <XCircle className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
          className={`text-left bg-white border rounded-xl p-2 sm:px-3 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between h-[52px] cursor-pointer ${
            statusFilter === 'all' ? 'ring-2 ring-blue-500/30 border-blue-500 bg-blue-50/20' : 'border-slate-200/90'
          }`}
        >
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-black tracking-wider text-slate-500 block truncate">Subscription Revenue</span>
            <span className="text-base font-black text-slate-900 leading-none">${subscriptionRevenue.toFixed(2)}</span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <DollarSign className="w-3.5 h-3.5" />
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
            placeholder="Search by library or librarian..."
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

        {/* Right: Filters, View Toggle & Clear */}
        <div className="flex items-center gap-1.5 flex-wrap">
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
            <option value="active">Active</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer max-w-[130px] truncate"
          >
            <option value="all">All Plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">This Year</option>
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

      {/* 4. MAIN SUBSCRIPTIONS CONTAINER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex-1 min-h-0 flex flex-col justify-between h-full">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 font-medium animate-pulse">
            Loading subscription records...
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="py-12 text-center p-6 space-y-2 flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto border border-amber-200/80">
              <CreditCard className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-sm font-black text-slate-800">
              {searchQuery || statusFilter !== 'all' || planFilter !== 'all' || dateFilter !== 'all'
                ? 'No subscriptions match your current filters.'
                : 'No subscriptions found.'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              {searchQuery || statusFilter !== 'all' || planFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search query or resetting filters.'
                : 'Subscriptions will appear here when librarians purchase plans.'}
            </p>
            {(searchQuery || statusFilter !== 'all' || planFilter !== 'all' || dateFilter !== 'all') && (
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
                  <th className="py-2 px-3.5">Library Branch</th>
                  <th className="py-2 px-3.5">Librarian Account</th>
                  <th className="py-2 px-3.5">Active Plan</th>
                  <th className="py-2 px-3.5">Amount</th>
                  <th className="py-2 px-3.5">Timeline (Start → End)</th>
                  <th className="py-2 px-3.5">Status</th>
                  <th className="py-2 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paginatedSubscriptions.map((sub) => {
                  const libName = sub.user?.library?.name || 'Library Branch';
                  const userName = sub.user?.name || 'Librarian';
                  const planName = sub.plan?.name || 'Standard Plan';
                  const amount = Number(sub.plan?.price || 0);
                  const st = sub.calculatedStatus;

                  return (
                    <tr
                      key={sub.id}
                      onClick={() => navigate(`/admin/subscriptions/${sub.id}`)}
                      className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                    >
                      {/* 1. Library Column */}
                      <td className="py-2 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center overflow-hidden shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                            {sub.user?.library?.image_url ? (
                              <img src={sub.user.library.image_url} alt={libName} className="w-full h-full object-cover" />
                            ) : (
                              libName[0].toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-black text-slate-900 group-hover:text-amber-700 transition-colors block text-xs leading-tight truncate">
                              {libName}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium mt-0.5 truncate">
                              {sub.user?.library?.city || 'Cambodia'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Librarian Column */}
                      <td className="py-2 px-3.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[10px] flex items-center justify-center overflow-hidden shrink-0">
                            {sub.user?.avatar_url || sub.user?.avatar ? (
                              <img src={sub.user.avatar_url || sub.user.avatar} alt={userName} className="w-full h-full object-cover" />
                            ) : (
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=fef3c7&color=b45309&bold=true`}
                                alt={userName}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block text-xs leading-tight truncate">{userName}</span>
                            <span className="text-[10px] text-slate-400 block font-medium truncate">{sub.user?.email || 'N/A'}</span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Plan Column */}
                      <td className="py-2 px-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/80 shadow-2xs">
                          <Crown className="w-3 h-3 text-amber-500" />
                          {planName}
                        </span>
                      </td>

                      {/* 4. Amount Column */}
                      <td className="py-2 px-3.5 font-black text-slate-900 tabular-nums text-xs">
                        ${amount.toFixed(2)}
                      </td>

                      {/* 5. Timeline Column */}
                      <td className="py-2 px-3.5 text-[11px]">
                        <div className="space-y-0.5">
                          <span className="text-slate-600 font-semibold block">
                            {sub.start_date ? new Date(sub.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'} →{' '}
                            <strong className={st === 'expiring_soon' ? 'text-amber-700' : st === 'expired' ? 'text-rose-600' : 'text-slate-900'}>
                              {sub.end_date ? new Date(sub.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Active'}
                            </strong>
                          </span>
                          {st === 'expiring_soon' && (
                            <span className="text-[9px] text-amber-700 font-extrabold flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                              Expires in {sub.diffDays} days
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 6. Status Column with Live Pulse Dot */}
                      <td className="py-2 px-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${
                          st === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
                            : st === 'expiring_soon'
                            ? 'bg-amber-50 text-amber-700 border-amber-200/90'
                            : st === 'expired'
                            ? 'bg-rose-50 text-rose-700 border-rose-200/90'
                            : 'bg-slate-100 text-slate-600 border-slate-200/90'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            st === 'active' ? 'bg-emerald-500' : st === 'expiring_soon' ? 'bg-amber-500' : st === 'expired' ? 'bg-rose-500' : 'bg-slate-400'
                          }`} />
                          {st === 'expiring_soon' ? 'EXPIRING' : (st ? st.toUpperCase() : 'INACTIVE')}
                        </span>
                      </td>

                      {/* 7. Actions Column */}
                      <td className="py-2 px-3.5 text-right relative" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/admin/subscriptions/${sub.id}`)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-slate-700 hover:text-amber-900 bg-slate-100 hover:bg-amber-100/70 rounded-lg text-[10.5px] font-black transition-all cursor-pointer shadow-2xs"
                            title="View Subscription"
                          >
                            <Eye className="w-3 h-3 text-slate-600 group-hover:text-amber-700" />
                            <span>View</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingSubscription(sub);
                              setSubscriptionForm({
                                user_id: sub.user_id,
                                plan_id: sub.plan_id,
                                start_date: sub.start_date ? sub.start_date.split('T')[0] : '',
                                end_date: sub.end_date ? sub.end_date.split('T')[0] : '',
                                status: sub.status || 'active',
                              });
                              setFormError('');
                              setAddSubscriptionOpen(true);
                            }}
                            className="p-1 text-slate-600 hover:text-amber-800 bg-slate-100 hover:bg-amber-100/70 rounded-lg transition-all cursor-pointer shadow-2xs"
                            title="Edit Subscription"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {sub.status === 'active' && (
                            <button
                              onClick={() => setCancelingSubscription(sub)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-black text-[10px] rounded-lg border border-amber-200/80 transition-colors cursor-pointer shadow-2xs"
                              title="Cancel Subscription"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
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
              {paginatedSubscriptions.map((sub) => {
                const libName = sub.user?.library?.name || 'Library Branch';
                const userName = sub.user?.name || 'Librarian';
                const planName = sub.plan?.name || 'Standard Plan';
                const amount = Number(sub.plan?.price || 0);
                const st = sub.calculatedStatus;

                return (
                  <div
                    key={sub.id}
                    onClick={() => navigate(`/admin/subscriptions/${sub.id}`)}
                    className="bg-white border border-slate-200/90 hover:border-amber-400 rounded-2xl p-3.5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top row: Plan + Price + Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-slate-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/80">
                            <Crown className="w-3 h-3 text-amber-600" />
                            {planName}
                          </span>
                          <span className="text-sm font-black text-slate-900 block mt-1">${amount.toFixed(2)}</span>
                        </div>

                        <span className={`inline-flex items-center gap-1 text-[8.5px] uppercase font-black px-2 py-0.5 rounded-full border shrink-0 ${
                          st === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : st === 'expiring_soon'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : st === 'expired'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${st === 'active' ? 'bg-emerald-500' : st === 'expiring_soon' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                          {st === 'expiring_soon' ? 'Expiring' : st}
                        </span>
                      </div>

                      {/* Library & Librarian Chips */}
                      <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-black text-slate-900 text-xs truncate">{libName}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 font-medium truncate">
                          Staff: <strong className="text-slate-800">{userName}</strong>
                        </p>
                      </div>

                      {/* Timeline */}
                      <div className="mt-2 text-[11px] text-slate-600">
                        <span>Expiry: </span>
                        <strong className="text-slate-900">
                          {sub.end_date ? new Date(sub.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Active'}
                        </strong>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/admin/subscriptions/${sub.id}`)}
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
            label="subscriptions"
            showDetails={true}
          />
        </div>
      </div>

      {/* 5. ADD / EDIT SUBSCRIPTION MODAL */}
      {addSubscriptionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-[calc(100vw-24px)] md:w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-blue-700 block">Subscription Management</span>
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                  {editingSubscription ? 'Edit Subscription' : 'Create New Subscription'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setAddSubscriptionOpen(false);
                  setEditingSubscription(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveSubscription} className="space-y-4 text-xs">
              {/* Select Librarian */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Librarian Account *</label>
                {editingSubscription ? (
                  <input
                    type="text"
                    disabled
                    value={editingSubscription.user?.name ? `${editingSubscription.user.name} (${editingSubscription.user.email})` : 'Librarian'}
                    className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold"
                  />
                ) : (
                  <select
                    required
                    value={subscriptionForm.user_id}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, user_id: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">-- Select Librarian --</option>
                    {librarians
                      .filter((lib) => lib.role === 'librarian')
                      .map((lib) => (
                        <option key={lib.id} value={lib.id}>
                          {lib.name} ({lib.email})
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {/* Select Plan */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Subscription Plan *</label>
                <select
                  required
                  value={subscriptionForm.plan_id}
                  onChange={(e) => {
                    const planId = Number(e.target.value);
                    const selPlan = plans.find((p) => p.id === planId);
                    const days = selPlan ? selPlan.duration_days : 30;
                    const startDate = subscriptionForm.start_date || new Date().toISOString().split('T')[0];
                    const endDate = new Date(new Date(startDate).getTime() + days * 86400000).toISOString().split('T')[0];
                    setSubscriptionForm({ ...subscriptionForm, plan_id: planId, end_date: endDate });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">-- Select Plan --</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${Number(p.price).toFixed(2)} - {p.duration_days} days)
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={subscriptionForm.start_date}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, start_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">End Date *</label>
                  <input
                    type="date"
                    required
                    value={subscriptionForm.end_date}
                    onChange={(e) => setSubscriptionForm({ ...subscriptionForm, end_date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Status *</label>
                <select
                  required
                  value={subscriptionForm.status}
                  onChange={(e) => setSubscriptionForm({ ...subscriptionForm, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setAddSubscriptionOpen(false);
                    setEditingSubscription(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl shadow-2xs cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : editingSubscription ? 'Update Subscription' : 'Create Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. CANCEL SUBSCRIPTION CONFIRMATION MODAL */}
      {cancelingSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-[calc(100vw-24px)] md:w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-amber-700">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Cancel Subscription?</h3>
                <p className="text-xs text-slate-500 font-medium">Confirm subscription cancellation</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              This will end the librarian&apos;s active subscription access for{' '}
              <strong className="text-slate-900">{cancelingSubscription.user?.name || 'this librarian'}</strong> according to the existing subscription rules.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs font-bold">
              <button
                onClick={() => setCancelingSubscription(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCancelSubscription}
                disabled={actionLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl shadow-2xs cursor-pointer"
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MANAGE PLANS MODAL */}
      {plansModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/62 backdrop-blur-xs">
          <div className="w-[calc(100vw-24px)] md:w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col font-sans">
            {/* Modal Top Header (Dynamic based on View) */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3.5">
                {addPlanOpen ? (
                  <button
                    type="button"
                    onClick={() => setAddPlanOpen(false)}
                    className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    title="Back to plans list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                    <Crown className="w-5 h-5 text-amber-600" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-black text-slate-900 leading-tight">
                      {addPlanOpen
                        ? editingPlan
                          ? `Edit Plan: ${editingPlan.name}`
                          : 'Create New Subscription Plan'
                        : 'Subscription Plans & Pricing'}
                    </h3>
                    {!addPlanOpen && (
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                        {plans.length} Plans
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    {addPlanOpen
                      ? 'Configure pricing tier details, price in USD, and duration term.'
                      : 'Configure available plan tiers, pricing, and access duration for librarians.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPlansModalOpen(false);
                  setAddPlanOpen(false);
                  setEditingPlan(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message inside modal */}
            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs font-semibold flex items-center justify-between mt-3 shrink-0">
                <span>{formError}</span>
                <button onClick={() => setFormError('')} className="text-rose-600 hover:text-rose-900 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* IF ADD/EDIT FORM IS OPEN */}
            {addPlanOpen ? (
              <form onSubmit={handleSavePlan} className="space-y-4 text-xs animate-fadeIn pt-4 overflow-y-auto pr-1 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Plan Name */}
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-800 text-xs flex items-center justify-between">
                      <span>Plan Name <span className="text-rose-500">*</span></span>
                      <span className="text-[10px] text-slate-400 font-normal">e.g. Starter, Professional, Annual Pass</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                      placeholder="e.g. Starter Membership"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs sm:text-sm"
                    />
                  </div>

                  {/* Price & Duration Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Price Input with $ prefix */}
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-800 text-xs">
                        Price (USD) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 font-black text-slate-400 text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={planForm.price}
                          onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                          placeholder="29.99"
                          className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Duration Days */}
                    <div className="space-y-1.5">
                      <label className="font-extrabold text-slate-800 text-xs">
                        Duration (Days) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={planForm.duration_days}
                        onChange={(e) => setPlanForm({ ...planForm, duration_days: Number(e.target.value) })}
                        placeholder="30"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Duration Buttons */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Quick Duration Presets:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: '30 Days (1 Mo)', days: 30 },
                        { label: '90 Days (3 Mo)', days: 90 },
                        { label: '180 Days (6 Mo)', days: 180 },
                        { label: '365 Days (1 Yr)', days: 365 },
                      ].map((preset) => (
                        <button
                          key={preset.days}
                          type="button"
                          onClick={() => setPlanForm({ ...planForm, duration_days: preset.days })}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            planForm.duration_days === preset.days
                              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-2xs font-black'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 pt-1">
                    <label className="font-extrabold text-slate-800 text-xs">Description (Optional)</label>
                    <textarea
                      rows={3}
                      value={planForm.description}
                      onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                      placeholder="Briefly describe who this plan is tailored for..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Form Footer Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => setAddPlanOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    {actionLoading ? 'Saving Plan...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                  </button>
                </div>
              </form>
            ) : (
              /* PLANS LIST VIEW */
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                {/* Header Action Row */}
                <div className="flex items-center justify-between shrink-0">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    AVAILABLE PLANS ({plans.length})
                  </span>
                  <button
                    onClick={() => {
                      setEditingPlan(null);
                      setPlanForm({ name: '', price: '', duration_days: 30, description: '' });
                      setAddPlanOpen(true);
                    }}
                    className="h-10 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/15 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Plan</span>
                  </button>
                </div>

                {plans.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 my-auto">
                    <Crown className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-bold text-slate-600">No subscription plans configured yet.</p>
                    <p className="text-slate-400 text-[11px]">Click &quot;Create New Plan&quot; to add your first pricing tier.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1 flex-1">
                    {plans.map((plan) => {
                      const status = plan.status || 'active';
                      const isActive = status === 'active';
                      const isClosed = status === 'closed' || status === 'inactive';
                      const isArchived = status === 'archived';
                      const isMenuOpen = openMenuPlanId === plan.id;
                      const subCount = plan.subscriptions_count ?? 0;

                      return (
                        <div
                          key={plan.id}
                          className={`p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all shadow-2xs group relative ${
                            isArchived
                              ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
                              : isClosed
                              ? 'bg-amber-50/20 border-amber-200/80'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 transition-colors ${
                              isArchived
                                ? 'bg-slate-200/70 text-slate-500'
                                : isClosed
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 group-hover:bg-amber-500/10 group-hover:text-amber-600 text-slate-700'
                            }`}>
                              <Crown className="w-5 h-5" />
                            </div>

                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-black text-slate-900 text-sm sm:text-base">{plan.name}</h4>
                                <div className="flex items-center gap-1">
                                  <span className="font-black text-slate-900 text-sm sm:text-base">${Number(plan.price).toFixed(2)}</span>
                                  <span className="font-medium text-slate-500 text-xs">/ {plan.duration_days} Days</span>
                                </div>

                                {/* Status Badges */}
                                {isActive && (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    ACTIVE
                                  </span>
                                )}
                                {isClosed && (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    CLOSED
                                  </span>
                                )}
                                {isArchived && (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                    ARCHIVED
                                  </span>
                                )}
                              </div>

                              {/* Description if present */}
                              {plan.description && (
                                <p className="text-xs text-slate-500 font-medium leading-relaxed truncate max-w-md">
                                  {plan.description}
                                </p>
                              )}

                              {/* Status Subtext & Subscriber count */}
                              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 flex-wrap pt-0.5">
                                {isActive && <span>Available for new subscriptions.</span>}
                                {isClosed && <span>No new subscriptions. Existing subscribers remain active until expiration.</span>}
                                {isArchived && <span>No longer available for new subscriptions. Keep historical references.</span>}
                                {subCount > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="text-slate-600 font-extrabold">{subCount} {subCount === 1 ? 'existing subscriber' : 'existing subscribers'}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center relative">
                            {isActive ? (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingPlan(plan);
                                    setPlanForm({
                                      name: plan.name,
                                      price: plan.price,
                                      duration_days: plan.duration_days,
                                      description: plan.description || '',
                                    });
                                    setAddPlanOpen(true);
                                  }}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => setStoppingPlan(plan)}
                                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
                                >
                                  Stop New Subscriptions
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleReopenPlan(plan)}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
                                >
                                  Re-open
                                </button>

                                <button
                                  onClick={() => {
                                    setEditingPlan(plan);
                                    setPlanForm({
                                      name: plan.name,
                                      price: plan.price,
                                      duration_days: plan.duration_days,
                                      description: plan.description || '',
                                    });
                                    setAddPlanOpen(true);
                                  }}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                                >
                                  Edit
                                </button>
                              </>
                            )}

                            {/* Dropdown Options Button [ ⋮ ] */}
                            <div className="relative">
                              <button
                                onClick={() => setOpenMenuPlanId(isMenuOpen ? null : plan.id)}
                                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                                title="More options"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {isMenuOpen && (
                                <>
                                  <div className="fixed inset-0 z-20" onClick={() => setOpenMenuPlanId(null)} />
                                  <div className="absolute right-0 bottom-full mb-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-xs font-bold text-slate-700">
                                    {!isArchived && (
                                      <button
                                        onClick={() => {
                                          setOpenMenuPlanId(null);
                                          handleArchivePlanDirect(plan);
                                        }}
                                        className="w-full text-left px-3 py-1.5 hover:bg-amber-50 text-amber-800 flex items-center gap-2 cursor-pointer"
                                      >
                                        <Archive className="w-3.5 h-3.5" />
                                        <span>Archive Plan</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => {
                                        setOpenMenuPlanId(null);
                                        setDeletingPlan(plan);
                                        setDeleteError('');
                                      }}
                                      className="w-full text-left px-3 py-1.5 hover:bg-rose-50 text-rose-700 flex items-center gap-2 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete Plan</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. STOP NEW SUBSCRIPTIONS CONFIRMATION MODAL */}
      {stoppingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-[calc(100vw-24px)] md:w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3.5 text-amber-700">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Stop New Subscriptions?</h3>
                <p className="text-xs text-slate-500 font-medium">Close plan to new librarians</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Existing subscribers will remain active until their current subscriptions expire. New Librarians will no longer be able to select this plan.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs font-bold">
              <button
                onClick={() => setStoppingPlan(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStopNewSubscriptionsConfirm}
                disabled={actionLoading}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black rounded-xl shadow-2xs cursor-pointer"
              >
                {actionLoading ? 'Stopping...' : 'Stop New Subscriptions'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. DELETE PLAN CONFIRMATION MODAL */}
      {deletingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-[calc(100vw-24px)] md:w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3.5 text-rose-700">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-bold shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Delete Subscription Plan?</h3>
                <p className="text-xs text-slate-500 font-medium">Confirm permanent deletion</p>
              </div>
            </div>

            {deleteError ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-2xl text-xs font-semibold leading-relaxed">
                {deleteError}
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                This action cannot be undone.
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs font-bold">
              <button
                onClick={() => {
                  setDeletingPlan(null);
                  setDeleteError('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
              >
                {deleteError ? 'Close' : 'Cancel'}
              </button>
              {!deleteError && (
                <button
                  onClick={handleDeletePlanConfirm}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black rounded-xl shadow-2xs cursor-pointer"
                >
                  {actionLoading ? 'Deleting...' : 'Delete Plan'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
