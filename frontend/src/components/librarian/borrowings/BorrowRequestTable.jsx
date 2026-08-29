import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import StatusBadge from '../../common/StatusBadge';
import { TABLE_ROW_VARIANTS, TABLE_ROW_ITEM } from '../../../constants/motionTokens';

export default function BorrowRequestTable({ borrowings = [], onApprove, onReject, onPickup }) {
  return (
    <div className="os-panel overflow-hidden border border-slate-200/90 rounded-2xl bg-white shadow-2xs w-full">
      <div className="w-full overflow-x-auto lg:overflow-x-hidden">
        <table className="w-full text-left text-xs align-middle border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
              <th className="py-3.5 px-5 w-[23%]">Member</th>
              <th className="py-3.5 px-4 w-[24%]">Book</th>
              <th className="py-3.5 px-4 w-[14%]">Requested</th>
              <th className="py-3.5 px-4 w-[13%]">Due Date</th>
              <th className="py-3.5 px-4 w-[10%]">Status</th>
              <th className="py-3.5 px-5 w-[16%] text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody
            variants={TABLE_ROW_VARIANTS}
            initial="initial"
            animate="animate"
            className="font-medium text-slate-800 divide-y divide-slate-100"
          >
            {borrowings.map((req) => {
              return (
                <motion.tr
                  variants={TABLE_ROW_ITEM}
                  key={req.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Member with Rectangular Avatar Box (Not Circle) */}
                  <td className="py-3 px-5 font-bold text-slate-900 whitespace-nowrap min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 shadow-xs">
                        {req.user?.avatar_url || req.user?.avatar ? (
                          <img
                            src={req.user.avatar_url || req.user.avatar}
                            alt={req.user?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : req.user?.name ? (
                          req.user.name[0].toUpperCase()
                        ) : (
                          'M'
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="truncate block text-xs font-extrabold text-slate-900 leading-tight" title={req.user?.name || 'Member'}>
                          {req.user?.name || 'Member'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Book */}
                  <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/librarian/borrow-requests/${req.id}`}
                          className="hover:text-amber-600 transition-colors truncate block font-extrabold text-xs"
                          title={req.book?.title || 'Book Title'}
                        >
                          {req.book?.title || 'Book Title'}
                        </Link>
                      </div>
                    </div>
                  </td>

                  {/* Requested Date */}
                  <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap text-xs">
                    {req.created_at || req.requested_at
                      ? new Date(req.created_at || req.requested_at).toLocaleDateString()
                      : 'N/A'}
                  </td>

                  {/* Due Date */}
                  <td className="py-3 px-4 text-slate-800 font-bold whitespace-nowrap text-xs">
                    {req.due_date ? new Date(req.due_date).toLocaleDateString() : '—'}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={req.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onApprove(req)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[11px] rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onReject(req)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 font-bold text-[11px] rounded-lg transition-all active:scale-95 cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {req.status === 'approved' && (
                        <button
                          onClick={() => onPickup(req)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-extrabold text-[11px] rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer"
                        >
                          Pickup
                        </button>
                      )}

                      <Link
                        to={`/librarian/borrow-requests/${req.id}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
