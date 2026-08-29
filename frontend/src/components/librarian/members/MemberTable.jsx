import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, BookOpen, AlertTriangle } from 'lucide-react';
import { TABLE_ROW_VARIANTS, TABLE_ROW_ITEM } from '../../../constants/motionTokens';

export default function MemberTable({ members = [] }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">
            Overdue
          </span>
        );
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200">
            Clear
          </span>
        );
    }
  };

  return (
    <div className="os-panel overflow-hidden border border-slate-200/90 rounded-2xl bg-white shadow-2xs w-full">
      <div className="w-full overflow-x-auto lg:overflow-x-hidden">
        <table className="w-full text-left text-xs align-middle border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
              <th className="py-3.5 px-5 w-[26%]">Member</th>
              <th className="py-3.5 px-4 w-[26%]">Email</th>
              <th className="py-3.5 px-4 w-[13%]">Status</th>
              <th className="py-3.5 px-4 w-[12%] text-center">Active Loans</th>
              <th className="py-3.5 px-4 w-[11%] text-center">Overdue</th>
              <th className="py-3.5 px-5 w-[12%] text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody
            variants={TABLE_ROW_VARIANTS}
            initial="initial"
            animate="animate"
            className="font-medium text-slate-800 divide-y divide-slate-100"
          >
            {members.map((m) => (
              <motion.tr
                variants={TABLE_ROW_ITEM}
                key={m.id}
                className="hover:bg-slate-50/80 transition-colors"
              >
                {/* Member with Rectangular Rounded Avatar Box (Not Circle) */}
                <td className="py-3 px-5 font-bold text-slate-900 whitespace-nowrap min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    {m.avatar_url ? (
                      <img
                        src={m.avatar_url}
                        alt={m.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs border border-amber-400">
                        {m.name ? m.name[0].toUpperCase() : 'M'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/librarian/members/${m.id}`}
                        className="hover:text-amber-600 transition-colors truncate block font-extrabold text-xs text-slate-900"
                        title={m.name}
                      >
                        {m.name}
                      </Link>
                    </div>
                  </div>
                </td>

                {/* Email */}
                <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap min-w-0 text-xs">
                  <span className="truncate block" title={m.email}>{m.email}</span>
                </td>

                {/* Status */}
                <td className="py-3 px-4 whitespace-nowrap">
                  {getStatusBadge(m.status)}
                </td>

                {/* Active Loans */}
                <td className="py-3 px-4 text-center font-bold whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 border border-amber-200/80 text-amber-900 rounded-md text-[11px] font-bold">
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span>{m.active_count ?? 0}</span>
                  </span>
                </td>

                {/* Overdue */}
                <td className="py-3 px-4 text-center font-bold whitespace-nowrap">
                  {m.overdue_count > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-[11px] font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{m.overdue_count}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal text-xs">0</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-5 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end">
                    <Link
                      to={`/librarian/members/${m.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[11px] rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </Link>
                  </div>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
