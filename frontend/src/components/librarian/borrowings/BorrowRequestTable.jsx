import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import StatusBadge from '../../common/StatusBadge';
import { TABLE_ROW_VARIANTS, TABLE_ROW_ITEM } from '../../../constants/motionTokens';

export default function BorrowRequestTable({ borrowings = [], onApprove, onReject, onPickup }) {
  return (
    <div className="os-panel overflow-hidden border border-slate-200/90 rounded-2xl bg-white shadow-2xs">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left text-xs align-middle border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
              <th className="py-3.5 px-5">Member</th>
              <th className="py-3.5 px-4">Book</th>
              <th className="py-3.5 px-4">Requested Date</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-center">Availability</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody
            variants={TABLE_ROW_VARIANTS}
            initial="initial"
            animate="animate"
            className="font-medium text-slate-800 divide-y divide-slate-100"
          >
            {borrowings.map((req) => {
              const isAvailable = (req.book?.available_quantity ?? 0) > 0;

              return (
                <motion.tr
                  variants={TABLE_ROW_ITEM}
                  key={req.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Member */}
                  <td className="py-3 px-5 font-bold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 shadow-2xs">
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
                      <div>
                        <span className="truncate max-w-[150px] block" title={req.user?.name || 'Member'}>
                          {req.user?.name || 'Member'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal truncate max-w-[150px] block">
                          {req.user?.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Book */}
                  <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <Link
                          to={`/librarian/borrow-requests/${req.id}`}
                          className="hover:text-amber-600 transition-colors truncate max-w-[200px] block font-extrabold"
                          title={req.book?.title || 'Book Title'}
                        >
                          {req.book?.title || 'Book Title'}
                        </Link>
                        {req.book?.isbn && (
                          <span className="text-[10px] text-slate-400 font-mono">ISBN: {req.book.isbn}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Requested Date */}
                  <td className="py-3 px-4 text-slate-500 font-medium whitespace-nowrap">
                    {req.created_at || req.requested_at
                      ? new Date(req.created_at || req.requested_at).toLocaleDateString()
                      : 'N/A'}
                  </td>

                  {/* Due Date */}
                  <td className="py-3 px-4 text-slate-700 font-bold whitespace-nowrap">
                    {req.due_date ? new Date(req.due_date).toLocaleDateString() : '—'}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={req.status} />
                  </td>

                  {/* Copy Availability */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {req.book?.available_quantity ?? 0} left
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onApprove(req)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-[11px] rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onReject(req)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 font-bold text-[11px] rounded-xl transition-all active:scale-95 cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {req.status === 'approved' && (
                        <button
                          onClick={() => onPickup(req)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-extrabold text-[11px] rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                        >
                          Confirm Pickup
                        </button>
                      )}

                      <Link
                        to={`/librarian/borrow-requests/${req.id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-xl transition-colors cursor-pointer"
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
