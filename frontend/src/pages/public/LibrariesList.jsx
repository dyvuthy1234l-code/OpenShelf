import { useState, useMemo, useRef } from 'react';
import { 
  Building2, Search, X, Sparkles, SlidersHorizontal, ArrowUpDown, RefreshCw, MapPin 
} from 'lucide-react';
import { useLibraries } from '../../hooks/queries/useLibraries';
import useDebounce from '../../hooks/useDebounce';
import LibraryCard from '../../components/public/LibraryCard';
import FeaturedLibraryCard from '../../components/public/FeaturedLibraryCard';
import AnimatedPagination from '../../components/common/AnimatedPagination';
import ErrorState from '../../components/public/ErrorState';
import LibrarySkeleton from '../../components/common/LibrarySkeleton';
import { motion } from 'framer-motion';
import { LIST_STAGGER, LIST_ITEM, REVEAL_VARIANTS } from '../../constants/motionTokens';

export default function LibrariesList() {
  const directoryRef = useRef(null);

  // Search, filter & pagination state
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [sortBy, setSortBy] = useState('most_books');
  const [page, setPage] = useState(1);

  // Query Hooks (Cached with TanStack Query + keepPreviousData)
  const { data: featuredRes } = useLibraries({ per_page: -1 });
  const featuredLibraries = (featuredRes?.data || featuredRes?.libraries || [])
    .sort((a, b) => (b.reviews_avg_rating || 0) - (a.reviews_avg_rating || 0))
    .slice(0, 2);

  const queryParams = {
    search: debouncedSearch || selectedProvince || undefined,
    page,
    per_page: 12,
  };

  const {
    data: librariesRes,
    isLoading: initialLoading,
    isFetching,
    isError,
    refetch: loadLibraries,
  } = useLibraries(queryParams);

  const libraries = librariesRes?.data || librariesRes?.libraries || [];
  const loading = initialLoading && libraries.length === 0;

  const meta = {
    current_page: Number(librariesRes?.meta?.current_page) || page,
    last_page: Number(librariesRes?.meta?.last_page) || 1,
    per_page: Number(librariesRes?.meta?.per_page) || 12,
    total: Number(librariesRes?.meta?.total) || libraries.length,
  };
  const error = isError ? 'Failed to load physical libraries directory. Please check your network or try again.' : null;

  // Handle Search Input Change -> Reset to page 1
  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  // Handle Province Select Change
  const handleProvinceChange = (province) => {
    setSelectedProvince(province);
    setPage(1);
  };

  // Handle Clear Filters
  const handleClearFilters = () => {
    setSearchInput('');
    setSelectedProvince('');
    setSortBy('most_books');
    setPage(1);
  };

  // Handle Page Change with smooth scroll into view
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.last_page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sort current page items
  const sortedLibraries = useMemo(() => {
    const list = [...libraries];
    if (sortBy === 'most_books') {
      list.sort((a, b) => {
        const countA = a.books_count ?? (a.books ? a.books.length : 0);
        const countB = b.books_count ?? (b.books ? b.books.length : 0);
        return countB - countA;
      });
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'newest') {
      list.sort((a, b) => b.id - a.id);
    }
    return list;
  }, [libraries, sortBy]);

  // Calculate showing text ranges
  const startItem = meta.total > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0;
  const endItem = meta.total > 0 ? Math.min(meta.current_page * meta.per_page, meta.total) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12 pb-20">
      {/* 1. EDITORIAL PAGE HEADER */}
      <div className="bg-white border border-brand-border/70 rounded-3xl p-6 sm:p-10 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-600 mb-1">
          <Building2 className="w-4 h-4" />
          <span>Community Directory</span>
        </div>
        <h1 className="os-section-title sm:text-3xl lg:text-4xl">
          Physical Libraries
        </h1>
        <p className="text-slate-500 text-xs sm:text-base leading-relaxed max-w-3xl">
          Explore partner community libraries across Cambodia. Connect with physical reading spaces, inspect collection counts, and borrow books in person.
        </p>
      </div>

      {/* 2. FEATURED LIBRARIES SECTION (Show near top on page 1) */}
      {page === 1 && featuredLibraries.length > 0 && (
        <section className="space-y-6">
          <motion.div {...REVEAL_VARIANTS} className="flex items-center justify-between border-b border-brand-border/60 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-600">
                <Sparkles className="w-4 h-4 text-gold-500" />
                <span>Featured Partners</span>
              </div>
              <h2 className="os-section-title">Featured Libraries</h2>
            </div>
          </motion.div>

          <motion.div
            variants={LIST_STAGGER}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
            className="flex flex-wrap justify-center gap-6"
          >
            {featuredLibraries.map((lib) => (
              <motion.div key={`featured-${lib.id}`} variants={LIST_ITEM} className="w-full md:w-[calc(50%_-_0.75rem)]">
                <FeaturedLibraryCard library={lib} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* 3. ALL LIBRARIES SECTION WITH SERVER-SIDE PAGINATION */}
      <section ref={directoryRef} className="space-y-6">
        <motion.div {...REVEAL_VARIANTS} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-600">
              <Building2 className="w-4 h-4" />
              <span>Complete Directory</span>
            </div>
            <h2 className="os-section-title">
              {debouncedSearch ? `Search Results for "${debouncedSearch}"` : 'All Physical Libraries'}
            </h2>
          </div>
        </motion.div>

        {/* TOOLBAR CARD: Search Input, 25 Cambodian Provinces Selector, & Sort Dropdown */}
        <div className="bg-white border border-brand-border/70 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col xl:flex-row xl:items-center flex-wrap gap-3">
            {/* Real-time Showing Count */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-gold-600 shrink-0" />
              <span>
                Showing <strong className="text-navy-800">{startItem}–{endItem}</strong> of <strong className="text-navy-800">{meta.total}</strong> libraries
              </span>
            </div>

            {/* Embedded Search Input */}
            <div className="relative flex-1 min-w-[220px] max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search library name, address, or location..."
                value={searchInput}
                onChange={handleSearchChange}
                className="os-input h-10 pl-10 pr-10 text-xs font-medium"
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(''); setPage(1); }}
                  aria-label="Clear library search"
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Selectors: All 25 Provinces of Cambodia & Sort Dropdown */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* 25 Cambodian Provinces Dropdown */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-600 pointer-events-none" />
                <select
                  value={selectedProvince}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  aria-label="Filter by province"
                  className="os-input h-10 pl-9 pr-4 text-xs font-semibold cursor-pointer max-w-[150px] sm:max-w-[210px] truncate"
                >
                  <option value="">All Provinces (ខេត្ត/ក្រុងទាំងអស់)</option>
                  <option value="Phnom Penh">Phnom Penh (ភ្នំពេញ)</option>
                  <option value="Banteay Meanchey">Banteay Meanchey (បន្ទាយមានជ័យ)</option>
                  <option value="Battambang">Battambang (បាត់ដំបង)</option>
                  <option value="Kampong Cham">Kampong Cham (កំពង់ចាម)</option>
                  <option value="Kampong Chhnang">Kampong Chhnang (កំពង់ឆ្នាំង)</option>
                  <option value="Kampong Speu">Kampong Speu (កំពង់ស្ពឺ)</option>
                  <option value="Kampong Thom">Kampong Thom (កំពង់ធំ)</option>
                  <option value="Kampot">Kampot (កំពត)</option>
                  <option value="Kandal">Kandal (កណ្តាល)</option>
                  <option value="Kep">Kep (កែប)</option>
                  <option value="Koh Kong">Koh Kong (កោះកុង)</option>
                  <option value="Kratie">Kratie (ក្រចេះ)</option>
                  <option value="Mondulkiri">Mondulkiri (មណ្ឌលគិរី)</option>
                  <option value="Oddar Meanchey">Oddar Meanchey (ឧត្តរមានជ័យ)</option>
                  <option value="Pailin">Pailin (ប៉ៃលិន)</option>
                  <option value="Preah Sihanouk">Preah Sihanouk (ព្រះសីហនុ)</option>
                  <option value="Preah Vihear">Preah Vihear (ព្រះវិហារ)</option>
                  <option value="Prey Veng">Prey Veng (ព្រៃវែង)</option>
                  <option value="Pursat">Pursat (ពោធិ៍សាត់)</option>
                  <option value="Ratanakiri">Ratanakiri (រតនគិរី)</option>
                  <option value="Siem Reap">Siem Reap (សៀមរាប)</option>
                  <option value="Stung Treng">Stung Treng (ស្ទឹងត្រែង)</option>
                  <option value="Svay Rieng">Svay Rieng (ស្វាយរៀង)</option>
                  <option value="Takeo">Takeo (តាកែវ)</option>
                  <option value="Tboung Khmum">Tboung Khmum (ត្បូងឃ្មុំ)</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort libraries"
                  className="os-input h-10 pl-9 pr-4 text-xs font-semibold cursor-pointer"
                >
                  <option value="most_books">Most Books</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT SKELETON / ERROR / EMPTY / GRID */}
        {loading ? (
          <div className="flex flex-wrap justify-center gap-6">
            {[...Array(6)].map((_, i) => (
              <LibrarySkeleton key={`lib-skeleton-${i}`} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadLibraries} />
        ) : sortedLibraries.length === 0 ? (
          /* EMPTY RESULT STATE */
          <div className="bg-white border border-brand-border/70 rounded-3xl p-10 text-center max-w-md mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto text-navy-700">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-navy-800">
              {selectedProvince ? `No libraries in ${selectedProvince} yet` : 'No libraries found'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {selectedProvince ? (
                <>
                  Currently, there are no partner libraries registered in <strong className="text-slate-800">{selectedProvince}</strong>. Most partner libraries are located in <strong className="text-slate-800">Phnom Penh</strong>.
                </>
              ) : (
                <>We couldn&apos;t find any physical libraries matching &quot;<strong className="text-slate-700">{searchInput}</strong>&quot;.</>
              )}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {selectedProvince && selectedProvince !== 'Phnom Penh' && (
                <button
                  onClick={() => handleProvinceChange('Phnom Penh')}
                  className="os-btn-gold h-10 px-4 text-xs"
                >
                  <Building2 className="w-4 h-4" />
                  <span>View Phnom Penh Libraries</span>
                </button>
              )}
              <button
                onClick={handleClearFilters}
                className="os-btn-secondary h-10 px-4 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>All Provinces</span>
              </button>
            </div>
          </div>
        ) : (
          /* LIBRARY CARDS GRID & PAGINATION CONTROLS */
          <div className={`space-y-8 transition-opacity duration-200 ${isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
            <motion.div
              variants={LIST_STAGGER}
              initial="initial"
              animate="animate"
              className="flex flex-wrap justify-center gap-6"
            >
              {sortedLibraries.map((lib) => (
                <motion.div key={`all-${lib.id}`} variants={LIST_ITEM} className="w-full md:w-[calc(50%_-_0.75rem)] lg:w-[calc(33.333%_-_1rem)]">
                  <LibraryCard library={lib} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination Controls Bar */}
            <AnimatedPagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </div>
  );
}
