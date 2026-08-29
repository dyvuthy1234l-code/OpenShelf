import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import StatusBadge from '../../common/StatusBadge';
import { TABLE_ROW_VARIANTS, TABLE_ROW_ITEM } from '../../../constants/motionTokens';

export default function ReturnTable({ borrowings = [], onConfirmReturn }) {
  const getFineBadge = (amount, fineStatus) => {
    if (!amount || parseFloat(amount) === 0) {
      return <span className="text-slate-400 font-semibold text-xs">$0.00</span>;
    }
    const fmt = `$${parseFloat(amount).toFixed(2)}`;
    if (fineStatus === 'paid') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
          {fmt} (Paid)
        </span>
      );
    }
    if (fineStatus === 'waived') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200">
          {fmt} (Waived)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">
        {fmt} (Unpaid)
      </span>
    );
  };

  return (
    <div className="os-panel overflow-hidden border border-slate-200/90 rounded-2xl bg-white shadow-2xs w-full">
      <div className="w-full overflow-x-auto lg:overflow-x-hidden">
        <table className="w-full text-left text-xs align-middle border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
              <th className="py-3.5 px-4 w-[22%]">Member</th>
              <th className="py-3.5 px-3 w-[24%]">Book</th>
              <th className="py-3.5 px-3 w-[14%]">Borrowed</th>
              <th className="py-3.5 px-3 w-[14%]">Due Date</th>
              <th className="py-3.5 px-3 w-[10%]">Status</th>
              <th className="py-3.5 px-3 w-[10%]">Fine</th>
              <th className="py-3.5 px-4 w-[6%] text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody
            variants={TABLE_ROW_VARIANTS}
            initial="initial"
            animate="animate"
            className="font-medium text-slate-800 divide-y divide-slate-100"
          >
            {borrowings.map((req) => {
              const canReturn = req.status !== 'returned';

              return (
                <motion.tr
                  variants={TABLE_ROW_ITEM}
                  key={req.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Member */}
                  <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 shadow-2xs">
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
                        <span className="truncate block" title={req.user?.name || 'Member'}>
                          {req.user?.name || 'Member'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Book */}
                  <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/librarian/returns/${req.id}`}
                          className="hover:text-amber-600 transition-colors truncate block font-extrabold"
                          title={req.book?.title || 'Book Title'}
                        >
                          {req.book?.title || 'Book Title'}
                        </Link>
                      </div>
                    </div>
                  </td>

                  {/* Borrowed Date */}
                  <td className="py-3 px-3 text-slate-500 font-medium whitespace-nowrap">
                    {req.borrowed_at || req.picked_up_at
                      ? new Date(req.borrowed_at || req.picked_up_at).toLocaleDateString()
                      : 'N/A'}
                  </td>

                  {/* Due Date */}
                  <td className="py-3 px-3 text-slate-700 font-bold whitespace-nowrap">
                    {req.due_date ? new Date(req.due_date).toLocaleDateString() : '—'}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <StatusBadge status={req.status} />
                  </td>

                  {/* Fine */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getFineBadge(req.fine_amount, req.fine_status)}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {canReturn && (
                        <button
                          onClick={() => onConfirmReturn(req)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-extrabold text-[10px] rounded-lg shadow-2xs transition-all active:scale-95 cursor-pointer"
                        >
                          Return
                        </button>
                      )}

                      <Link
                        to={`/librarian/returns/${req.id}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                      >
                        Review
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
