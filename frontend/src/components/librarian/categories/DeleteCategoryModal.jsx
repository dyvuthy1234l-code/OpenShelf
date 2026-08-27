import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, RefreshCw } from 'lucide-react';
import { MODAL_MOTION_VARIANTS, BACKDROP_MOTION_VARIANTS } from '../../../constants/motionTokens';

export default function DeleteCategoryModal({ category, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!category) return null;

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      setError('');
      await onConfirm(category.id);
    } catch (err) {
      const msg = err.response?.data?.message || 'Cannot delete this category because it contains active books. Move or disable those books first.';
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          {...BACKDROP_MOTION_VARIANTS}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
        />
        <motion.div
          {...MODAL_MOTION_VARIANTS}
          className="relative z-10 bg-white border border-slate-200/90 p-6 max-w-md w-full rounded-2xl shadow-2xl space-y-5"
        >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-rose-600 font-extrabold text-base">
            <AlertTriangle className="w-5 h-5" />
            <h3>Delete Category</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-semibold leading-relaxed">
            {error}
          </div>
        )}

        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <p>Are you sure you want to delete this category?</p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900">
            "{category.name}" ({category.books_count ?? 0} books)
          </div>
          <p className="text-[11px] text-slate-400">
            Categories containing active books cannot be deleted until books are reassigned or removed.
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
    </AnimatePresence>
  );
}
