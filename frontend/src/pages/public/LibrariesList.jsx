import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Building2, Search, X, Sparkles, SlidersHorizontal, ArrowUpDown, RefreshCw, MapPin, ChevronDown, Check 
} from 'lucide-react';
import { useLibraries } from '../../hooks/queries/useLibraries';
import useDebounce from '../../hooks/useDebounce';
import LibraryCard from '../../components/public/LibraryCard';
import FeaturedLibraryCard from '../../components/public/FeaturedLibraryCard';
import AnimatedPagination from '../../components/common/AnimatedPagination';
import ErrorState from '../../components/public/ErrorState';
import LibrarySkeleton from '../../components/common/LibrarySkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { LIST_STAGGER, LIST_ITEM, REVEAL_VARIANTS } from '../../constants/motionTokens';

const CAMBODIA_PROVINCES = [
  { value: '', en: 'All Provinces', kh: 'ខេត្ត/ក្រុងទាំងអស់' },
  { value: 'Phnom Penh', en: 'Phnom Penh', kh: 'ភ្នំពេញ' },
  { value: 'Banteay Meanchey', en: 'Banteay Meanchey', kh: 'បន្ទាយមានជ័យ' },
  { value: 'Battambang', en: 'Battambang', kh: 'បាត់ដំបង' },
  { value: 'Kampong Cham', en: 'Kampong Cham', kh: 'កំពង់ចាម' },
  { value: 'Kampong Chhnang', en: 'Kampong Chhnang', kh: 'កំពង់ឆ្នាំង' },
  { value: 'Kampong Speu', en: 'Kampong Speu', kh: 'កំពង់ស្ពឺ' },
  { value: 'Kampong Thom', en: 'Kampong Thom', kh: 'កំពង់ធំ' },
  { value: 'Kampot', en: 'Kampot', kh: 'កំពត' },
  { value: 'Kandal', en: 'Kandal', kh: 'កណ្តាល' },
  { value: 'Kep', en: 'Kep', kh: 'កែប' },
  { value: 'Koh Kong', en: 'Koh Kong', kh: 'កោះកុង' },
  { value: 'Kratie', en: 'Kratie', kh: 'ក្រចេះ' },
  { value: 'Mondulkiri', en: 'Mondulkiri', kh: 'មណ្ឌលគិរី' },
  { value: 'Oddar Meanchey', en: 'Oddar Meanchey', kh: 'ឧត្តរមានជ័យ' },
  { value: 'Pailin', en: 'Pailin', kh: 'ប៉ៃលិន' },
  { value: 'Preah Sihanouk', en: 'Preah Sihanouk', kh: 'ព្រះសីហនុ' },
  { value: 'Preah Vihear', en: 'Preah Vihear', kh: 'ព្រះវិហារ' },
  { value: 'Prey Veng', en: 'Prey Veng', kh: 'ព្រៃវែង' },
  { value: 'Pursat', en: 'Pursat', kh: 'ពោធិ៍សាត់' },
  { value: 'Ratanakiri', en: 'Ratanakiri', kh: 'រតនគិរី' },
  { value: 'Siem Reap', en: 'Siem Reap', kh: 'សៀមរាប' },
  { value: 'Stung Treng', en: 'Stung Treng', kh: 'ស្ទឹងត្រែង' },
  { value: 'Svay Rieng', en: 'Svay Rieng', kh: 'ស្វាយរៀង' },
  { value: 'Takeo', en: 'Takeo', kh: 'តាកែវ' },
  { value: 'Tboung Khmum', en: 'Tboung Khmum', kh: 'ត្បូងឃ្មុំ' },
];

