import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

export default function MemberCard({ member }) {
  const isOverdue = member.overdue_count > 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-start gap-3">
        {member.avatar_url ? (
          <img
            src={member.avatar_url}
            alt={member.name}
            className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-sm flex items-center justify-center shrink-0">
            {member.name ? member.name[0].toUpperCase() : 'M'}
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-1">
          <Link
            to={`/librarian/members/${member.id}`}
            className="font-extrabold text-slate-900 hover:text-amber-700 text-sm block truncate"
          >
            {member.name}
          </Link>
          <p className="text-xs text-slate-500 truncate">{member.email}</p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Loans</span>
          <span className="font-extrabold text-slate-900">{member.active_count ?? 0}</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Overdue</span>
          <span className={`font-extrabold ${isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>
            {member.overdue_count ?? 0}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
          isOverdue ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
        }`}>
          {member.status || 'Clear'}
        </span>

        <Link
          to={`/librarian/members/${member.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Details</span>
        </Link>
      </div>
    </div>
  );
}
