import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Tag, ArrowLeft, Edit3, Trash2, BookOpen, 
  CheckCircle2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Search, X 
} from 'lucide-react';
import librarianService from '../../services/librarianService';

import BookTable from '../../components/librarian/books/BookTable';
import BookCard from '../../components/librarian/books/BookCard';
import CategoryForm from '../../components/librarian/categories/CategoryForm';
import DeleteCategoryModal from '../../components/librarian/categories/DeleteCategoryModal';

export default function CategoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 5, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Book Search & Pagination inside Category
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const ITEMS_PER_PAGE = 5;

  // 1. Debounce book search (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const fetchCategoryDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch category single record
      const catRes = await librarianService.getCategory(id);
      const found = catRes.data || catRes;
      setCategory(found);

      // Fetch books strictly for this category from server with pagination & search
      const bookParams = {
        category_id: id,
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      };
      if (debouncedSearch.trim()) bookParams.search = debouncedSearch.trim();

      const booksRes = await librarianService.getBooks(bookParams);
      setBooks(booksRes.data || []);

      if (booksRes.meta) {
        setMeta(booksRes.meta);
      } else {
        const total = booksRes.data?.length || 0;
        setMeta({ current_page: 1, last_page: 1, per_page: ITEMS_PER_PAGE, total });
      }
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 403) {
        setError('Category not found or you do not have permission to manage this category.');
      } else {
        setError('Unable to load category details from server.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, currentPage, debouncedSearch]);

  useEffect(() => {
    fetchCategoryDetails();
  }, [fetchCategoryDetails]);

  const handleUpdateCategory = async (formData, catId) => {
    try {
      await librarianService.updateCategory(catId, formData);
      setShowEditModal(false);
      setSuccessMessage('Category updated successfully.');
      await fetchCategoryDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category.');
    }
  };

  const handleDeleteCategory = async (catId) => {
    try {
      await librarianService.deleteCategory(catId);
      setShowDeleteModal(false);
      navigate('/librarian/categories');
    } catch (err) {
      setShowDeleteModal(false);
      setError(err.response?.data?.message || 'This category contains active books and cannot be deleted.');
    }
  };

  const totalItems = meta.total ?? books.length;
  const totalPages = meta.last_page ?? 1;
  const startIndex = totalItems > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0;
  const endIndex = Math.min(meta.current_page * meta.per_page, totalItems);

  if (loading && !category) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-pulse">
        <div className="h-64 bg-white rounded-3xl border border-slate-200" />
      </div>
    );
  }

  if (error && !category) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Access Denied</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-700 block">
              Category Details
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate max-w-md">
              {category?.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSuccessMessage('');
              setShowEditModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Category</span>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Category</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold text-xs cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 font-bold text-xs cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Category Summary Header Card */}
      {category && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                <Tag className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold text-slate-900">{category.name}</h2>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border capitalize shrink-0 ${
                    (category.status || 'active') === 'active'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      : 'text-slate-600 bg-slate-100 border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      (category.status || 'active') === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`} />
                    {category.status || 'active'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Created on {category.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Associated Books</span>
              <span className="text-2xl font-extrabold text-amber-700">{category.books_count ?? totalItems}</span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-700">Description</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {category.description || 'No description provided for this category.'}
            </p>
          </div>
        </div>
      )}

      {/* Books in this Category Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Books in this Category</h3>
            <p className="text-xs text-slate-500">Books currently assigned to "{category?.name}" in your library</p>
          </div>

          {/* Search Books inside Category */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books in category..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {books.length === 0 ? (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center text-slate-400 text-xs italic space-y-2 shadow-2xs">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p>{search ? 'No books match your search query.' : 'No books currently assigned to this category.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hidden lg:block">
              <BookTable
                books={books}
                onEdit={() => navigate('/librarian/books')}
                onDelete={() => navigate('/librarian/books')}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
              {books.map((b) => (
                <BookCard
                  key={b.id}
                  book={b}
                  onEdit={() => navigate('/librarian/books')}
                  onDelete={() => navigate('/librarian/books')}
                />
              ))}
            </div>

            {/* Server-Side Book Pagination Bar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs">
              <span className="text-slate-500 font-medium">
                Showing <strong className="text-slate-900">{startIndex}–{endIndex}</strong> of{' '}
                <strong className="text-slate-900">{totalItems}</strong> books
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === page
                          ? 'bg-amber-500 text-slate-950 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages || loading}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Category Modal */}
      {showEditModal && (
        <CategoryForm
          initialData={category}
          onSave={handleUpdateCategory}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Delete Category Modal */}
      {showDeleteModal && (
        <DeleteCategoryModal
          category={category}
          onConfirm={handleDeleteCategory}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
