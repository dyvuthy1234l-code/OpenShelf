import { Link } from 'react-router-dom';
import { Eye, BookOpen, AlertTriangle } from 'lucide-react';

export default function MemberTable({ members = [] }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Overdue':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">🔴 Overdue</span>;
      case 'Active':
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 Active</span>;
      default:
        return <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200">⚪ Clear</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-4 px-6">Member</th>
              <th className="py-4 px-4">Email</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-center">Active Loans</th>
              <th className="py-4 px-4 text-center">Overdue</th>
              <th className="py-4 px-4">Joined Date</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                {/* Member */}
                <td className="py-4 px-6 font-bold text-slate-900">
                  <div className="flex items-center gap-2.5">
                    {m.avatar_url ? (
                      <img
                        src={m.avatar_url}
                        alt={m.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                        {m.name ? m.name[0].toUpperCase() : 'M'}
                      </div>
                    )}
                    <Link
                      to={`/librarian/members/${m.id}`}
                      className="hover:text-amber-700 transition-colors truncate max-w-[140px] block font-extrabold"
                    >
                      {m.name}
                    </Link>
                  </div>
                </td>

                {/* Email */}
                <td className="py-4 px-4 text-slate-500 font-medium">
                  <span className="truncate max-w-[180px] block">{m.email}</span>
                </td>

                {/* Status */}
                <td className="py-4 px-4">
                  {getStatusBadge(m.status)}
                </td>

                {/* Active Loans */}
                <td className="py-4 px-4 text-center font-bold">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs">
                    <BookOpen className="w-3 h-3 text-amber-600" />
                    {m.active_count ?? 0}
                  </span>
                </td>

                {/* Overdue */}
                <td className="py-4 px-4 text-center font-bold">
                  {m.overdue_count > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold">
                      <AlertTriangle className="w-3 h-3" />
                      {m.overdue_count}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal">0</span>
                  )}
                </td>

                {/* Joined Date */}
                <td className="py-4 px-4 text-slate-500">
                  {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : 'N/A'}
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-right">
                  <Link
                    to={`/librarian/members/${m.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
