import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, X, RefreshCw, AlertCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Solid Dark Overlay Backdrop (No GPU Compositor Backdrop-Blur Issue) */}
      <motion.div
        {...BACKDROP_MOTION_VARIANTS}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 cursor-pointer"
      />

      {/* Solid White High-Contrast Modal Window */}
      <motion.div
        {...MODAL_MOTION_VARIANTS}
        className="relative z-10 bg-white border border-slate-200 p-6 max-w-md w-full rounded-2xl shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <h3>Approve Borrow Request</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold leading-relaxed flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="flex-1">{error}</span>
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
            type="button"
            onClick={onClose}
            disabled={approving}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={approving || avail <= 0}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
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
  );
}
