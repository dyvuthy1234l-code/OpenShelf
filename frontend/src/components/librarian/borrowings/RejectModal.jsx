import { useState } from 'react';
import { motion } from 'framer-motion';
import { XCircle, X, RefreshCw, AlertCircle } from 'lucide-react';
import { MODAL_MOTION_VARIANTS, BACKDROP_MOTION_VARIANTS } from '../../../constants/motionTokens';

export default function RejectModal({ borrowing, onConfirm, onClose }) {
  const [reason, setReason] = useState('Book unavailable or reserved.');
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState('');

  if (!borrowing) return null;

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a reason for rejecting the borrowing request.');
      return;
    }

    try {
      setRejecting(true);
      setError('');
      await onConfirm(borrowing.id, reason.trim());
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reject borrowing request.';
      setError(msg);
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        {...BACKDROP_MOTION_VARIANTS}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 cursor-pointer"
      />

      {/* Modal Box */}
      <motion.div
        {...MODAL_MOTION_VARIANTS}
        className="relative z-10 bg-white border border-slate-200 p-6 max-w-md w-full rounded-2xl shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-rose-600 font-extrabold text-base">
            <XCircle className="w-5 h-5" />
            <h3>Reject Borrow Request</h3>
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

        <form onSubmit={handleConfirm} className="space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold">Member</span>
              <span className="font-extrabold text-slate-900">{borrowing.user?.name || 'Member'}</span>
            </div>
            <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60">
              <span className="text-slate-500 font-semibold">Book</span>
              <span className="font-bold text-slate-900 truncate max-w-[180px]">{borrowing.book?.title || 'Book'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="os-label">Rejection Reason <span className="text-rose-500">*</span></label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
              placeholder="Explain why this request is being rejected..."
              className="os-input"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={rejecting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={rejecting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            >
              {rejecting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Rejecting...</span>
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Confirm Rejection</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
