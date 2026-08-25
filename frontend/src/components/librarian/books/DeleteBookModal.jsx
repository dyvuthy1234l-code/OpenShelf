import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Trash2, X, RefreshCw } from 'lucide-react';
import { MODAL_MOTION_VARIANTS } from '../../../constants/motionTokens';

export default function DeleteBookModal({ book, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!book) return null;

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      setError('');
      await onConfirm(book.id);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete book. Please check if active borrowings exist.';
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        {...MODAL_MOTION_VARIANTS}
        className="os-panel p-6 max-w-md w-full shadow-xl shadow-navy-950/10 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-rose-600 font-extrabold text-base">
            <AlertTriangle className="w-5 h-5" />
            <h3>Delete Book</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <p className="font-bold text-slate-900 text-sm">Delete this book?</p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900">
            "{book.title}" {book.author ? `by ${book.author}` : ''}
          </div>
          <p className="text-xs font-semibold text-rose-600">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={deleting}
            className="os-btn-secondary"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmDelete}
            disabled={deleting}
            className="os-btn-danger"
          >
            {deleting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
