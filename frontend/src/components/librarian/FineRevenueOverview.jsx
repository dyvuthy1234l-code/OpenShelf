import { DollarSign, TrendingUp, Calendar, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FineRevenueOverview({ reports }) {
  const collected = Number(reports?.collected_fines ?? 0);
  const revenueToday = Number(reports?.fine_revenue_today ?? 0);
  const revenueMonth = Number(reports?.fine_revenue_this_month ?? 0);
  const unpaid = Number(reports?.unpaid_fines ?? reports?.outstanding_fines ?? 0);
  const waived = Number(reports?.waived_fines ?? 0);
  const overdueCount = reports?.overdue_books ?? 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 lg:p-5 space-y-4 shadow-2xs h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
        <div>
          <span className="text-[9px] uppercase font-extrabold tracking-widest text-emerald-700 block">
            Financial Performance
          </span>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
            Fine Revenue Overview
          </h3>
        </div>
        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
          <DollarSign className="w-4 h-4" />
        </div>
      </div>

      {/* Main Revenue Hero Banner & Sub-metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Main Collected Revenue */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 space-y-1 sm:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
              Total Collected
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-emerald-950 tracking-tight block">
              ${collected.toFixed(2)}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
              Verified paid fines
            </span>
          </div>
        </div>

        {/* Revenue Today */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Collected Today
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight block">
              ${revenueToday.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              Today's receipts
            </span>
          </div>
        </div>

        {/* Revenue This Month */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              This Month
            </span>
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight block">
              ${revenueMonth.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              Monthly collection
            </span>
          </div>
        </div>
      </div>

      {/* Unpaid & Operational Status Bar */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="flex items-center justify-between p-2.5 bg-amber-50/60 border border-amber-200/70 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="text-amber-900 font-bold text-[11px]">Unpaid Fines</span>
          </div>
          <span className="font-extrabold text-amber-900 text-xs">
            ${unpaid.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-rose-50/60 border border-rose-200/70 rounded-xl">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-rose-900 font-bold text-[11px]">Overdue Loans</span>
          </div>
          <span className="font-extrabold text-rose-900 text-xs">
            {overdueCount} {overdueCount === 1 ? 'Book' : 'Books'}
          </span>
        </div>
      </div>
    </div>
  );
}
