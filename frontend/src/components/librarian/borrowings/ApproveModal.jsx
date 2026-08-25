import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, RefreshCw, BookOpen, User, AlertCircle } from 'lucide-react';
import { MODAL_MOTION_VARIANTS, BACKDROP_MOTION_VARIANTS } from '../../../constants/motionTokens';

export default function ApproveModal({ borrowing, onConfirm, onClose }) {
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');

  if (!borrowing) return null;

  const handleConfirm = async () => {
    try {
      setApproving(true);
      setError('');
      await onConfirm(borrowing.id);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to approve request. Please verify book availability and subscription limits.';
      setError(msg);
    } finally {
      setApproving(false);
    }
  };

  const avail = borrowing.book?.available_quantity ?? 0;

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
            <h3>Approve Borrow Request</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
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

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Member</span>
            <span className="font-extrabold text-slate-900">{borrowing.user?.name || 'Member'}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span className="text-slate-600 font-semibold">Book Title</span>
            <span className="font-bold text-slate-900 truncate max-w-[180px]">{borrowing.book?.title || 'Book'}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span className="text-slate-600 font-semibold">Copy Availability</span>
            <span className={`font-extrabold ${avail > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {avail > 0 ? `${avail} copies available` : '0 copies available'}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Approving this request notifies the member to visit your library for physical book pickup.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={approving}
            className="os-btn-secondary"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={approving || avail <= 0}
            className="os-btn-primary"
          >
            {approving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Approving...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Request</span>
              </>
            )}
          </button>
        </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
