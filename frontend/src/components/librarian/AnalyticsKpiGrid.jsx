import { BookOpen, Users, Clock, ArrowLeftRight, DollarSign, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

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
      title: 'TOTAL BOOKS',
      value: totalBooks,
      subtext: `${availableBooks} copies available`,
      subIcon: CheckCircle2,
      icon: BookOpen,
      iconColor: 'text-amber-700 bg-amber-50 border-amber-200',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      title: 'TOTAL MEMBERS',
      value: totalMembers,
      subtext: `${activeBorrowers} active borrowers`,
      subIcon: Users,
      icon: Users,
      iconColor: 'text-blue-700 bg-blue-50 border-blue-200',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      title: 'PENDING REQUESTS',
      value: pendingRequests,
      subtext: 'Awaiting review',
      subIcon: Clock,
      icon: Clock,
      iconColor: pendingRequests > 0 ? 'text-amber-800 bg-amber-50 border-amber-300' : 'text-slate-600 bg-slate-50 border-slate-200',
      badgeBg: pendingRequests > 0 ? 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold' : 'bg-slate-100 text-slate-700 border-slate-200',
    },
    {
      title: 'ACTIVE BORROWINGS',
      value: activeBorrowings,
      subtext: overdueBooks > 0 ? `${overdueBooks} overdue loans` : 'Active physical loans',
      subIcon: overdueBooks > 0 ? AlertTriangle : ArrowLeftRight,
      icon: ArrowLeftRight,
      iconColor: overdueBooks > 0 ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badgeBg: overdueBooks > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      title: 'FINE REVENUE',
      value: `$${collectedFines.toFixed(2)}`,
      subtext: unpaidFines > 0 ? `$${unpaidFines.toFixed(2)} unpaid` : 'Collected fines',
      subIcon: DollarSign,
      icon: DollarSign,
      iconColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badgeBg: unpaidFines > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 shrink-0">
      {kpiData.map((kpi, idx) => {
        const Icon = kpi.icon;
        const SubIcon = kpi.subIcon;

        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.03 }}
            className="bg-white border border-slate-200/90 rounded-2xl p-3 lg:p-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between h-[108px] group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-400">
                {kpi.title}
              </span>
              <div className={`w-7 h-7 rounded-xl border flex items-center justify-center font-bold shrink-0 ${kpi.iconColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-1.5 pt-0.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {kpi.value}
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${kpi.badgeBg}`}>
                <SubIcon className="w-2.5 h-2.5" />
                <span className="truncate max-w-[100px]">{kpi.subtext}</span>
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
