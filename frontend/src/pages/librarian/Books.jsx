import { useState, useEffect, useCallback } from 'react';
import {
  Plus, AlertCircle, CheckCircle2, RefreshCw,
  ChevronLeft, ChevronRight, Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import librarianService from '../../services/librarianService';
import { queryClient } from '../../query/queryClient';
import useDebounce from '../../hooks/useDebounce';
import { PAGE_MOTION_VARIANTS, BANNER_MOTION, MOBILE_GRID_VARIANTS, MOBILE_CARD_VARIANTS } from '../../constants/motionTokens';

import PageHeader from '../../components/librarian/common/PageHeader';
import { ListSkeleton } from '../../components/librarian/common/Skeleton';
import BookTable from '../../components/librarian/books/BookTable';
import BookCard from '../../components/librarian/books/BookCard';
import BookFilters from '../../components/librarian/books/BookFilters';
import BookForm from '../../components/librarian/books/BookForm';
import DeleteBookModal from '../../components/librarian/books/DeleteBookModal';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Server Pagination & Filters State
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [categoryId, setCategoryId] = useState('');
  const [availability, setAvailability] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals & Notifications
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch Categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await librarianService.getCategories();
        setCategories(catRes.data || []);
      } catch {
        // Non-critical background load
      }
    };
    fetchCategories();
  }, []);

  // Server-side Fetch Books function
  const fetchBooks = useCallback(async (page = 1, overrides = {}) => {
    try {
      setLoading(true);
      setError(null);

      const s = overrides.search !== undefined ? overrides.search : debouncedSearch;
      const c = overrides.categoryId !== undefined ? overrides.categoryId : categoryId;
      const a = overrides.availability !== undefined ? overrides.availability : availability;

      const params = {
        page,
        per_page: perPage,
      };

      if (s.trim()) params.search = s.trim();
      if (c) params.category_id = c;
      if (a === 'available') params.available_only = true;
      if (a === 'out_of_stock' || a === 'unavailable') params.available_only = false;

      const res = await librarianService.getBooks(params);

      const booksData = res.data || [];
      const meta = res.meta || {};

      setBooks(booksData);
      setTotal(meta.total ?? booksData.length);
      setLastPage(meta.last_page ?? 1);
      setCurrentPage(meta.current_page ?? page);
    } catch (err) {
      setError('Unable to load book catalogue. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, categoryId, availability, perPage]);

  // Refetch when debounced search term changes
  useEffect(() => {
    fetchBooks(1);
  }, [debouncedSearch]);

  // Filter change handlers
  const handleSearchChange = (val) => {
    setSearchInput(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val) => {
    setCategoryId(val);
    setCurrentPage(1);
    fetchBooks(1, { categoryId: val });
  };

  const handleAvailabilityChange = (val) => {
    setAvailability(val);
    setCurrentPage(1);
    fetchBooks(1, { availability: val });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setCategoryId('');
    setAvailability('all');
    setCurrentPage(1);
    fetchBooks(1, { search: '', categoryId: '', availability: 'all' });
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > lastPage || page === currentPage) return;
    setCurrentPage(page);
    fetchBooks(page);
  };

  const hasActiveFilters = !!searchInput || !!categoryId || availability !== 'all';

  // Pagination display calculation
  const startIndex = total > 0 ? (currentPage - 1) * perPage + 1 : 0;
  const endIndex = total > 0 ? Math.min(currentPage * perPage, total) : 0;

  // Ellipsis pagination helper
  const getPaginationRange = () => {
    if (lastPage <= 7) {
      return Array.from({ length: lastPage }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', lastPage];
    }
    if (currentPage >= lastPage - 3) {
      return [1, '...', lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', lastPage];
  };

  // CRUD Actions
  const handleOpenAddModal = () => {
    setEditingBook(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setShowFormModal(true);
  };

  const handleOpenDeleteModal = (book) => {
    setDeletingBook(book);
  };

  const handleSaveBook = async (formData, id) => {
    if (id) {
      // Edit
      await librarianService.updateBook(id, formData);
      setSuccessMessage('Book updated successfully.');
      setShowFormModal(false);
      queryClient.invalidateQueries({ queryKey: ['books'] });
      await fetchBooks(currentPage);
    } else {
      // Add
      await librarianService.createBook(formData);
      setSuccessMessage('Book created successfully.');
      setShowFormModal(false);
      setSearchInput('');
      setCategoryId('');
      setAvailability('all');
      setCurrentPage(1);
      queryClient.invalidateQueries({ queryKey: ['books'] });
      await fetchBooks(1, { search: '', categoryId: '', availability: 'all' });
    }
  };

  const handleDeleteBookConfirm = async (id) => {
    await librarianService.deleteBook(id);
    setDeletingBook(null);
    setSuccessMessage('Book status updated to inactive.');
    queryClient.invalidateQueries({ queryKey: ['books'] });

    // If deleting last item on current page (> 1), step back to previous page
    const targetPage = (books.length === 1 && currentPage > 1) ? currentPage - 1 : currentPage;
    setCurrentPage(targetPage);
    await fetchBooks(targetPage);
  };

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="flex-1 flex flex-col justify-between min-h-0 space-y-3.5 overflow-y-auto lg:overflow-hidden h-full">
      {/* Header */}
      <PageHeader
        eyebrow="Catalogue Management"
        title="Books Management"
        description="Manage, catalogue, and monitor book inventory in your library."
      >
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.97] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
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
            <button onClick={() => fetchBooks(currentPage)} className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters Toolbar */}
      <div className="shrink-0">
        <BookFilters
          search={searchInput}
          onSearchChange={handleSearchChange}
          categoryId={categoryId}
          onCategoryChange={handleCategoryChange}
          availability={availability}
          onAvailabilityChange={handleAvailabilityChange}
          categories={categories}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Main Table / Grid Viewport */}
      {loading ? (
        <ListSkeleton rows={5} className="mt-0" />
      ) : books.length === 0 ? (
        <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 bg-navy-50 border border-brand-border text-navy-700 rounded-2xl flex items-center justify-center shadow-2xs">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No books found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {hasActiveFilters ? 'Try changing your search or filters.' : 'There are no books catalogued in your library yet.'}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                <span>Clear Filters</span>
              </button>
            )}
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Book</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col justify-between space-y-3">
          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <BookTable
                books={books}
                onEdit={handleOpenEditModal}
                onDelete={handleOpenDeleteModal}
              />
            </div>

            {/* Mobile Grid View */}
            <motion.div variants={MOBILE_GRID_VARIANTS} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
              {books.map((book) => (
                <motion.div key={book.id} variants={MOBILE_CARD_VARIANTS}>
                  <BookCard
                    book={book}
                    onEdit={handleOpenEditModal}
                    onDelete={handleOpenDeleteModal}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Pagination Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-2xs shrink-0">
            <span className="text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{startIndex}–{endIndex}</strong> of{' '}
              <strong className="text-slate-900">{total}</strong> books
            </span>

            {lastPage > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg disabled:opacity-40 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {getPaginationRange().map((item, idx) => (
                  typeof item === 'number' ? (
                    <button
                      key={item}
                      onClick={() => handlePageChange(item)}
                      disabled={loading}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentPage === item
                          ? 'bg-amber-500 text-slate-950 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={`ellipsis-${idx}`} className="w-7 h-7 flex items-center justify-center text-slate-400 font-bold select-none">
                      ...
                    </span>
                  )
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === lastPage || loading}
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

      {/* Book Form Modal */}
      <AnimatePresence>
        {showFormModal && (
          <BookForm
            initialData={editingBook}
            categories={categories}
            onSave={handleSaveBook}
            onClose={() => setShowFormModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Delete Book Modal */}
      <AnimatePresence>
        {deletingBook && (
          <DeleteBookModal
            book={deletingBook}
            onConfirm={handleDeleteBookConfirm}
            onClose={() => setDeletingBook(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
