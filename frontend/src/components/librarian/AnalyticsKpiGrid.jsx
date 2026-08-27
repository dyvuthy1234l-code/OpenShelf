import { BookOpen, Users, Clock, ArrowLeftRight, DollarSign, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';

export default function AnalyticsKpiGrid({ reports, memberSummary }) {
  const totalBooks = reports?.total_books ?? 0;
  const availableBooks = reports?.available_books ?? 0;

  const totalMembers = reports?.total_members ?? memberSummary?.total_members ?? 0;
  const activeBorrowers = reports?.active_borrowers ?? memberSummary?.active_borrowers ?? 0;

  const pendingRequests = reports?.pending_requests ?? 0;
  const activeBorrowings = reports?.active_borrowings ?? (reports?.borrowed_books ?? 0);
  const overdueBooks = reports?.overdue_books ?? 0;

  const collectedFines = Number(reports?.collected_fines ?? 0);
  const unpaidFines = Number(reports?.unpaid_fines ?? reports?.outstanding_fines ?? 0);

  const kpiData = [
    {
      title: 'Total Books',
      value: totalBooks,
      subtext: `${availableBooks} available`,
      icon: BookOpen,
      gradient: 'from-amber-500 to-amber-600',
      borderHover: 'hover:border-amber-200',
      badgeBg: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    },
    {
      title: 'Total Members',
      value: totalMembers,
      subtext: `${activeBorrowers} active`,
      icon: Users,
      gradient: 'from-blue-500 to-blue-700',
      borderHover: 'hover:border-blue-200',
      badgeBg: 'bg-blue-50 text-blue-800 border border-blue-200/80',
    },
    {
      title: 'Pending Requests',
      value: pendingRequests,
      subtext: 'Awaiting review',
      icon: Clock,
      gradient: pendingRequests > 0 ? 'from-amber-500 to-amber-600' : 'from-slate-400 to-slate-500',
      borderHover: pendingRequests > 0 ? 'hover:border-amber-300' : 'hover:border-slate-300',
      badgeBg: pendingRequests > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold' : 'bg-slate-100 text-slate-700 border border-slate-200',
    },
    {
      title: 'Active Borrowings',
      value: activeBorrowings,
      subtext: overdueBooks > 0 ? `${overdueBooks} overdue` : 'Active loans',
      icon: overdueBooks > 0 ? AlertTriangle : ArrowLeftRight,
      gradient: overdueBooks > 0 ? 'from-rose-500 to-rose-600' : 'from-emerald-500 to-emerald-600',
      borderHover: overdueBooks > 0 ? 'hover:border-rose-200' : 'hover:border-emerald-200',
      badgeBg: overdueBooks > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200/80' : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    },
    {
      title: 'Fine Revenue',
      value: `$${collectedFines.toFixed(2)}`,
      subtext: unpaidFines > 0 ? `$${unpaidFines.toFixed(2)} unpaid` : 'Collected',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-700',
      borderHover: 'hover:border-emerald-300',
      badgeBg: unpaidFines > 0 ? 'bg-amber-50 text-amber-800 border border-amber-200/80' : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    },
  ];

  return (
    <motion.div
      variants={LIST_STAGGER}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 shrink-0"
    >
      {kpiData.map((kpi, idx) => {
        const Icon = kpi.icon;

        return (
          <motion.div
            key={idx}
            variants={LIST_ITEM}
            className={`bg-white border border-slate-200/90 rounded-2xl py-1.5 px-2.5 shadow-2xs hover:shadow-md ${kpi.borderHover} transition-all duration-200 flex flex-col justify-between h-[76px] group`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] uppercase font-black tracking-wider text-slate-500">
                {kpi.title}
              </span>
              <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${kpi.gradient} text-white flex items-center justify-center font-extrabold shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <motion.span
                key={kpi.value}
                initial={{ opacity: 0.4, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight block leading-none"
              >
                {kpi.value}
              </motion.span>
              <motion.span
                key={kpi.subtext}
                initial={{ opacity: 0.4, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`inline-flex items-center gap-1 text-[9.5px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${kpi.badgeBg}`}
              >
                {kpi.subtext}
              </motion.span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
