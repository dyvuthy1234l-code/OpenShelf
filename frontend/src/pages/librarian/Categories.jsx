import { useState, useEffect, useMemo } from 'react';
import {
  Tag, Plus, AlertCircle, CheckCircle2, RefreshCw,
  ChevronLeft, ChevronRight, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import librarianService from '../../services/librarianService';
import { PAGE_MOTION_VARIANTS, BANNER_MOTION, MOBILE_GRID_VARIANTS, MOBILE_CARD_VARIANTS } from '../../constants/motionTokens';
import { useLibrarianCategories } from '../../hooks/queries/useLibrarianQueries';

import PageHeader from '../../components/librarian/common/PageHeader';
import { ListSkeleton } from '../../components/librarian/common/Skeleton';
import CategoryTable from '../../components/librarian/categories/CategoryTable';
import CategoryCard from '../../components/librarian/categories/CategoryCard';
import CategoryFilters from '../../components/librarian/categories/CategoryFilters';
import CategoryForm from '../../components/librarian/categories/CategoryForm';
import DeleteCategoryModal from '../../components/librarian/categories/DeleteCategoryModal';

export default function CategoriesPage() {
  const queryClient = useQueryClient();

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Notifications
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  const ITEMS_PER_PAGE = 5;

  // Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page to 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Query parameters
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      per_page: ITEMS_PER_PAGE,
    };
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
    return params;
  }, [currentPage, debouncedSearch]);

  const { data: resData, isLoading: loading, error: queryErr, refetch: fetchCategories } = useLibrarianCategories(queryParams);

  const categories = resData?.data || [];
  const meta = resData?.meta || { current_page: currentPage, last_page: 1, per_page: ITEMS_PER_PAGE, total: categories.length };

  // Prefetch next page for 0ms instant pagination
  useEffect(() => {
    if (meta.last_page > currentPage) {
      queryClient.prefetchQuery({
        queryKey: ['librarian', 'categories', { ...queryParams, page: currentPage + 1 }],
        queryFn: () => librarianService.getCategories({ ...queryParams, page: currentPage + 1 }),
        staleTime: 1000 * 60 * 2,
      });
    }
  }, [currentPage, queryParams, meta.last_page, queryClient]);

  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  // CRUD Handlers
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setShowFormModal(true);
  };

  const handleOpenDeleteModal = (cat) => {
    setDeletingCategory(cat);
  };

  const handleSaveCategory = async (formData, id) => {
    try {
      if (id) {
        await librarianService.updateCategory(id, formData);
        setSuccessMessage('Category updated successfully.');
      } else {
        await librarianService.createCategory(formData);
        setSuccessMessage('Category created successfully.');
      }
      setShowFormModal(false);
      queryClient.invalidateQueries({ queryKey: ['librarian', 'categories'] });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save category.';
      setError(msg);
    }
  };

  const handleDeleteCategoryConfirm = async (id) => {
    try {
      await librarianService.deleteCategory(id);
      setDeletingCategory(null);
      setSuccessMessage('Category deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['librarian', 'categories'] });
    } catch (err) {
      const msg = err.response?.data?.message || 'This category contains books and cannot be deleted.';
      setDeletingCategory(null);
      setError(msg);
    }
  };

  const totalItems = meta.total ?? categories.length;
  const totalPages = meta.last_page ?? 1;
  const startIndex = totalItems > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0;
  const endIndex = Math.min(meta.current_page * meta.per_page, totalItems);

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="flex-1 flex flex-col justify-between min-h-0 space-y-3.5 overflow-y-auto lg:overflow-hidden h-full">
      {/* Header */}
      <PageHeader
        eyebrow="Category Classification"
        title="Categories Management"
        description="Organize your library books into subject classifications and categories."
      >
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-[0.97] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </PageHeader>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div {...BANNER_MOTION} key="success-banner" className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold text-xs cursor-pointer">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div {...BANNER_MOTION} key="error-banner" className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-rose-700 font-bold text-xs cursor-pointer">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Toolbar */}
      <div className="shrink-0">
        <CategoryFilters search={search} onSearchChange={setSearch} />
      </div>

      {/* Content Viewport */}
      {loading ? (
        <ListSkeleton rows={5} className="mt-0" />
      ) : categories.length === 0 ? (
        <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 bg-navy-50 border border-brand-border text-navy-700 rounded-2xl flex items-center justify-center shadow-2xs">
            <Tag className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No categories found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no categories matching your search query.
            </p>
          </div>
          {search ? (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-slate-950 transition-all shadow-2xs mt-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Search</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-2xs transition-all mt-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Category</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col justify-between space-y-3">
          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <CategoryTable
                categories={categories}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            </div>

            {/* Mobile Grid View */}
            <motion.div variants={MOBILE_GRID_VARIANTS} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
              {categories.map((cat) => (
                <motion.div key={cat.id} variants={MOBILE_CARD_VARIANTS}>
                  <CategoryCard
                    category={cat}
                    onEdit={handleOpenEditModal}
                    onDelete={handleOpenDeleteModal}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Server-Side Pagination Controls */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs shrink-0">
            <span className="text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{startIndex}–{endIndex}</strong> of{' '}
              <strong className="text-slate-900">{totalItems}</strong> categories
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-40 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {(() => {
                  const getPages = () => {
                    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
                    const set = new Set([1, totalPages, currentPage]);
                    if (currentPage > 1) set.add(currentPage - 1);
                    if (currentPage < totalPages) set.add(currentPage + 1);
                    const sorted = [...set].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
                    const res = [];
                    sorted.forEach((p, idx) => {
                      if (idx > 0 && p - sorted[idx - 1] > 1) res.push(`ellipsis-${p}`);
                      res.push(p);
                    });
                    return res;
                  };

                  return getPages().map((item) =>
                    typeof item === 'string' ? (
                      <span key={item} className="w-5 text-center text-xs text-slate-400 font-bold">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        disabled={loading}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === item
                            ? 'bg-amber-500 text-slate-950 shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  );
                })()}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-40 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      <AnimatePresence>
        {showFormModal && (
          <CategoryForm
            initialData={editingCategory}
            onSave={handleSaveCategory}
            onClose={() => setShowFormModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Delete Category Modal */}
      <AnimatePresence>
        {deletingCategory && (
          <DeleteCategoryModal
            category={deletingCategory}
            onConfirm={handleDeleteCategoryConfirm}
            onClose={() => setDeletingCategory(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
