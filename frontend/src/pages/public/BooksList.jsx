import { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, Search, X, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { useBooks } from '../../hooks/queries/useBooks';
import { useLibraries } from '../../hooks/queries/useLibraries';
import { useCategories } from '../../hooks/queries/useCategories';
import useDebounce from '../../hooks/useDebounce';
import BookCard from '../../components/public/BookCard';
import BookSkeleton from '../../components/common/BookSkeleton';
import Pagination from '../../components/public/Pagination';
import ErrorState from '../../components/public/ErrorState';

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
    isLoading: loading,
    isError,
    refetch: loadBooks,
  } = useBooks(queryParams);

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
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Complete Catalogue</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">Book Catalogue</h1>
            <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
              Browse physical titles available across OpenShelf partner libraries in Cambodia.
            </p>
          </div>

          {(search || categoryId || libraryId || page > 1) && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-xl transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          )}
        </div>

        {/* Filters Bar: Search + Dependent Category + Library + Sort */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          {/* 1. Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, author..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(''); updateFilters({ search: '' }); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Library Filter (Master Dropdown) */}
          <div className="relative">
            <select
              value={libraryId}
              onChange={(e) => updateFilters({ library_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium cursor-pointer"
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
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => updateFilters({ category_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium cursor-pointer"
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
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium cursor-pointer"
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
            <SlidersHorizontal className="w-4 h-4 text-amber-600" />
            <span>
              Showing <strong className="text-slate-900">{startItem}–{endItem}</strong> of <strong className="text-slate-900">{meta.total}</strong> books
            </span>
          </div>
          {libraryId && (
            <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-md font-semibold">
              Filtered by library
            </span>
          )}
        </div>
      </div>

      {/* Book Grid Container */}
      <div ref={directoryRef} className="space-y-8">
        {loading ? (
          <BookSkeleton count={8} />
        ) : error ? (
          <ErrorState message={error} onRetry={loadBooks} />
        ) : books.length === 0 ? (
          /* Empty Results State */
          <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">No books found</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              We couldn&apos;t find any books matching your selected filters or search query.
            </p>
            <div className="pt-2">
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Clear filters</span>
              </button>
            </div>
          </div>
        ) : (
          /* Real Book Cards Grid & Server-Side Pagination Bar */
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {books.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>

            {/* Pagination Controls Bar */}
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
