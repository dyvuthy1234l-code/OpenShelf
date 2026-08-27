import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, BookOpen, AlertTriangle } from 'lucide-react';
import { TABLE_ROW_VARIANTS, TABLE_ROW_ITEM } from '../../../constants/motionTokens';

export default function MemberTable({ members = [] }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Overdue':
        return <span className="os-badge-danger uppercase">🔴 Overdue</span>;
      case 'Active':
        return <span className="os-badge-success uppercase">🟢 Active</span>;
      default:
        return <span className="os-badge-info uppercase">⚪ Clear</span>;
    }
  };

  return (
    <div className="os-panel overflow-hidden w-full">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-full max-w-[800px] text-left text-xs">
          <thead>
            <tr className="bg-navy-50/60 border-b border-brand-border/60 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <th className="py-3 px-6">Member</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Active Loans</th>
              <th className="py-3 px-4 text-center">Overdue</th>
              <th className="py-3 px-4">Joined Date</th>
              <th className="py-3 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody variants={TABLE_ROW_VARIANTS} initial="initial" animate="animate" className="font-medium text-slate-800">
            {members.map((m) => (
              <motion.tr variants={TABLE_ROW_ITEM} key={m.id} className="border-b border-slate-100 hover:bg-navy-50/40 transition-colors">
                {/* Member */}
                <td className="py-3 px-6 font-bold text-slate-900">
                  <div className="flex items-center gap-2.5">
                    {m.avatar_url ? (
                      <img
                        src={m.avatar_url}
                        alt={m.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gold-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                        {m.name ? m.name[0].toUpperCase() : 'M'}
                      </div>
                    )}
                    <Link
                      to={`/librarian/members/${m.id}`}
                      className="hover:text-gold-600 transition-colors truncate max-w-[160px] block font-extrabold"
                    >
                      {m.name}
                    </Link>
                  </div>
                </td>

                {/* Email */}
                <td className="py-3 px-4 text-slate-500 font-medium">
                  <span className="truncate max-w-[220px] block">{m.email}</span>
                </td>

                {/* Status */}
                <td className="py-3 px-4">
                  {getStatusBadge(m.status)}
                </td>

                {/* Active Loans */}
                <td className="py-3 px-4 text-center font-bold">
                  <span className="os-badge-info">
                    <BookOpen className="w-3 h-3 text-gold-600" />
                    {m.active_count ?? 0}
                  </span>
                </td>

                {/* Overdue */}
                <td className="py-3 px-4 text-center font-bold">
                  {m.overdue_count > 0 ? (
                    <span className="os-badge-danger">
                      <AlertTriangle className="w-3 h-3" />
                      {m.overdue_count}
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal">0</span>
                  )}
                </td>

                {/* Joined Date */}
                <td className="py-3 px-4 text-slate-500">
                  {m.joined_at ? new Date(m.joined_at).toLocaleDateString() : 'N/A'}
                </td>

                {/* Actions */}
                <td className="py-3 px-6 text-right">
                  <Link
                    to={`/librarian/members/${m.id}`}
                    className="os-btn-ghost h-8 px-2 text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </Link>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
