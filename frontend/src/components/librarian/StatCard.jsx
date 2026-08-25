export default function StatCard({ title, value, icon: Icon, description, accentColor = 'navy' }) {
  const accentStyles = {
    navy: 'bg-navy-50 border-brand-border text-navy-700',
    gold: 'bg-gold-100 border-gold-200 text-gold-600',
    blue: 'bg-navy-50 border-brand-border text-navy-700',
    emerald: 'bg-emerald-50 border-emerald-200/70 text-emerald-700',
    rose: 'bg-rose-50 border-rose-200/70 text-rose-700',
    slate: 'bg-slate-100 border-slate-200 text-slate-600',
    amber: 'bg-gold-100 border-gold-200 text-gold-600',
  };

  return (
    <div className="os-card p-5 flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${accentStyles[accentColor] || accentStyles.navy}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <span className="text-2xl font-extrabold text-brand-text tracking-tight block">
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
