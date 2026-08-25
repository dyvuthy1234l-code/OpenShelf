import { useState } from 'react';
import { motion } from 'framer-motion';
import { XCircle, X, RefreshCw, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="os-panel p-6 max-w-md w-full shadow-xl shadow-navy-950/10 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-rose-600 font-extrabold text-base">
            <XCircle className="w-5 h-5" />
            <h3>Reject Borrow Request</h3>
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
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
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
              className="os-btn-secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={rejecting}
              className="os-btn-danger"
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
