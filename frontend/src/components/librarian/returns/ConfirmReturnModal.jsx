import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, RefreshCw, AlertCircle, DollarSign, BookOpen, User } from 'lucide-react';
import { MODAL_MOTION_VARIANTS, BACKDROP_MOTION_VARIANTS } from '../../../constants/motionTokens';

export default function ConfirmReturnModal({ borrowing, onConfirm, onClose }) {
  const [fineStatus, setFineStatus] = useState('none');
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');

  if (!borrowing) return null;

  // Estimate fine if overdue
  let isOverdue = false;
  let estimatedFine = 0.00;

  if (borrowing.due_date) {
    const due = new Date(borrowing.due_date);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (today > due) {
      isOverdue = true;
      const diffTime = Math.abs(today - due);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const finePerDay = borrowing.library?.fine_per_day ? parseFloat(borrowing.library.fine_per_day) : 0.50;
      estimatedFine = (diffDays * finePerDay).toFixed(2);
    }
  }

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      setError('');
      await onConfirm(borrowing.id, { fine_status: isOverdue ? fineStatus : 'none' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to confirm book return.';
      setError(msg);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          {...BACKDROP_MOTION_VARIANTS}
          className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
        />
        <motion.div
          {...MODAL_MOTION_VARIANTS}
          className="os-panel p-6 max-w-md w-full shadow-xl shadow-navy-950/10 space-y-5"
        >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <h3>Confirm Physical Return</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold leading-relaxed flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Member</span>
            <span className="font-extrabold text-slate-900">{borrowing.user?.name || 'Member'}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span className="text-slate-600 font-semibold">Book Title</span>
            <span className="font-bold text-slate-900 truncate max-w-[180px]">{borrowing.book?.title || 'Book'}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span className="text-slate-600 font-semibold">Due Date</span>
            <span className="font-bold text-slate-900">
              {borrowing.due_date ? new Date(borrowing.due_date).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          {isOverdue && (
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-rose-700 font-bold">
              <span>Overdue Fine ({borrowing.library?.fine_per_day ? `$${borrowing.library.fine_per_day}/day` : '$0.50/day'})</span>
              <span className="text-sm">${estimatedFine}</span>
            </div>
          )}
        </div>

        {isOverdue && (
          <div className="space-y-1">
            <label className="os-label">Initial Fine Payment Status</label>
            <select
              value={fineStatus}
              onChange={(e) => setFineStatus(e.target.value)}
              className="os-input"
            >
              <option value="unpaid">Unpaid (Member owes fine)</option>
              <option value="paid">Paid (Member paid fine on return)</option>
              <option value="waived">Waived (Waive fine for member)</option>
            </select>
          </div>
        )}

        <div className="bg-gold-100/60 border border-gold-200 p-3 rounded-2xl text-[11px] font-semibold text-gold-600 leading-relaxed">
          Has the physical book been returned and inspected? This action increments available library stock.
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={confirming}
            className="os-btn-secondary"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="os-btn-primary"
          >
            {confirming ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Confirming...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm Return</span>
              </>
            )}
          </button>
        </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
