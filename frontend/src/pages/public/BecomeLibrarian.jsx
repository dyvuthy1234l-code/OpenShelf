import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Library, CheckCircle2, AlertCircle, ShieldCheck, 
  ArrowRight, RefreshCw, Sparkles, Clock, LogIn, Check, X 
} from 'lucide-react';
import publicService from '../../services/publicService';
import memberService from '../../services/memberService';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../../components/public/LoadingState';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 sm:space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
          <Library className="w-4 h-4" />
          <span>OpenShelf for Library Owners</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 leading-tight">
          Bring Your Physical Library Into the Digital Age
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          OpenShelf equips local community libraries in Cambodia with simple tools to manage book catalogues, handle member borrowing requests, and increase community reading engagement.
        </p>
      </div>

      {/* Active Subscription Status Banner (If User Already Has Active Plan) */}
      {isSubActive && (
        <div className="bg-gradient-to-r from-slate-950 via-navy-950 to-slate-900 text-white border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto shadow-2xl space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-extrabold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>● Active Subscription</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">
              {subscription.plan_name || 'Librarian Access Pass'}
            </h2>
            <p className="text-xs text-slate-300">
              Valid until <strong className="text-amber-400">{subscription.end_date}</strong> ({subscription.remaining_days} days remaining)
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/librarian"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
            >
              <span>Open Librarian Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Alert Messages */}
      {purchaseSuccess && (
        <div className="max-w-3xl mx-auto bg-emerald-50 border border-emerald-200 text-emerald-900 p-5 rounded-2xl text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
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
        <div className="max-w-3xl mx-auto bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{purchaseError}</span>
        </div>
      )}

      {/* Subscription Plans Grid */}
      <div className="space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900">Librarian Access Passes</h2>
          <p className="text-xs text-slate-500">
            {isSubActive
              ? 'Your subscription pass is active. You can review available plan tiers below.'
              : 'Select a pass to activate full librarian access and manage your library.'}
          </p>
        </div>

        {loadingPlans ? (
          <LoadingState message="Loading librarian access passes..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white border rounded-3xl p-8 space-y-6 flex flex-col justify-between shadow-xs transition-all relative overflow-hidden ${
                  isSubActive && subscription.id === plan.id
                    ? 'border-amber-500 ring-2 ring-amber-500/20'
                    : 'border-slate-200/90 hover:border-amber-500/50 hover:shadow-xl'
                }`}
              >
                {/* Popular Badge */}
                {plan.duration_days >= 365 && (
                  <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Best Value
                  </div>
                )}

                <div className="space-y-4">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700">
                    {plan.name}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">${plan.price}</span>
                    <span className="text-xs text-slate-500 font-medium">/ {plan.duration_days} days</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{plan.description}</p>

                  <ul className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{plan.duration_days} Days access duration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Full catalogue, borrowing, & member management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Library analytics & usage reports</span>
                    </li>
                  </ul>
                </div>

                <div>
                  {isSubActive ? (
                    <button
                      onClick={() => navigate('/librarian')}
                      className="w-full min-h-11 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center rounded-xl transition-all shadow-md"
                    >
                      Open Dashboard
                    </button>
                  ) : !isAuthenticated ? (
                    <button
                      onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
                      className="w-full min-h-11 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs text-center rounded-xl transition-all shadow-md shadow-amber-500/20 inline-flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Subscribe</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenCheckout(plan)}
                      className="w-full min-h-11 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs text-center rounded-xl transition-all shadow-md shadow-amber-500/20"
                    >
                      Get Started Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CHECKOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showCheckoutModal && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="subscription-confirm-title"
              className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <h3 id="subscription-confirm-title">Confirm Subscription</h3>
                </div>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  aria-label="Close subscription confirmation"
                  className="flex h-11 w-11 items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Plan</span>
                  <span className="font-extrabold text-amber-700 uppercase tracking-wider">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-600 font-semibold">Access Duration</span>
                  <span className="font-bold text-slate-900">{selectedPlan.duration_days} Days</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                  <span className="text-slate-600 font-semibold">Total Price</span>
                  <span className="font-extrabold text-slate-900 text-base">${selectedPlan.price}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                By confirming, your account role will upgrade to <strong>Librarian</strong> and full workspace access will be activated immediately.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  disabled={purchasing}
                  className="min-h-11 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all"
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirmPurchase}
                  disabled={purchasing}
                  className="inline-flex min-h-11 items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
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
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
