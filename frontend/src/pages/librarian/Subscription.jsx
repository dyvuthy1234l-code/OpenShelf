import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PAGE_MOTION_VARIANTS } from '../../constants/motionTokens';
import { CreditCard, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, Crown, Star, AlertTriangle, Clock, Lock, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/librarian/common/PageHeader';
import publicService from '../../services/publicService';
import api from '../../api/axios';

export default function SubscriptionPage() {
  const { user, subscription, checkAuth } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await publicService.getSubscriptionPlans();
        setPlans(response.data || response || []);
      } catch (err) {
        setError('Failed to load subscription plans from server.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      await checkAuth();
    } catch (err) {
      setError('Failed to refresh subscription status.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId) => {
    if (processingPlan) return;

    try {
      setProcessingPlan(planId);
      setError(null);
      setSuccessMsg('');
      await api.post('/subscriptions', { plan_id: planId });
      await checkAuth();
      setSuccessMsg('Subscription activated successfully! Librarian workspace access granted.');
      setTimeout(() => {
        navigate('/librarian');
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to process subscription purchase.';
      setError(msg);
    } finally {
      setProcessingPlan(null);
    }
  };

  const isActive = subscription?.status === 'active' && Boolean(subscription?.full_access ?? true);

  const planName = subscription?.plan?.name || subscription?.plan_name || 'Librarian Membership';
  const planPrice = subscription?.plan?.price ?? subscription?.price ?? '0.00';
  const durationDays = subscription?.plan?.duration_days ?? subscription?.duration_days ?? 30;
  const startDate = subscription?.start_date || 'N/A';
  const endDate = subscription?.end_date || 'N/A';

  const calculateRemainingDays = (dateStr) => {
    if (!dateStr) return 0;
    const end = new Date(dateStr);
    if (isNaN(end.getTime())) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const remainingDays = subscription?.remaining_days !== undefined
    ? Math.max(0, subscription.remaining_days)
    : calculateRemainingDays(subscription?.raw_end_date || subscription?.end_date);

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="flex-1 flex flex-col justify-start min-h-0 space-y-5 overflow-y-auto h-full pb-8">
      {/* Page Header */}
      <PageHeader
        eyebrow="Subscription Management"
        title="Librarian Membership Plan"
        description="View your active library subscription details, borrowing limits, and membership status."
      >
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </PageHeader>

      {/* Success Notification Banner */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-2xs shrink-0">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold text-xs">{successMsg}</span>
          </div>
        </div>
      )}

      {/* Error Notification Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-2xs shrink-0">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-bold text-xs">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 font-bold text-xs">Dismiss</button>
        </div>
      )}

      {/* Subscription Status Card */}
      {!isActive ? (
        /* Expired or Inactive Subscription Banner */
        <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-rose-900 font-extrabold text-base">Subscription Expired or Inactive</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 font-extrabold text-[10px] uppercase tracking-wider">
                  EXPIRED
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-1 font-medium">
                Your librarian workspace management access requires an active membership subscription. Please select a plan below.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Active Subscription Card */
        <div className="bg-slate-950 text-white rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl relative overflow-hidden shrink-0 border border-slate-800">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-xl shadow-lg shadow-amber-500/20 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">{planName}</h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Authorized OpenShelf Librarian Membership</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">${parseFloat(planPrice).toFixed(2)}</span>
              <span className="text-xs text-slate-400 font-medium"> / {durationDays} days</span>
            </div>
          </div>

          {/* Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Start Date</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-200">{startDate}</span>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Plan Expiry Date</span>
              <span className="text-base sm:text-lg font-extrabold text-amber-400">{endDate}</span>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Remaining Period</span>
              <span className="text-base sm:text-lg font-extrabold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                {remainingDays} {remainingDays === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Active Subscription Informational Message */}
      {isActive && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 shrink-0">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-extrabold block">Current Subscription Active</span>
            <p className="text-amber-800/90 font-medium">
              Your membership is active until <strong>{endDate}</strong> ({remainingDays} {remainingDays === 1 ? 'day' : 'days'} remaining). Plan renewals or switches can be made once your current subscription term expires.
            </p>
          </div>
        </div>
      )}

      {/* Available Membership Plans Section */}
      <div className="pt-4 border-t border-slate-200/80 space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900">
            {isActive ? 'Available Membership Plans' : 'Select a Membership Plan'}
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Choose a plan tailored to your library capacity and member limits.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <RefreshCw className="w-7 h-7 animate-spin text-amber-500" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-2xl border border-slate-200/80">
            <p className="text-xs text-slate-500 font-bold">No membership plans currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {plans.map((p) => {
              const isSelectedPlan = subscription?.plan_id === p.id || subscription?.plan?.id === p.id;

              return (
                <div
                  key={p.id}
                  className={`bg-white border-2 rounded-2xl p-5 transition-all relative flex flex-col justify-between space-y-5 ${
                    isActive && isSelectedPlan
                      ? 'border-amber-500 shadow-md shadow-amber-500/10'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {isActive && isSelectedPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider px-3 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 fill-slate-950" />
                      <span>Current Active Plan</span>
                    </div>
                  )}

                  <div className="space-y-4 pt-1">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                        <Crown className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-slate-900">${parseFloat(p.price).toFixed(2)}</span>
                        <span className="text-xs text-slate-500 font-medium"> / {p.duration_days} days</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">{p.name}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {p.description || 'Full OpenShelf librarian workspace features & lending controls.'}
                      </p>
                    </div>

                    <ul className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
                      <li className="flex items-center gap-2 text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span><strong>{p.duration_days} Days</strong> Access Duration</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Full Catalogue & Inventory Management</span>
                      </li>
                      <li className="flex items-center gap-2 text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Borrowing & Return Processing</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    {isActive ? (
                      <button
                        disabled
                        className="w-full py-2.5 px-4 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200/60"
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isSelectedPlan ? 'Active Plan' : 'Active Plan in Progress'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(p.id)}
                        disabled={processingPlan === p.id}
                        className="w-full py-2.5 px-4 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {processingPlan === p.id ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Activating Plan...</span>
                          </>
                        ) : (
                          <>
                            <span>Select Plan</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
