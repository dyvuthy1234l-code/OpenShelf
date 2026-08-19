import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  DollarSign, Building2, User, BookOpen, CreditCard, 
  ArrowLeft, Calendar, CheckCircle2, Clock, AlertCircle 
} from 'lucide-react';
import adminService from '../../services/adminService';

export default function AdminPaymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPayment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getPayment(id);
      setPayment(res.data || null);
    } catch {
      setError('Failed to load payment record details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPayment();
  }, [loadPayment]);

  if (loading) {
    return (
      <div className="flex-1 p-8 text-center text-xs text-slate-400 font-medium animate-pulse">
        Loading payment transaction...
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="flex-1 p-8 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-extrabold text-slate-900">{error || 'Payment record not found.'}</h3>
        <Link to="/admin/payments" className="inline-block px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer">
          Back to Payments Directory
        </Link>
      </div>
    );
  }

  const isSub = payment.type === 'subscription';
  const isPaid = payment.status === 'paid' || payment.status === 'success' || payment.status === 'completed';

  const user = payment.user;
  const library = payment.library || user?.library;
  const subscription = payment.subscription;
  const book = payment.book;

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 overflow-y-auto lg:overflow-hidden h-full pr-1 pb-1">
      {/* Back Button */}
      <div className="flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => navigate('/admin/payments')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <span>Back to Payments Directory</span>
        </button>
      </div>

      {/* 1. TOP HEADER CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-xl flex items-center justify-center shrink-0 border-2 border-white shadow-xs">
              <DollarSign className="w-7 h-7" />
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-emerald-700 block">
                Financial Transaction
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                  Transaction {payment.id || payment.transaction_id}
                </h1>
                <span className={`inline-block text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                  isSub
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {isSub ? 'Subscription Payment' : 'Fine Penalty Payment'}
                </span>
                <span className={`inline-block text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                  isPaid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {isPaid ? 'PAID' : payment.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Amount Processed: <strong className="text-slate-900 font-black text-sm">${Number(payment.amount || 0).toFixed(2)}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SPECIFIC TYPE DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 min-h-0 lg:overflow-y-auto">
        {/* Payer Information */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Payer Account</span>
            <User className="w-4 h-4 text-blue-600 shrink-0" />
          </div>
          {user ? (
            <div className="space-y-1.5 text-xs">
              <p className="font-extrabold text-slate-900 text-sm">{user.name}</p>
              <p className="text-slate-600 font-medium">Email: {user.email}</p>
              <p className="text-slate-600 font-medium">Phone: {user.phone || 'N/A'}</p>
              {isSub ? (
                <Link to={`/admin/librarians/${user.id}`} className="text-amber-600 hover:underline font-bold text-xs inline-block pt-1">
                  View Librarian Profile →
                </Link>
              ) : (
                <Link to={`/admin/members/${user.id}`} className="text-amber-600 hover:underline font-bold text-xs inline-block pt-1">
                  View Member Profile →
                </Link>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium italic">Payer account details not available.</p>
          )}
        </div>

        {/* Library Branch Information */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Library Branch</span>
            <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
          </div>
          {library ? (
            <div className="space-y-1.5 text-xs">
              <p className="font-extrabold text-slate-900 text-sm">{library.name}</p>
              <p className="text-slate-600 font-medium">City / Location: {library.city || library.address || 'N/A'}</p>
              <Link to={`/admin/libraries/${library.id}`} className="text-amber-600 hover:underline font-bold text-xs inline-block pt-1">
                View Library Details →
              </Link>
            </div>
          ) : (
            <p className="text-xs text-slate-400 font-medium italic">Library record not linked.</p>
          )}
        </div>

        {/* SUBSCRIPTION SPECIFIC DATA */}
        {isSub && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2 md:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Subscription Tier Information</span>
              <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Plan Name</span>
                <p className="font-extrabold text-slate-900">{subscription?.plan?.name || 'Standard Plan'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Payment Method</span>
                <p className="font-extrabold text-slate-900">{payment.payment_method || 'Online Card'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Payment Reference</span>
                <p className="font-mono font-bold text-slate-900">{payment.transaction_id || 'N/A'}</p>
              </div>
            </div>
            {subscription && (
              <div className="pt-1">
                <Link to={`/admin/subscriptions/${subscription.id}`} className="text-xs font-bold text-amber-600 hover:underline">
                  View Full Subscription Record →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* FINE SPECIFIC DATA */}
        {!isSub && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2 md:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Overdue Fine Item Details</span>
              <BookOpen className="w-4 h-4 text-rose-600 shrink-0" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Book Title</span>
                <p className="font-extrabold text-slate-900 truncate">{book?.title || 'Library Book'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Fine Settlement Method</span>
                <p className="font-extrabold text-slate-900">{payment.payment_method || 'Fine Settlement'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-0.5">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Transaction Reference</span>
                <p className="font-mono font-bold text-slate-900">{payment.transaction_id || payment.id}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
