import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Layers, Search, X, Bookmark, Building2, ArrowRight, RefreshCw, SlidersHorizontal, BookOpen 
} from 'lucide-react';
import publicService from '../../services/publicService';
import Pagination from '../../components/public/Pagination';
import ErrorState from '../../components/public/ErrorState';
import { LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';

export default function CategoriesList() {
  const directoryRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Read URL query parameters
  const search = searchParams.get('search') || '';
  const libraryId = searchParams.get('library_id') || '';
  const page = Number(searchParams.get('page')) || 1;
  const perPage = 12;

  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
  });

  // Fetch Libraries list for the Library dropdown filter
  useEffect(() => {
    async function loadLibraries() {
      try {
        const libRes = await publicService.getLibraries({ per_page: -1 });
        setLibraries(libRes.data || libRes.libraries || []);
      } catch {
        // filter options non-critical
      }
    }
    loadLibraries();
  }, []);

  // Fetch Paginated Categories from Backend API
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        per_page: perPage,
      };
      if (search.trim()) params.search = search.trim();
      if (libraryId) params.library_id = libraryId;

      const res = await publicService.getCategories(params);
      const list = res.data || [];
      setCategories(list);

      if (res.meta) {
        setMeta({
          current_page: Number(res.meta.current_page) || page,
          last_page: Number(res.meta.last_page) || 1,
          per_page: Number(res.meta.per_page) || perPage,
          total: Number(res.meta.total) || list.length,
        });
      } else {
        setMeta({
          current_page: 1,
          last_page: 1,
          per_page: perPage,
          total: list.length,
        });
      }
    } catch {
      setError('Failed to load book categories. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  }, [search, libraryId, page]);

  useEffect(() => {
    const timer = setTimeout(loadCategories, 300);
    return () => clearTimeout(timer);
  }, [loadCategories]);

  const totalItems = meta.total || categories.length;
  const lastPage = meta.last_page || 1;
  const startItem = totalItems > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0;
  const endItem = totalItems > 0 ? Math.min(meta.current_page * meta.per_page, totalItems) : 0;

  // Update Filters helper
  const updateFilters = (updated) => {
    const params = new URLSearchParams(searchParams);

    // If library_id is changing, reset page to 1
    if ('library_id' in updated && updated.library_id !== libraryId) {
      params.delete('page');
    }

    // Reset page to 1 if search changes
    if ('search' in updated) {
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
    if (newPage >= 1 && newPage <= lastPage) {
      updateFilters({ page: newPage.toString() });
      if (directoryRef.current) {
        directoryRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8 pb-20">
      {/* Editorial Header */}
      <div className="bg-white border border-brand-border/70 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-600 mb-1">
              <Layers className="w-4 h-4" />
              <span>Classification</span>
            </div>
            <h1 className="os-section-title sm:text-3xl lg:text-4xl">Book Categories</h1>
            <p className="text-slate-500 text-xs sm:text-base leading-relaxed">
              Explore physical titles classified by genre, subject, and holding library.
            </p>
          </div>

          {(search || libraryId || page > 1) && (
            <button
              onClick={handleClearFilters}
              className="os-btn-secondary h-10 px-4 text-xs shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Filter Bar: Search + Library Filter */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-brand-border/60">
          {/* Search Category */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search category name or description..."
              value={search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="os-input h-10 pl-10 pr-10 text-xs"
            />
            {search && (
              <button
                onClick={() => updateFilters({ search: '' })}
                aria-label="Clear category search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Library Filter */}
          <div className="relative sm:w-64">
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
        </div>

        {/* Real-Time Count Indicator */}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gold-600" />
            <span>
              Showing <strong className="text-navy-800">{startItem}–{endItem}</strong> of <strong className="text-navy-800">{totalItems}</strong> categories
            </span>
          </div>
          {libraryId && (
            <span className="os-badge-info">
              Filtered by selected library
            </span>
          )}
        </div>
      </div>

      {/* Categories Grid Container */}
      <div ref={directoryRef} className="space-y-8">
        {loading ? (
          /* Skeleton Loading Cards (4 columns x 3 rows = 12 cards) */
          <div className="flex flex-wrap justify-center gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
              <div key={n} className="basis-full sm:basis-[calc(50%-0.75rem)] lg:basis-[calc(25%-1.125rem)] grow bg-white border border-slate-200 rounded-2xl p-5 space-y-4 animate-pulse h-48">
                <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadCategories} />
        ) : categories.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-brand-border/70 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto text-navy-700">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-navy-800">No categories found</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              We couldn&apos;t find any active categories matching your selected filters or search.
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
          </div>
        ) : (
          /* Categories Grid & Pagination Bar */
          <div className="space-y-8">
            <motion.div
              variants={LIST_STAGGER}
              initial="initial"
              animate="animate"
              className="flex flex-wrap justify-center gap-6"
            >
              {categories.map((cat) => {
                const targetLibraryId = libraryId || cat.library_id;
                const bookTarget = targetLibraryId
                  ? `/books?library_id=${targetLibraryId}&category_id=${cat.id}`
                  : `/books?category_id=${cat.id}`;
                const count = cat.books_count ?? 0;

                return (
                  <motion.div
                    key={cat.id}
                    variants={LIST_ITEM}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="basis-full sm:basis-[calc(50%-0.75rem)] lg:basis-[calc(25%-1.125rem)] grow"
                  >
                    <Link
                      to={bookTarget}
                      className="group bg-white border border-brand-border/70 hover:border-gold-500/50 rounded-2xl p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-48 justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 bg-navy-50 group-hover:bg-gold-500 text-navy-700 group-hover:text-navy-950 rounded-xl flex items-center justify-center transition-colors">
                            <Bookmark className="w-5 h-5" />
                          </div>
                          {cat.library?.name && (
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60 truncate max-w-[120px]">
                              {cat.library.name}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-navy-800 group-hover:text-gold-600 transition-colors line-clamp-1">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {cat.description || 'Discover physical books under this subject classification.'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs font-bold text-gold-600 group-hover:text-navy-800">
                        <span>{count} {count === 1 ? 'Book' : 'Books'} Available</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Pagination Controls Bar */}
            <Pagination
              currentPage={page}
              lastPage={lastPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}


