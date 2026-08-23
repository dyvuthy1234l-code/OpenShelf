import { Clock, CheckCircle2, AlertTriangle, ArrowLeftRight, XCircle } from 'lucide-react';

export default function BorrowingOverview({ summary = {} }) {
  const items = [
    { label: 'Pending', value: summary.pending || 0, icon: Clock, color: 'bg-amber-500 text-slate-950 border-amber-400' },
    { label: 'Approved', value: summary.approved || 0, icon: CheckCircle2, color: 'bg-blue-500 text-white border-blue-400' },
    { label: 'Borrowed', value: summary.borrowed || 0, icon: ArrowLeftRight, color: 'bg-emerald-500 text-white border-emerald-400' },
    { label: 'Overdue', value: summary.overdue || 0, icon: AlertTriangle, color: 'bg-rose-500 text-white border-rose-400' },
    { label: 'Returned', value: summary.returned || 0, icon: CheckCircle2, color: 'bg-slate-700 text-white border-slate-600' },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Borrowing Activity</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time status breakdown of physical book loans</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {item.label}
                </span>
                <div className={`p-1.5 rounded-xl border text-xs ${item.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <span className="text-2xl font-extrabold text-slate-900">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
