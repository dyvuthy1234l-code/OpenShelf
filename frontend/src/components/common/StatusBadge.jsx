import React from 'react';

export default function StatusBadge({ status, label, className = '' }) {
  const normalizedStatus = (status || '').toLowerCase();

  const getStatusConfig = () => {
    switch (normalizedStatus) {
      case 'pending':
        return {
          text: label || 'Pending',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dotBg: 'bg-amber-500',
          pingBg: 'bg-amber-400',
          glowShadow: 'shadow-[0_0_8px_rgba(245,158,11,0.9)]',
          shouldPing: true,
        };
      case 'approved':
        return {
          text: label || 'Approved (Await Pickup)',
          badgeClass: 'bg-sky-50 text-sky-800 border-sky-200/80',
          dotBg: 'bg-sky-500',
          pingBg: 'bg-sky-400',
          glowShadow: 'shadow-[0_0_8px_rgba(14,165,233,0.9)]',
          shouldPing: true,
        };
      case 'borrowed':
      case 'picked_up':
      case 'active':
        return {
          text: label || (normalizedStatus === 'active' ? 'Active' : 'Borrowed'),
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dotBg: 'bg-emerald-500',
          pingBg: 'bg-emerald-400',
          glowShadow: 'shadow-[0_0_8px_rgba(16,185,129,0.9)]',
          shouldPing: true,
        };
      case 'overdue':
        return {
          text: label || 'Overdue',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80',
          dotBg: 'bg-rose-600',
          pingBg: 'bg-rose-500',
          glowShadow: 'shadow-[0_0_10px_rgba(225,29,72,0.95)]',
          shouldPing: true,
        };
      case 'return_requested':
        return {
          text: label || 'Return Requested',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dotBg: 'bg-amber-500',
          pingBg: 'bg-amber-400',
          glowShadow: 'shadow-[0_0_8px_rgba(245,158,11,0.9)]',
          shouldPing: true,
        };
      case 'returned':
        return {
          text: label || 'Returned',
          badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
          dotBg: 'bg-indigo-500',
          pingBg: 'bg-indigo-400',
          glowShadow: 'shadow-[0_0_6px_rgba(99,102,241,0.8)]',
          shouldPing: false,
        };
      case 'rejected':
      case 'inactive':
        return {
          text: label || (normalizedStatus === 'inactive' ? 'Inactive' : 'Rejected'),
          badgeClass: 'bg-rose-50/70 text-rose-700 border-rose-200/60',
          dotBg: 'bg-rose-500',
          pingBg: 'bg-rose-400',
          glowShadow: 'shadow-[0_0_6px_rgba(244,63,94,0.6)]',
          shouldPing: false,
        };
      default:
        return {
          text: label || status,
          badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
          dotBg: 'bg-slate-400',
          pingBg: 'bg-slate-300',
          glowShadow: 'shadow-none',
          shouldPing: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold tracking-wide border uppercase select-none ${config.badgeClass} ${className}`}
    >
      <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
        {config.shouldPing && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.pingBg}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${config.dotBg} ${config.glowShadow}`}
        />
      </span>
      <span>{config.text}</span>
    </span>
  );
}
