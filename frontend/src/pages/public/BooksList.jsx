import { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, X, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { useBooks } from '../../hooks/queries/useBooks';
import { useLibraries } from '../../hooks/queries/useLibraries';
import { useCategories } from '../../hooks/queries/useCategories';
import useDebounce from '../../hooks/useDebounce';
import BookCard from '../../components/public/BookCard';
import BookSkeleton from '../../components/common/BookSkeleton';
import AnimatedPagination from '../../components/common/AnimatedPagination';
import ErrorState from '../../components/public/ErrorState';
import { LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';

export default function BooksList() {
  const directoryRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL query parameters
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category_id') || '';
  const libraryId = searchParams.get('library_id') || '';
  const sort = searchParams.get('sort') || '';
  const page = Number(searchParams.get('page')) || 1;

  // Instant local typing state + 300ms debounced search query for API requests
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch !== search) {
      updateFilters({ search: debouncedSearch });
    }
  }, [debouncedSearch]);

  // Query Hooks (Cached with TanStack Query + keepPreviousData)
  const { data: librariesRes } = useLibraries({ per_page: -1 });
  const libraries = librariesRes?.data || librariesRes?.libraries || [];

  const { data: categoriesRes } = useCategories(libraryId ? { library_id: libraryId } : {});
  const categories = categoriesRes?.data || [];

  const queryParams = {
    search: search || undefined,
    category_id: categoryId || undefined,
    library_id: libraryId || undefined,
    sort: sort || undefined,
    page,
    per_page: 12,
  };

  const {
    data: booksRes,
    isLoading: initialLoading,
    isFetching,
    isError,
    refetch: loadBooks,
  } = useBooks(queryParams);

  const loading = initialLoading || isFetching;

  const books = booksRes?.data || [];
  const meta = {
    current_page: Number(booksRes?.meta?.current_page) || page,
    last_page: Number(booksRes?.meta?.last_page) || 1,
    per_page: Number(booksRes?.meta?.per_page) || 12,
    total: Number(booksRes?.meta?.total) || books.length,
  };
  const error = isError ? 'Failed to load books catalogue. Please check your network connection.' : null;

  // Update query params helper
  const updateFilters = (updated) => {
    const params = new URLSearchParams(searchParams);

    // If library_id is changing, reset category_id & reset page to 1
    if ('library_id' in updated && updated.library_id !== libraryId) {
      params.delete('category_id');
      params.delete('page');
    }

    // Reset page to 1 if search or category changes
    if ('search' in updated || 'category_id' in updated) {
      params.delete('page');
    }

    Object.entries(updated).forEach(([key, val]) => {
      if (val && (key !== 'page' || Number(val) > 1)) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.last_page) {
      updateFilters({ page: newPage.toString() });
      if (directoryRef.current) {
        directoryRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const startItem = meta.total > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0;
  const endItem = meta.total > 0 ? Math.min(meta.current_page * meta.per_page, meta.total) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8 pb-20">
      {/* Editorial Header */}
      <div className="bg-white border border-brand-border/70 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-600 mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Complete Catalogue</span>
            </div>
            <h1 className="os-section-title sm:text-3xl lg:text-4xl">Book Catalogue</h1>
            <p className="text-slate-500 text-xs sm:text-base leading-relaxed">
              Browse physical titles available across OpenShelf partner libraries in Cambodia.
            </p>
          </div>

          {(search || categoryId || libraryId || page > 1) && (
            <button
              onClick={handleClearFilters}
              className="os-btn-secondary h-10 px-4 text-xs shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          )}
        </div>

        {/* Filters Bar: Search + Dependent Category + Library + Sort */}
        <div className="flex flex-col md:flex-row md:items-center flex-wrap gap-3 pt-4 border-t border-brand-border/60">
          {/* 1. Search */}
          <div className="relative md:flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search title, author..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="os-input h-10 pl-10 pr-10 text-xs"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); updateFilters({ search: '' }); }}
                aria-label="Clear book search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Library Filter (Master Dropdown) */}
          <div className="relative md:w-52">
            <select
              value={libraryId}
              onChange={(e) => updateFilters({ library_id: e.target.value })}
              aria-label="Filter by library"
              className="os-input h-10 pr-8 text-xs font-medium cursor-pointer"
            >
              <option value="">All Libraries</option>
              {libraries.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Category Filter (Dependent Child Dropdown) */}
          <div className="relative md:w-52">
            <select
              value={categoryId}
              onChange={(e) => updateFilters({ category_id: e.target.value })}
              aria-label="Filter by category"
              className="os-input h-10 pr-8 text-xs font-medium cursor-pointer"
            >
              <option value="">
                {libraryId ? 'All Categories in selected library' : 'All Categories'}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Sort Dropdown */}
          <div className="relative md:w-48">
            <select
              value={sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              aria-label="Sort books"
              className="os-input h-10 pr-8 text-xs font-medium cursor-pointer"
            >
              <option value="">Default (Newest)</option>
              <option value="top_rated">Highest Rated First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Real-time Count Indicator */}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gold-600" />
            <span>
              Showing <strong className="text-navy-800">{startItem}–{endItem}</strong> of <strong className="text-navy-800">{meta.total}</strong> books
            </span>
          </div>
          {libraryId && (
            <span className="os-badge-info">
              Filtered by library
            </span>
          )}
        </div>
      </div>

      {/* Book Grid Container */}
      <div ref={directoryRef} className="space-y-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading-skeleton"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <BookSkeleton count={10} />
            </motion.div>
          ) : error ? (
            <motion.div key="error-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ErrorState message={error} onRetry={loadBooks} />
            </motion.div>
          ) : books.length === 0 ? (
            /* Empty Results State */
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-brand-border/70 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs"
            >
              <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto text-navy-700">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-navy-800">No books found</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                We couldn&apos;t find any books matching your selected filters or search query.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleClearFilters}
                  className="os-btn-gold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Clear filters</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* Real Book Cards Grid & Server-Side Pagination Bar */
            <motion.div
              key={`page-${meta.current_page}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-8"
            >
              <motion.div
                variants={LIST_STAGGER}
                initial="initial"
                animate="animate"
                className="flex flex-wrap justify-center gap-5"
              >
                {books.map((b) => (
                  <motion.div key={b.id} variants={LIST_ITEM} className="w-full sm:w-[calc(50%_-_0.625rem)] md:w-[calc(33.333%_-_0.833rem)] lg:w-[calc(20%_-_1rem)]">
                    <BookCard book={b} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination Controls Bar */}
              <AnimatedPagination
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                onPageChange={handlePageChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


