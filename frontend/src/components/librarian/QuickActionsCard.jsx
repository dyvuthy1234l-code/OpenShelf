import { Link } from 'react-router-dom';
import { Plus, BookOpen, Tag, Inbox, BarChart3, Zap } from 'lucide-react';

export default function QuickActionsCard() {
  const actions = [
    {
      title: 'Add Book',
      desc: 'Catalogue new volume',
      icon: BookOpen,
      to: '/librarian/books',
      color: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
    },
    {
      title: 'Add Category',
      desc: 'Create subject classification',
      icon: Tag,
      to: '/librarian/categories',
      color: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
    },
    {
      title: 'Borrow Requests',
      desc: 'Review pending requests',
      icon: Inbox,
      to: '/librarian/borrow-requests',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100',
    },
    {
      title: 'View Reports',
      desc: 'Analytics & performance',
      icon: BarChart3,
      to: '/librarian/reports',
      color: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100',
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-700 block">
            Shortcuts
          </span>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quick Actions
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Fast management shortcuts for your library</p>
        </div>
        <Zap className="w-5 h-5 text-amber-500 shrink-0" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <Link
              key={idx}
              to={act.to}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2 group ${act.color}`}
            >
              <div className="flex items-center justify-between">
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
              </div>
              <div>
                <span className="font-extrabold text-xs block text-slate-900">{act.title}</span>
                <span className="text-[10px] text-slate-500 font-medium block truncate">{act.desc}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
