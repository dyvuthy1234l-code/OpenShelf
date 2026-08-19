import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, X, RefreshCw, BookOpen, User, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <h3>Approve Borrow Request</h3>
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
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={approving || avail <= 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
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
