import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Library, CheckCircle2, AlertCircle, ShieldCheck, 
  ArrowRight, RefreshCw, Sparkles, Clock, LogIn, Check, X,
  Crown, Calendar, BookOpen, BarChart3, Users, Zap, ExternalLink
} from 'lucide-react';
import publicService from '../../services/publicService';
import memberService from '../../services/memberService';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../../components/public/LoadingState';
import { LIST_STAGGER, LIST_ITEM, REVEAL_VARIANTS, MODAL_MOTION_VARIANTS, BACKDROP_MOTION_VARIANTS } from '../../constants/motionTokens';

export default function BecomeLibrarian() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, subscription, isAuthenticated, checkAuth } = useAuth();

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Purchase & Modal State
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState('');
  const [purchaseError, setPurchaseError] = useState('');

  const isSubActive = subscription && subscription.status === 'active';

  useEffect(() => {
    async function loadPlans() {
      try {
        setLoadingPlans(true);
        const data = await publicService.getSubscriptionPlans();
        setPlans(data.data || []);
      } catch {
        // non-critical fallback
      } finally {
        setLoadingPlans(false);
      }
    }
    loadPlans();
  }, []);

  const handleOpenCheckout = (plan) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setSelectedPlan(plan);
    setPurchaseError('');
    setPurchaseSuccess('');
    setShowCheckoutModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPlan) return;

    try {
      setPurchasing(true);
      setPurchaseError('');
      setPurchaseSuccess('');

      // 1. Send checkout request to backend
      await memberService.subscribePlan(selectedPlan.id);

      // 2. CRITICAL: Refetch authenticated user profile and active subscription state
      await checkAuth();

      setPurchaseSuccess('Subscription activated successfully. Librarian access granted!');
      setShowCheckoutModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete subscription purchase.';
      setPurchaseError(msg);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-48 right-10 w-80 h-80 bg-amber-400/10 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* Hero Section */}
        <motion.div
          variants={LIST_STAGGER}
          initial="initial"
          animate="animate"
          className="text-center max-w-3xl mx-auto space-y-5"
        >
          <motion.div variants={LIST_ITEM} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>OpenShelf for Library Owners</span>
          </motion.div>

          <motion.h1 variants={LIST_ITEM} className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
            Bring Your Physical Library Into the{' '}
            <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              Digital Age
            </span>
          </motion.h1>

          <motion.p variants={LIST_ITEM} className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            OpenShelf equips local community libraries in Cambodia with modern tools to manage book catalogues, handle member borrowing requests, and elevate community reading.
          </motion.p>
        </motion.div>

        {/* Active Subscription Status Banner (Executive Glass Card) */}
        {isSubActive && (
          <motion.div
            {...REVEAL_VARIANTS}
            className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-navy-950 text-white border border-amber-500/30 rounded-3xl p-6 sm:p-10 max-w-4xl mx-auto shadow-2xl overflow-hidden"
          >
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">
              {/* Header inside Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/30 shrink-0">
                    <Crown className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        {subscription.plan_name || 'Librarian Access Pass'}
                      </h2>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full text-xs font-black">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Active Pass</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Full workspace privileges enabled for your library.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/librarian"
                    className="os-btn-gold text-xs shadow-lg shadow-amber-500/20 shrink-0"
                  >
                    <span>Open Librarian Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 space-y-1.5 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Valid Until</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-white">
                    {subscription.end_date || 'Ongoing'}
                  </div>
                  <span className="text-[10px] text-slate-400 block">Subscription expiration date</span>
                </div>

                <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 space-y-1.5 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Time Remaining</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-amber-400">
                    {subscription.remaining_days ?? '—'} Days Left
                  </div>
                  <span className="text-[10px] text-slate-400 block">Automated renewal indicator</span>
                </div>

                <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-4 space-y-1.5 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Workspace Access</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-emerald-400">
                    Full Access Granted
                  </div>
                  <span className="text-[10px] text-slate-400 block">Catalogue, loans, & reports</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Alert Messages */}
        {purchaseSuccess && (
          <div className="max-w-4xl mx-auto bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 p-5 rounded-2xl text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{purchaseSuccess}</span>
            </div>
            <Link
              to="/librarian"
              className="inline-flex min-h-11 items-center px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shrink-0"
            >
              Go to Librarian Dashboard →
            </Link>
          </div>
        )}

        {purchaseError && (
          <div className="max-w-4xl mx-auto bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{purchaseError}</span>
          </div>
        )}

        {/* Value Proposition Feature Grid */}
        <motion.div {...REVEAL_VARIANTS} className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 block">Features & Benefits</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Why Libraries Choose OpenShelf</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-3 shadow-xs hover:border-amber-400/60 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Digital Catalogue</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Add and manage books easily with high-res cover art, category tagging, availability tracking, and ISBN lookups.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-3 shadow-xs hover:border-amber-400/60 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Smart Loan & Borrowing</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Seamlessly review borrowing requests, issue loans, calculate overdue policies, and record returns in seconds.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-3 shadow-xs hover:border-amber-400/60 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Analytics & Reports</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Monitor your library’s growth, most popular books, active reader demographics, and export comprehensive reports.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Subscription Plans Grid */}
        <motion.div {...REVEAL_VARIANTS} className="space-y-8 pt-6 border-t border-slate-200/80 dark:border-slate-800">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 block">Pricing Plans</span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">Librarian Access Passes</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              {isSubActive
                ? 'Your subscription pass is currently active. You can review and upgrade plan tiers anytime below.'
                : 'Select an access pass below to activate your librarian management workspace immediately.'}
            </p>
          </div>

          {loadingPlans ? (
            <LoadingState message="Loading librarian access passes..." />
          ) : (
            <motion.div
              variants={LIST_STAGGER}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-center max-w-5xl mx-auto"
            >
              {plans.map((plan) => {
                const isCurrentActivePlan = isSubActive && (subscription?.plan_id === plan.id || subscription?.id === plan.id);
                const isBestValue = plan.duration_days >= 180;

                return (
                  <motion.div
                    key={plan.id}
                    variants={LIST_ITEM}
                    className={`bg-white dark:bg-slate-900 border rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-xs transition-all relative overflow-hidden ${
                      isCurrentActivePlan
                        ? 'border-amber-500 ring-2 ring-amber-500/30 dark:ring-amber-500/40 shadow-xl'
                        : isBestValue
                        ? 'border-amber-400/80 dark:border-amber-500/60 hover:shadow-2xl hover:border-amber-500'
                        : 'border-slate-200/90 dark:border-slate-800 hover:border-amber-400/60 dark:hover:border-amber-400/60 hover:shadow-xl'
                    }`}
                  >
                    {/* Badge */}
                    {isCurrentActivePlan ? (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Current Plan
                      </div>
                    ) : isBestValue ? (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Best Value
                      </div>
                    ) : null}

                    <div className="space-y-4">
                      <span className="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 block">
                        {plan.name}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">${plan.price}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">/ {plan.duration_days} days</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed min-h-[2.5rem]">
                        {plan.description || 'Full librarian workspace pass for your community library.'}
                      </p>

                      <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300 pt-5 border-t border-slate-100 dark:border-slate-800">
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span><strong>{plan.duration_days} Days</strong> full access duration</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Catalogue, borrowing, & member manager</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Automated return policies & fine tracking</span>
                        </li>
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Real-time library analytics & reports</span>
                        </li>
                      </ul>
                    </div>

                    <div className="pt-2">
                      {isCurrentActivePlan ? (
                        <button
                          onClick={() => navigate('/librarian')}
                          className="w-full min-h-11 py-3.5 bg-slate-950 dark:bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs text-center rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center justify-center gap-2"
                        >
                          <span>Open Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : !isAuthenticated ? (
                        <button
                          onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
                          className="os-btn-gold w-full min-h-11 py-3.5 text-xs text-center rounded-xl shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <LogIn className="w-4 h-4" />
                          <span>Sign In to Subscribe</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenCheckout(plan)}
                          className="os-btn-gold w-full min-h-11 py-3.5 text-xs text-center rounded-xl shadow-md cursor-pointer"
                        >
                          Get Started Now
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* CHECKOUT CONFIRMATION MODAL */}
        <AnimatePresence>
          {showCheckoutModal && selectedPlan && (
            <motion.div {...BACKDROP_MOTION_VARIANTS} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <motion.div
                {...MODAL_MOTION_VARIANTS}
                role="dialog"
                aria-modal="true"
                aria-labelledby="subscription-confirm-title"
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-black text-lg">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 id="subscription-confirm-title">Confirm Subscription</h3>
                  </div>
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    aria-label="Close subscription confirmation"
                    className="flex h-9 w-9 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Plan Selected</span>
                    <span className="font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Access Duration</span>
                    <span className="font-black text-slate-900 dark:text-white">{selectedPlan.duration_days} Days</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Total Amount</span>
                    <span className="font-black text-slate-900 dark:text-white text-lg">${selectedPlan.price}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  By confirming, your account will be upgraded to <strong>Librarian</strong> and full workspace access will be activated immediately.
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    disabled={purchasing}
                    className="min-h-11 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirmPurchase}
                    disabled={purchasing}
                    className="os-btn-gold min-h-11 px-6 py-2.5 text-xs cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {purchasing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Activating...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm & Activate</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
