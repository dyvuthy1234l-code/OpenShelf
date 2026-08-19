export default function StatCard({ title, value, icon: Icon, description, accentColor = 'amber' }) {
  const accentStyles = {
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
    slate: 'bg-slate-100 border-slate-200 text-slate-700',
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-2xl border ${accentStyles[accentColor] || accentStyles.amber} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight block">
          {value !== undefined && value !== null ? value : 0}
        </span>
        {description && (
          <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
