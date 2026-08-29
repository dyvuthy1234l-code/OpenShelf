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
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
          {fmt} (Paid)
        </span>
      );
    }
    if (fineStatus === 'waived') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200">
          {fmt} (Waived)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">
        {fmt} (Unpaid)
      </span>
    );
  };

  return (
    <div className="os-panel overflow-hidden border border-slate-200/90 rounded-2xl bg-white shadow-2xs w-full">
      <div className="w-full overflow-x-auto lg:overflow-x-hidden">
        <table className="w-full text-left text-sm align-middle border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs uppercase tracking-wider text-slate-500 font-bold whitespace-nowrap">
              <th className="py-4 px-5 w-[20%]">Member</th>
              <th className="py-4 px-4 w-[22%]">Book</th>
              <th className="py-4 px-4 w-[12%]">Borrowed</th>
              <th className="py-4 px-4 w-[12%]">Due Date</th>
              <th className="py-4 px-4 w-[10%]">Status</th>
              <th className="py-4 px-4 w-[10%]">Fine</th>
              <th className="py-4 px-5 w-[14%] text-right">Actions</th>
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
                  <td className="py-4 px-5 font-bold text-slate-900 whitespace-nowrap min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
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
                      <div className="min-w-0 flex-1">
                        <span className="truncate block font-extrabold text-sm text-slate-900" title={req.user?.name || 'Member'}>
                          {req.user?.name || 'Member'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Book */}
                  <td className="py-4 px-4 font-semibold text-slate-900 whitespace-nowrap min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/librarian/returns/${req.id}`}
                          className="hover:text-amber-600 transition-colors truncate block font-extrabold text-sm"
                          title={req.book?.title || 'Book Title'}
                        >
                          {req.book?.title || 'Book Title'}
                        </Link>
                      </div>
                    </div>
                  </td>

                  {/* Borrowed Date */}
                  <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap text-sm">
                    {req.borrowed_at || req.picked_up_at
                      ? new Date(req.borrowed_at || req.picked_up_at).toLocaleDateString()
                      : 'N/A'}
                  </td>

                  {/* Due Date */}
                  <td className="py-4 px-4 text-slate-800 font-bold whitespace-nowrap text-sm">
                    {req.due_date ? new Date(req.due_date).toLocaleDateString() : '—'}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <StatusBadge status={req.status} />
                  </td>

                  {/* Fine */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    {getFineBadge(req.fine_amount, req.fine_status)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {canReturn && (
                        <button
                          onClick={() => onConfirmReturn(req)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                        >
                          Return
                        </button>
                      )}

                      <Link
                        to={`/librarian/returns/${req.id}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
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
