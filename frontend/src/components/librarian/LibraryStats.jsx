import { BookOpen, CheckCircle2, Users, ArrowLeftRight } from 'lucide-react';

export default function LibraryStats({ booksCount = 0, availableCount = 0, membersCount = 0, activeLoansCount = 0 }) {
  const stats = [
    { label: 'Total Books', value: booksCount, icon: BookOpen, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'Available Copies', value: availableCount, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'Registered Members', value: membersCount, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Active Loans', value: activeLoansCount, icon: ArrowLeftRight, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-400">
                {stat.label}
              </span>
              <div className={`p-2 rounded-xl border ${stat.color} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stat.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
