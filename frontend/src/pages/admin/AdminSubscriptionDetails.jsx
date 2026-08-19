import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CreditCard, Building2, User, DollarSign, Calendar, 
  ArrowLeft, CheckCircle2, Clock, AlertTriangle, XCircle, AlertCircle 
} from 'lucide-react';
import adminService from '../../services/adminService';

export default function AdminSubscriptionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getSubscription(id);
      setSubscription(res.data || null);
    } catch {
      setError('Failed to load subscription details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  if (loading) {
    return (
      <div className="flex-1 p-8 text-center text-xs text-slate-400 font-medium animate-pulse">
        Loading subscription record...
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="flex-1 p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-extrabold text-slate-900">{error || 'Subscription record not found.'}</h3>
        <Link to="/admin/subscriptions" className="inline-block px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer">
          Back to Subscriptions Directory
        </Link>
      </div>
    );
  }

  const user = subscription.user;
  const library = user?.library;
  const plan = subscription.plan;
  const payments = subscription.payments || [];

  const endDate = subscription.end_date ? new Date(subscription.end_date) : null;
  const now = new Date();
  const diffDays = endDate ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : 999;

  let calculatedStatus = subscription.status || 'active';
  if (subscription.status === 'active' && endDate && diffDays <= 7 && diffDays >= 0) {
    calculatedStatus = 'expiring_soon';
  } else if (subscription.status === 'active' && endDate && diffDays < 0) {
    calculatedStatus = 'expired';
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 overflow-y-auto lg:overflow-hidden h-full pr-1 pb-1">
      {/* Back Button */}
      <div className="flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => navigate('/admin/subscriptions')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Back to Subscriptions Directory</span>
        </button>
      </div>

      {/* 1. TOP HEADER CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-xl flex items-center justify-center shrink-0 border-2 border-white shadow-xs">
              <CreditCard className="w-7 h-7" />
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-blue-700 block">
                Subscription Profile
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  Subscription #{subscription.id}
                </h1>
                <span className={`inline-block text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                  calculatedStatus === 'active'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : calculatedStatus === 'expiring_soon'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {calculatedStatus === 'expiring_soon' ? 'EXPIRING SOON' : (calculatedStatus ? calculatedStatus.toUpperCase() : 'INACTIVE')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Plan Tier: <strong className="text-slate-900 font-extrabold">{plan?.name || 'Standard Plan'}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GRID INFORMATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0 lg:overflow-y-auto">
        {/* Library Info */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Library Branch Information</span>
            <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
          </div>
          {library ? (
            <div className="space-y-1.5 text-xs">
              <p className="font-extrabold text-slate-900 text-sm">{library.name}</p>
              <p className="text-slate-600 font-medium">Location: {library.city || library.address || 'N/A'}</p>
              <Link to={`/admin/libraries/${library.id}`} className="text-amber-600 hover:underline font-bold text-xs inline-block pt-1">
                View Library Details →
              </Link>
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium italic">No library branch linked to this subscription.</p>
          )}
        </div>

        {/* Librarian Info */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Librarian Account</span>
            <User className="w-4 h-4 text-blue-600 shrink-0" />
          </div>
          {user ? (
            <div className="space-y-1.5 text-xs">
              <p className="font-extrabold text-slate-900 text-sm">{user.name}</p>
              <p className="text-slate-600 font-medium">Email: {user.email}</p>
              <Link to={`/admin/librarians/${user.id}`} className="text-amber-600 hover:underline font-bold text-xs inline-block pt-1">
                View Librarian Profile →
              </Link>
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium italic">No librarian owner linked.</p>
          )}
        </div>

        {/* Plan & Period Info */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Plan & Validity Period</span>
            <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Plan Price:</span>
              <span className="font-black text-slate-900">${Number(plan?.price || 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Duration Days:</span>
              <span className="font-bold text-slate-900">{plan?.duration_days || 30} Days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Start Date:</span>
              <span className="font-bold text-slate-900">
                {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Expiry Date:</span>
              <span className="font-bold text-slate-900">
                {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Records */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Payment Transactions</span>
            <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          {payments.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium italic">No payment transactions recorded for this subscription.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {payments.map((p) => (
                <div key={p.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-900 block">${Number(p.amount).toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400">{p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</span>
                  </div>
                  <span className="inline-block text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {p.status || 'paid'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
