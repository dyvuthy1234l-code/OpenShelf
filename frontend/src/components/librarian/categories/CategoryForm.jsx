import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, X, Check, RefreshCw, AlertCircle } from 'lucide-react';

export default function CategoryForm({ initialData = null, onSave, onClose }) {
  const isEditing = !!initialData?.id;

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    status: initialData?.status || 'active',
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setErrors({});
    setGeneralError('');

    try {
      await onSave(formData, isEditing ? initialData.id : null);
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setGeneralError(err.response?.data?.message || 'Failed to save category.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="os-panel p-6 sm:p-8 max-w-lg w-full shadow-xl shadow-navy-950/10 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-gold-600" />
            <h3 className="text-xl font-extrabold text-slate-900">
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {generalError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="os-label">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Programming & Software"
              required
              className="os-input"
            />
            {errors.name && (
              <p className="text-[11px] font-semibold text-rose-600">{errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="os-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Provide a brief summary of what books belong in this category..."
              className="os-input"
            />
            {errors.description && (
              <p className="text-[11px] font-semibold text-rose-600">{errors.description[0]}</p>
            )}
          </div>

          {isEditing && (
            <div className="space-y-1">
              <label className="os-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="os-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="os-btn-secondary"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="os-btn-gold"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEditing ? 'Updating...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Update Category' : 'Create Category'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
