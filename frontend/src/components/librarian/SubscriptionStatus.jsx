import { Link } from 'react-router-dom';
import { CreditCard, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function SubscriptionStatus({ subscription }) {
  if (!subscription) return null;

  const remainingDays = subscription.remaining_days ?? 0;
  const isCloseToExpiry = remainingDays <= 14;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-amber-600" />
          <h4 className="text-sm font-extrabold text-slate-900">Subscription Status</h4>
        </div>

        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Plan Pass</span>
          <span className="font-extrabold text-slate-900">{subscription.plan_name || 'Librarian Pass'}</span>
        </div>

        {subscription.end_date && (
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Valid Until</span>
            <span className="font-bold text-slate-800">{subscription.end_date}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Time Remaining</span>
          <span className={`font-bold ${isCloseToExpiry ? 'text-amber-700' : 'text-slate-900'}`}>
            {remainingDays} Days
          </span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          <span className="text-slate-500 font-medium">Borrow Limit</span>
          <span className="font-bold text-slate-800">
            3 concurrent borrows / member
          </span>
        </div>
      </div>

      {isCloseToExpiry && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded-xl text-[11px] font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Pass expires in {remainingDays} days. Consider renewing early.</span>
        </div>
      )}

      <Link
        to="/librarian/subscription"
        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
      >
        <span>Manage Subscription</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
