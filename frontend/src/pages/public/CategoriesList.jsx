import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Layers, Search, X, Bookmark, ArrowRight, RefreshCw, SlidersHorizontal 
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
  const [isFetching, setIsFetching] = useState(false);
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
      if (categories.length === 0) setLoading(true);
      setIsFetching(true);
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
      setIsFetching(false);
    }
  }, [search, libraryId, page, categories.length]);

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-8 pb-20 select-none">
      {/* Editorial Header */}
      <div className="bg-white dark:bg-[#0B1E34] border border-slate-200/90 dark:border-slate-700/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#F5B82E] mb-1">
              <Layers className="w-4 h-4" />
              <span>Classification</span>
            </div>
            <h1 className="os-section-title sm:text-3xl lg:text-4xl text-slate-900 dark:text-white">Book Categories</h1>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base leading-relaxed font-normal">
              Explore physical titles classified by genre, subject, and holding library.
            </p>
          </div>

          {(search || libraryId || page > 1) && (
            <button
              onClick={handleClearFilters}
              className="os-btn-secondary h-10 px-4 text-xs shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Filter Bar: Search + Library Filter */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Search Category */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search category name or description..."
              value={search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="os-input h-10 pl-10 pr-10 text-xs bg-slate-50 dark:bg-[#07172B] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20"
            />
            {search && (
              <button
                onClick={() => updateFilters({ search: '' })}
                aria-label="Clear category search"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 cursor-pointer"
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
              className="os-input h-10 pr-8 text-xs font-medium bg-slate-50 dark:bg-[#07172B] border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer focus:border-amber-400"
            >
              <option value="">All Libraries</option>
              {libraries.map((l) => (
                <option key={l.id} value={l.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-Time Count Indicator */}
        <div className="flex items-center justify-between pt-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span>
              Showing <strong className="text-slate-900 dark:text-amber-400 font-black">{startItem}–{endItem}</strong> of <strong className="text-slate-900 dark:text-amber-400 font-black">{totalItems}</strong> categories
            </span>
          </div>
          {libraryId && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/40">
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
              <div key={n} className="w-full sm:w-[calc(50%_-_0.75rem)] lg:w-[calc(25%_-_1.125rem)] bg-white dark:bg-[#0B1E34] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 animate-pulse h-48">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadCategories} />
        ) : categories.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-[#0B1E34] border border-slate-200/90 dark:border-slate-700/80 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 bg-amber-500/10 dark:bg-amber-400/15 border border-amber-400/30 rounded-2xl flex items-center justify-center mx-auto text-amber-500 dark:text-amber-400">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No categories found</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
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
          <div className={`space-y-8 transition-opacity duration-200 ${isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
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
                    className="w-full sm:w-[calc(50%_-_0.75rem)] lg:w-[calc(25%_-_1.125rem)]"
                  >
                    <Link
                      to={bookTarget}
                      className="group bg-white dark:bg-[#0B1E34] border border-slate-200/90 dark:border-slate-700/80 hover:border-amber-400 dark:hover:border-amber-400 rounded-2xl p-5 shadow-xs hover:shadow-2xl transition-all duration-300 flex flex-col h-48 justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          {/* Vibrant Golden Category Icon */}
                          <div className="w-10 h-10 rounded-xl bg-amber-500/15 dark:bg-amber-400/20 border border-amber-500/30 dark:border-amber-400/40 group-hover:bg-[#F5B82E] text-amber-600 dark:text-amber-300 group-hover:text-[#07172B] flex items-center justify-center transition-all duration-200 shadow-[0_0_10px_rgba(245,184,46,0.15)]">
                            <Bookmark className="w-5 h-5" strokeWidth={2.4} />
                          </div>

                          {/* High-Contrast Library Badge */}
                          {cat.library?.name && (
                            <span className="text-[10px] font-bold text-slate-700 dark:text-amber-300/90 bg-slate-100 dark:bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/90 truncate max-w-[140px] shadow-2xs">
                              {cat.library.name}
                            </span>
                          )}
                        </div>

                        <div>
                          {/* Crisp Bold Category Title */}
                          <h3 className="text-base sm:text-[17px] font-black text-slate-900 dark:text-white group-hover:text-[#F5B82E] dark:group-hover:text-[#F5B82E] transition-colors line-clamp-1 leading-snug tracking-tight">
                            {cat.name}
                          </h3>

                          {/* High-Contrast Description */}
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed font-medium">
                            {cat.description || 'Discover physical books under this subject classification.'}
                          </p>
                        </div>
                      </div>

                      {/* Footer Row with Glowing Available Count */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-black text-amber-600 dark:text-amber-400 group-hover:text-slate-900 dark:group-hover:text-[#F5B82E] transition-colors">
                        <span>{count} {count === 1 ? 'Book' : 'Books'} Available</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 group-hover:translate-x-1.5 transition-transform" strokeWidth={2.5} />
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
