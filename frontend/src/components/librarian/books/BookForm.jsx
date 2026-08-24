import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Upload, X, Check, RefreshCw, AlertCircle 
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FocusLock from 'react-focus-lock';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  author: z.string().min(1, 'Author is required.'),
  category_id: z.coerce.number().min(1, 'Category is required.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  publication_year: z.coerce.number().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'maintenance']).default('active'),
  description: z.string().optional(),
});

export default function BookForm({ initialData = null, categories = [], onSave, onClose }) {
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: initialData?.title || '',
      author: initialData?.author || '',
      category_id: initialData?.category_id || (categories[0]?.id || ''),
      isbn: initialData?.isbn || '',
      publisher: initialData?.publisher || '',
      publication_year: initialData?.publication_year || '',
      quantity: initialData?.quantity ?? 1,
      status: initialData?.status || 'active',
      description: initialData?.description || '',
    },
  });

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(initialData?.cover_image_url || null);
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    if (!initialData?.category_id && categories.length > 0) {
      setValue('category_id', categories[0].id);
    }
  }, [categories, initialData, setValue]);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('cover_image', { type: 'manual', message: 'File format must be JPG, PNG, or WEBP.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('cover_image', { type: 'manual', message: 'Cover image size must be 5MB or less.' });
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setError('cover_image', { type: 'manual', message: null });
  };

  const onSubmit = async (data) => {
    setGeneralError('');

    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });

      if (coverFile) {
        formData.append('cover_image', coverFile);
      }

      await onSave(formData, isEditing ? initialData.id : null);
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        Object.entries(err.response.data.errors).forEach(([key, msgs]) => {
          setError(key, { type: 'server', message: Array.isArray(msgs) ? msgs[0] : msgs });
        });
      } else {
        setGeneralError(err.response?.data?.message || 'Failed to save book.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <FocusLock className="w-full max-w-2xl flex items-center justify-center">
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <h3 className="text-xl font-extrabold text-slate-900">
                {isEditing ? 'Edit Book' : 'Add New Book'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Cover Image Upload */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Book Cover Image</label>
            <div className="relative h-40 bg-slate-100 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all group">
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Cover Preview" className="h-full object-contain" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="px-3 py-1.5 bg-white/90 text-slate-900 font-bold text-xs rounded-xl cursor-pointer shadow-xs">
                      Change Cover
                      <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                    </label>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer text-center p-4">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1 group-hover:text-amber-600 transition-colors" />
                  <span className="text-xs font-bold text-slate-600 block">Upload Cover Image</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">JPG, PNG, WEBP up to 5MB</span>
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
              )}
            </div>
            {errors.cover_image && (
              <p className="text-[11px] font-semibold text-rose-600">{errors.cover_image.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Book Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g. Advanced Laravel Development"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              {errors.title && <p className="text-[11px] font-semibold text-rose-600">{errors.title.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Author <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('author')}
                placeholder="e.g. Jane Doe"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              {errors.author && <p className="text-[11px] font-semibold text-rose-600">{errors.author.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                {...register('category_id')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                {categories.length === 0 && <option value="">No categories created yet</option>}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="text-[11px] font-semibold text-rose-600">{errors.category_id.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Total Quantity / Copies <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                {...register('quantity')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              {errors.quantity && <p className="text-[11px] font-semibold text-rose-600">{errors.quantity.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">ISBN</label>
              <input
                type="text"
                {...register('isbn')}
                placeholder="e.g. 9781234567890"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              {errors.isbn && <p className="text-[11px] font-semibold text-rose-600">{errors.isbn.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Publisher</label>
              <input
                type="text"
                {...register('publisher')}
                placeholder="e.g. OpenShelf Publishing"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              {errors.publisher && <p className="text-[11px] font-semibold text-rose-600">{errors.publisher.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Publication Year</label>
              <input
                type="number"
                {...register('publication_year')}
                placeholder="e.g. 2024"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              {errors.publication_year && <p className="text-[11px] font-semibold text-rose-600">{errors.publication_year.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Status</label>
              <select
                {...register('status')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
              {errors.status && <p className="text-[11px] font-semibold text-rose-600">{errors.status.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Description / Synopsis</label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Brief description or synopsis of the book..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            {errors.description && <p className="text-[11px] font-semibold text-rose-600">{errors.description.message}</p>}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEditing ? 'Updating...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Update Book' : 'Add Book'}</span>
                </>
              )}
            </button>
          </div>
        </form>
        </motion.div>
      </FocusLock>
    </div>
  );
}
