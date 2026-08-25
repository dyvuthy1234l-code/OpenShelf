import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CreditCard, CheckCircle2, Clock, AlertTriangle, XCircle, 
  DollarSign, Search, RotateCcw, Eye, ChevronLeft, ChevronRight, 
  X, Plus, Settings, Calendar, Building2, ShieldCheck,
  Crown, Pencil, Trash2, Archive, ArrowLeft, MoreVertical
} from 'lucide-react';
import adminService from '../../services/adminService';
import { PAGE_MOTION_VARIANTS, LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';
import AdminPagination from '../../components/admin/AdminPagination';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, from: null, to: null });
  const [summary, setSummary] = useState({ total: 0, active: 0, expiring: 0, expired: 0, revenue: 0 });

  // Plans & Subscriptions Modal State
  const [plansModalOpen, setPlansModalOpen] = useState(false);
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [stoppingPlan, setStoppingPlan] = useState(null);
  const [deletingPlan, setDeletingPlan] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [openMenuPlanId, setOpenMenuPlanId] = useState(null);

  // Librarian & Subscription Modals State
  const [librarians, setLibrarians] = useState([]);
  const [addSubscriptionOpen, setAddSubscriptionOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [cancelingSubscription, setCancelingSubscription] = useState(null);
  const [deletingSubscription, setDeletingSubscription] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [formError, setFormError] = useState('');

  // New/Edit Plan Form
  const [planForm, setPlanForm] = useState({
    name: '',
    price: '',
    duration_days: 30,
    description: '',
  });

  // New/Edit Subscription Form
  const [subscriptionForm, setSubscriptionForm] = useState({
    user_id: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: 'active',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [subRes, planRes, libRes] = await Promise.all([
        adminService.getSubscriptions({
          page: currentPage,
          per_page: perPage,
          search: searchQuery,
          status: statusFilter,
          plan: planFilter,
          date: dateFilter,
        }),
        adminService.getPlans(),
        adminService.getLibrarians({ per_page: -1 }),
      ]);
      setSubscriptions(subRes.data || []);
      setPlans(planRes.data || []);
      setLibrarians(libRes.data || []);
      setPagination(subRes.meta || pagination);
      setSummary(subRes.summary || summary);
      return subRes;
    } catch {
      setError('Failed to load subscription records.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, searchQuery, statusFilter, planFilter, dateFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, planFilter, dateFilter]);

  // Derived Subscriptions with Expiry Checks
  const enrichedSubscriptions = useMemo(() => {
    return subscriptions.map((sub) => {
      const endDate = sub.end_date ? new Date(sub.end_date) : null;
      const now = new Date();
      const diffDays = endDate ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : 999;

      let calculatedStatus = sub.status || 'active';
      if (sub.status === 'active' && endDate && diffDays <= 7 && diffDays >= 0) {
        calculatedStatus = 'expiring_soon';
      } else if (sub.status === 'active' && endDate && diffDays < 0) {
        calculatedStatus = 'expired';
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

  // Plan Management Handlers
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
        setActionMessage('New subscription plan created successfully.');
      }
      setTimeout(() => setActionMessage(''), 3500);
      setAddPlanOpen(false);
      setEditingPlan(null);
      setPlanForm({ name: '', price: '', duration_days: 30, description: '' });
      const planRes = await adminService.getPlans();
      setPlans(planRes.data || []);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to save subscription plan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopNewSubscriptionsConfirm = async () => {
    if (!stoppingPlan || actionLoading) return;
    try {
      setActionLoading(true);
      setFormError('');
      await adminService.updatePlan(stoppingPlan.id, {
        name: stoppingPlan.name,
        price: stoppingPlan.price,
        duration_days: stoppingPlan.duration_days,
        description: stoppingPlan.description || '',
        status: 'closed',
      });
      setActionMessage(`New subscriptions stopped for "${stoppingPlan.name}". Existing subscribers remain active.`);
      setTimeout(() => setActionMessage(''), 3500);
      setStoppingPlan(null);
      const planRes = await adminService.getPlans();
      setPlans(planRes.data || []);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to stop new subscriptions.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopenPlan = async (plan) => {
    try {
      setActionLoading(true);
      setFormError('');
      await adminService.updatePlan(plan.id, {
        name: plan.name,
        price: plan.price,
        duration_days: plan.duration_days,
        description: plan.description || '',
        status: 'active',
      });
      setActionMessage(`Plan "${plan.name}" re-opened for new subscriptions.`);
      setTimeout(() => setActionMessage(''), 3500);
      const planRes = await adminService.getPlans();
      setPlans(planRes.data || []);
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to re-open plan.');
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
      const planRes = await adminService.getPlans();
      setPlans(planRes.data || []);
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
      const planRes = await adminService.getPlans();
      setPlans(planRes.data || []);
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
      loadData();
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
      loadData();
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
      loadData();
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
      {/* 1. PAGE HEADER (CLIENT-READY BILLING & ACCESS) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <span className="text-[9px] uppercase font-black tracking-widest text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md inline-block">
            Billing & Access Management
          </span>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight mt-0.5">Subscriptions</h1>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Manage platform subscriptions, plans, and subscription status.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleOpenAddSubscription}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 h-9 sm:h-10 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscription</span>
          </button>
          <button
            onClick={() => setPlansModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 h-9 sm:h-10 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Manage Plans</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs shrink-0">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Error Banner */}
      {actionError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-rose-600 hover:text-rose-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. SUMMARY CARDS (2x2 GRID ON MOBILE, 4-COL ON DESKTOP) */}
      <motion.div variants={LIST_STAGGER} initial="initial" animate="animate" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 shrink-0">
        {/* Card 1: Active Subscriptions */}
        <motion.div variants={LIST_ITEM} className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between h-[82px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Active Subscriptions</span>
            <span className="text-xl font-black text-emerald-950 tracking-tight block leading-tight mt-0.5">{countActive}</span>
            <span className="inline-block text-[9px] font-bold text-emerald-700 mt-0.5">Active plans</span>
          </div>
          <div className="w-7.5 h-7.5 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
        </motion.div>

        {/* Card 2: Expiring Soon */}
        <motion.div variants={LIST_ITEM} className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between h-[82px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Expiring Soon (7 Days)</span>
            <span className="text-xl font-black text-amber-950 tracking-tight block leading-tight mt-0.5">{countExpiring}</span>
            <span className="inline-block text-[9px] font-bold text-amber-700 mt-0.5">Needs renewal</span>
          </div>
          <div className="w-7.5 h-7.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
        </motion.div>

        {/* Card 3: Expired */}
        <motion.div variants={LIST_ITEM} className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between h-[82px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Expired Subscriptions</span>
            <span className="text-xl font-black text-rose-950 tracking-tight block leading-tight mt-0.5">{countExpired}</span>
            <span className="inline-block text-[9px] font-bold text-rose-700 mt-0.5">Inactive plans</span>
          </div>
          <div className="w-7.5 h-7.5 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
        </motion.div>

        {/* Card 4: Subscription Revenue */}
        <motion.div variants={LIST_ITEM} className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between h-[82px]">
          <div>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-500 block">Subscription Revenue</span>
            <span className="text-xl font-black text-slate-900 tracking-tight block leading-tight mt-0.5">${subscriptionRevenue.toFixed(2)}</span>
            <span className="inline-block text-[9px] font-bold text-blue-700 mt-0.5">Plan payments</span>
          </div>
          <div className="w-7.5 h-7.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <DollarSign className="w-3.5 h-3.5 text-blue-600" />
          </div>
        </motion.div>
      </motion.div>

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
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Right: Dropdowns & Reset */}
        <div className="flex items-center gap-2">
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
            <option value="active">Active</option>
            <option value="expiring_soon">Expiring Soon</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer max-w-[150px] truncate"
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
            className="px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">Last 3 Months</option>
            <option value="year">This Year</option>
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

      {/* 4. MAIN SUBSCRIPTIONS TABLE CONTAINER (EXPANDS VERTICALLY TO FILL AVAILABLE HEIGHT) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs flex-1 min-h-0 flex flex-col justify-between h-full">
        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400 font-medium animate-pulse">
            Loading subscription records...
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="py-8 text-center p-6 space-y-2">
            <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto">
              <CreditCard className="w-7 h-7 text-slate-400" />
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
                  <th className="py-2.5 px-3.5">Library</th>
                  <th className="py-2.5 px-3.5">Librarian</th>
                  <th className="py-2.5 px-3.5">Plan</th>
                  <th className="py-2.5 px-3.5">Amount</th>
                  <th className="py-2.5 px-3.5">Start Date</th>
                  <th className="py-2.5 px-3.5">Expiry Date</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
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
                    <tr key={sub.id} className="hover:bg-amber-50/30 transition-colors">
                      {/* Library Column */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8.5 h-8.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center overflow-hidden shrink-0 border border-white shadow-2xs">
                            {sub.user?.library?.image_url ? (
                              <img src={sub.user.library.image_url} alt={libName} className="w-full h-full object-cover" />
                            ) : (
                              libName[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            {sub.user?.library ? (
                              <Link
                                to={`/admin/libraries/${sub.user.library.id}`}
                                className="font-extrabold text-slate-900 hover:text-amber-600 transition-colors block text-xs leading-tight"
                              >
                                {libName}
                              </Link>
                            ) : (
                              <span className="font-extrabold text-slate-900 block text-xs leading-tight">{libName}</span>
                            )}
                            <span className="text-[10px] text-slate-400 block font-medium mt-0.5">
                              {sub.user?.library?.city || 'Location N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Librarian Column */}
                      <td className="py-2.5 px-3.5">
                        <div>
                          {sub.user ? (
                            <Link
                              to={`/admin/librarians/${sub.user.id}`}
                              className="font-bold text-slate-900 hover:text-amber-600 transition-colors block text-xs"
                            >
                              {userName}
                            </Link>
                          ) : (
                            <span className="font-bold text-slate-900 block text-xs">{userName}</span>
                          )}
                          <span className="text-[10px] text-slate-400 block font-medium mt-0.5">{sub.user?.email || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Plan Column */}
                      <td className="py-2.5 px-3.5">
                        <span className="font-extrabold text-slate-900">{planName}</span>
                      </td>

                      {/* Amount Column */}
                      <td className="py-2.5 px-3.5 font-black text-slate-900 tabular-nums">
                        ${amount.toFixed(2)}
                      </td>

                      {/* Start Date Column */}
                      <td className="py-2.5 px-3.5 text-slate-400 text-[11px]">
                        {sub.start_date
                          ? new Date(sub.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'N/A'}
                      </td>

                      {/* Expiry Date Column */}
                      <td className="py-2.5 px-3.5 text-[11px]">
                        <span className={st === 'expiring_soon' ? 'text-amber-700 font-extrabold flex items-center gap-1' : st === 'expired' ? 'text-rose-600 font-bold' : 'text-slate-600 font-medium'}>
                          {st === 'expiring_soon' && <AlertTriangle className="w-3 h-3 shrink-0 text-amber-600" />}
                          {sub.end_date
                            ? new Date(sub.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'Active'}
                        </span>
                        {st === 'expiring_soon' && (
                          <span className="text-[9px] text-amber-600 font-bold block">Expires in {sub.diffDays} days</span>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="py-2.5 px-3.5">
                        <span className={`inline-block text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                          st === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/90'
                            : st === 'expiring_soon'
                            ? 'bg-amber-50 text-amber-700 border-amber-200/90'
                            : st === 'expired'
                            ? 'bg-rose-50 text-rose-700 border-rose-200/90'
                            : 'bg-slate-100 text-slate-600 border-slate-200/90'
                        }`}>
                          {st === 'expiring_soon' ? 'EXPIRING SOON' : (st ? st.toUpperCase() : 'INACTIVE')}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
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
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                            title="Edit Subscription"
                          >
                            Edit
                          </button>

                          {sub.status === 'active' && (
                            <button
                              onClick={() => setCancelingSubscription(sub)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[10px] rounded-lg border border-amber-200 transition-colors cursor-pointer"
                              title="Cancel Subscription"
                            >
                              Cancel
                            </button>
                          )}

                          <Link
                            to={`/admin/subscriptions/${sub.id}`}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="View Subscription Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
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
          label="subscriptions"
        />
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