function ProvinceDropdown({ selectedValue, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedItem = CAMBODIA_PROVINCES.find((p) => p.value === selectedValue) || CAMBODIA_PROVINCES[0];

  const filteredProvinces = useMemo(() => {
    if (!filterQuery.trim()) return CAMBODIA_PROVINCES;
    const q = filterQuery.toLowerCase().trim();
    return CAMBODIA_PROVINCES.filter(
      (p) => p.en.toLowerCase().includes(q) || p.kh.includes(q)
    );
  }, [filterQuery]);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-11 pl-3.5 pr-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all duration-200 shadow-2xs cursor-pointer ${
          isOpen
            ? 'bg-white dark:bg-slate-800 border-amber-500 ring-2 ring-amber-500/20 text-slate-900 dark:text-white'
            : selectedValue
            ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white'
            : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <MapPin className={`w-4 h-4 shrink-0 ${selectedValue ? 'text-amber-500' : 'text-slate-400'}`} />
          <span className="truncate">
            {selectedItem.value ? `${selectedItem.en} (${selectedItem.kh})` : 'All Provinces (ខេត្ត/ក្រុង)'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 sm:left-auto sm:right-0 top-12 z-50 w-[min(calc(100vw-2.5rem),22rem)] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-2"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search province in EN / ខ្មែរ..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                autoFocus
                className="w-full h-9 pl-9 pr-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              {filterQuery && (
                <button
                  type="button"
                  onClick={() => setFilterQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1 text-xs no-scrollbar">
              {filteredProvinces.length === 0 ? (
                <div className="p-4 text-center text-slate-400 font-medium">
                  No province found matching "{filterQuery}"
                </div>
              ) : (
                filteredProvinces.map((prov) => {
                  const isSelected = selectedValue === prov.value;
                  return (
                    <button
                      key={prov.value || 'all'}
                      type="button"
                      onClick={() => {
                        onChange(prov.value);
                        setIsOpen(false);
                        setFilterQuery('');
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left transition-colors font-medium cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-semibold">{prov.en}</span>
                        {prov.kh && (
                          <span className={`text-[11px] ${isSelected ? 'text-slate-950/80 font-bold' : 'text-slate-400'}`}>
                            ({prov.kh})
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-slate-950 shrink-0 ml-2" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Default (Newest)' },
  { value: 'highest_rated', label: 'Highest Rated First' },
  { value: 'most_books', label: 'Most Books' },
  { value: 'name', label: 'Name (A-Z)' },
];

function SortDropdown({ selectedValue, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = SORT_OPTIONS.find((o) => o.value === selectedValue) || SORT_OPTIONS[0];

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-11 pl-3.5 pr-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all duration-200 shadow-2xs cursor-pointer ${
          isOpen
            ? 'bg-white dark:bg-slate-800 border-amber-500 ring-2 ring-amber-500/20 text-slate-900 dark:text-white'
            : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <ArrowUpDown className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="truncate">{selectedOption.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 sm:left-auto sm:right-0 top-12 z-50 w-[min(calc(100vw-2.5rem),16rem)] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-1.5 space-y-0.5"
          >
            {SORT_OPTIONS.map((opt) => {
              const isSelected = selectedValue === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left text-xs transition-colors font-semibold cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-slate-950 shrink-0 ml-2" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LibrariesList() {
  const directoryRef = useRef(null);

  // Search, filter & pagination state
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  // Query Hooks (Cached with TanStack Query + keepPreviousData)
  const { data: featuredRes } = useLibraries({ per_page: -1 });
  const featuredLibraries = (featuredRes?.data || featuredRes?.libraries || [])
    .sort((a, b) => {
      const rateA = Number(a.rating || a.reviews_avg_rating || 0);
      const rateB = Number(b.rating || b.reviews_avg_rating || 0);
      if (rateB !== rateA) return rateB - rateA;

      const booksA = Number(a.books_count ?? (a.books ? a.books.length : 0));
      const booksB = Number(b.books_count ?? (b.books ? b.books.length : 0));
      return booksB - booksA;
    })
    .slice(0, 4);

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
    } else if (sortBy === 'highest_rated') {
      list.sort((a, b) => (Number(b.average_rating || b.reviews_avg_rating) || 0) - (Number(a.average_rating || a.reviews_avg_rating) || 0));
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-8 sm:space-y-12 pb-24">
      {/* 1. EDITORIAL PAGE HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500 mb-1">
          <Building2 className="w-4 h-4" />
          <span>Community Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Physical Libraries
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-base leading-relaxed max-w-3xl">
          Explore partner community libraries across Cambodia. Connect with physical reading spaces, inspect collection counts, and borrow books in person.
        </p>
      </div>

      {/* 2. FEATURED LIBRARIES SECTION (Show near top on page 1) */}
      {page === 1 && featuredLibraries.length > 0 && (
        <section className="space-y-6">
          <motion.div {...REVEAL_VARIANTS} className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Featured Partners</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">Top Rated Libraries</h2>
            </div>
          </motion.div>

          <motion.div
            variants={LIST_STAGGER}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {featuredLibraries.map((lib, idx) => (
              <motion.div key={`featured-${lib.id}`} variants={LIST_ITEM} className="w-full h-full">
                <FeaturedLibraryCard library={lib} rankIndex={idx} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* 3. ALL LIBRARIES SECTION WITH SERVER-SIDE PAGINATION */}
      <section ref={directoryRef} className="space-y-6">
        <motion.div {...REVEAL_VARIANTS} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500">
              <Building2 className="w-4 h-4" />
              <span>Complete Directory</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
              {debouncedSearch ? `Search Results for "${debouncedSearch}"` : 'All Physical Libraries'}
            </h2>
          </div>
        </motion.div>

        {/* TOOLBAR CARD: Responsive Search & Filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Real-time Showing Count */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Showing <strong className="text-slate-900 dark:text-white">{startItem}–{endItem}</strong> of <strong className="text-slate-900 dark:text-white">{meta.total}</strong> libraries
              </span>
            </div>

            {/* Embedded Search Input */}
            <div className="relative flex-1 min-w-0 max-w-full md:max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search library name, address, or location..."
                value={searchInput}
                onChange={handleSearchChange}
                className="w-full h-11 pl-10 pr-10 text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(''); setPage(1); }}
                  aria-label="Clear library search"
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Selectors: All 25 Provinces of Cambodia & Sort Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <ProvinceDropdown
              selectedValue={selectedProvince}
              onChange={handleProvinceChange}
            />
            <SortDropdown
              selectedValue={sortBy}
              onChange={setSortBy}
            />
          </div>
        </div>

        {/* CONTENT SKELETON / ERROR / EMPTY / GRID */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {sortedLibraries.map((lib) => (
                <motion.div key={`all-${lib.id}`} variants={LIST_ITEM} className="w-full">
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
