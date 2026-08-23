import { BookOpen, ArrowLeftRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ReportStats({ reportData }) {
  const totalBooks = reportData?.total_books ?? 0;
  const availableCopies = reportData?.available_books ?? 0;

  const activeBorrowings = reportData?.active_borrowings ?? (reportData?.borrowed_books ?? 0);
  const returnedBooks = reportData?.returned_books ?? 0;
  const overdueBooks = reportData?.overdue_books ?? 0;

  const stats = [
    {
      title: 'TOTAL BOOKS',
      value: totalBooks,
      subtext: `${availableCopies.toLocaleString()} available copies`,
      subIcon: BookOpen,
      icon: BookOpen,
      iconBg: 'bg-amber-50 border-amber-200/80 text-amber-700',
      badgeBg: 'bg-amber-50 text-amber-900 border-amber-200/80',
    },
    {
      title: 'ACTIVE BORROWINGS',
      value: activeBorrowings,
      subtext: 'Currently borrowed',
      subIcon: ArrowLeftRight,
      icon: ArrowLeftRight,
      iconBg: 'bg-blue-50 border-blue-200/80 text-blue-700',
      badgeBg: 'bg-blue-50 text-blue-900 border-blue-200/80',
    },
    {
      title: 'COMPLETED RETURNS',
      value: returnedBooks,
      subtext: 'Returned during period',
      subIcon: CheckCircle2,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 border-emerald-200/80 text-emerald-700',
      badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200/80',
    },
    {
      title: 'OVERDUE BOOKS',
      value: overdueBooks,
      subtext: 'Overdue loans',
      subIcon: AlertTriangle,
      icon: AlertTriangle,
      iconBg: 'bg-rose-50 border-rose-200/80 text-rose-700',
      badgeBg: 'bg-rose-50 text-rose-900 border-rose-200/80',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        const SubIcon = item.subIcon;

        return (
          <div
            key={idx}
            className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-3 h-[115px] shrink-0 transition-all hover:border-slate-300"
          >
            <div className="space-y-1.5 min-w-0 flex-1">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block truncate">
                {item.title}
              </span>
              <span className="text-2.5xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none block">
                {item.value.toLocaleString()}
              </span>
              <div className="pt-0.5">
                <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${item.badgeBg}`}>
                  <SubIcon className="w-3 h-3 shrink-0" />
                  <span className="truncate">{item.subtext}</span>
                </span>
              </div>
            </div>

            <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center font-bold shrink-0 shadow-2xs ${item.iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

