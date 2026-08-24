import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, Phone, Mail, Clock, ShieldAlert, BookOpen, 
  ExternalLink, ArrowLeft, Search, X, Layers, RefreshCw, SlidersHorizontal, Star
} from 'lucide-react';
import publicService from '../../services/publicService';
import BookCard from '../../components/public/BookCard';
import Pagination from '../../components/public/Pagination';
import EmptyState from '../../components/public/EmptyState';
import ErrorState from '../../components/public/ErrorState';
import BookSkeleton from '../../components/common/BookSkeleton';
import LibraryTopRatedBooks from '../../components/public/LibraryTopRatedBooks';
import LibraryReviews from '../../components/library/LibraryReviews';
import getImageUrl, { getLibraryCoverUrl, getLibraryLogoUrl } from '../../utils/imageUrl';

export default function LibraryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const booksGridRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // URL State
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category_id') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = Number(searchParams.get('page')) || 1;

  // Local State
  const [library, setLibrary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // 1. Fetch Library Details & Library-Specific Categories on Mount/id change
  useEffect(() => {
    async function loadLibraryData() {
      try {
        setLoadingLibrary(true);
        setError(null);

        const [libRes, catRes] = await Promise.all([
          publicService.getLibrary(id),
          publicService.getCategories({ library_id: id }),
        ]);

        const libData = libRes.data || libRes.library;
        setLibrary(libData);
        setCategories(catRes.data || []);
      } catch {
        setError('Library not found or failed to load profile information.');
      } finally {
        setLoadingLibrary(false);
      }
    }

    loadLibraryData();
  }, [id]);

  // 2. Fetch Library Books with Server-Side Pagination & Filters
  useEffect(() => {
    async function loadLibraryBooks() {
      if (!id) return;
      try {
        setLoadingBooks(true);

        const res = await publicService.getBooks({
          library_id: id,
          category_id: categoryId || undefined,
          search: search || undefined,
          sort: sort || undefined,
          page,
          per_page: 10,
        });

        const list = res.data || [];
        setBooks(list);

        if (res.meta) {
          setMeta({
            current_page: Number(res.meta.current_page) || page,
            last_page: Number(res.meta.last_page) || 1,
            per_page: Number(res.meta.per_page) || 10,
            total: Number(res.meta.total) || list.length,
          });
        } else {
          setMeta({
            current_page: 1,
            last_page: 1,
            per_page: 10,
            total: list.length,
          });
        }
      } catch {
        // Non-critical book fetch error
      } finally {
        setLoadingBooks(false);
      }
    }

    const timer = setTimeout(loadLibraryBooks, 300);
    return () => clearTimeout(timer);
  }, [id, categoryId, search, sort, page]);

  // Update query params helper
  const updateFilters = (updated) => {
    const params = new URLSearchParams(searchParams);

    // Reset page to 1 if search, category, or sort changes
    if ('search' in updated || 'category_id' in updated || 'sort' in updated) {
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
      if (booksGridRef.current) {
        booksGridRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (loadingLibrary) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-pulse">
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-48 bg-slate-200 rounded-2xl" />
          <div className="h-48 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !library) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ErrorState message={error || 'Library not found'} />
      </div>
    );
  }

  const startItem = meta.total > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0;
  const endItem = meta.total > 0 ? Math.min(meta.current_page * meta.per_page, meta.total) : 0;
  const totalBooksCount = library.books_count ?? meta.total ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 pb-20">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-700 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* PART 1 — LIBRARY HERO (COVER + OVERLAPPING LOGO) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
        {/* Full-width Cover Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative h-48 sm:h-64 md:h-72 lg:h-80 xl:h-96 bg-slate-950 overflow-hidden"
        >
          {getLibraryCoverUrl(library.cover_image_url || library.cover_image, 1200) ? (
            <img
              src={getLibraryCoverUrl(library.cover_image_url || library.cover_image, 1200)}
              alt={`${library.name} Banner`}
              loading="eager"
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-950 via-navy-900 to-amber-950/40 flex flex-col items-center justify-center p-6 text-center">
              <Building2 className="w-16 h-16 text-amber-400/40 mb-2" />
              <span className="text-sm font-bold text-amber-200/80">OpenShelf Community Partner Library</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-slate-950/10 pointer-events-none" />
        </motion.div>

        {/* Overlapping Logo & Identity Information */}
        <div className="p-6 sm:p-8 pt-0 relative space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-14 sm:-mt-20">
            {/* Left: Square Overlapping Logo + Name & Address */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {/* Overlapping Square Logo */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl bg-white p-2 border-4 border-white shadow-xl shrink-0 z-10 overflow-hidden"
              >
                {getLibraryLogoUrl(library.image_url || library.image, 200) ? (
                  <img
                    src={getLibraryLogoUrl(library.image_url || library.image, 200)}
                    alt={`${library.name} Logo`}
                    loading="eager"
                    className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                    <Building2 className="w-10 h-10 text-amber-600 mb-1" />
                    <span className="text-[10px] font-extrabold text-slate-700 leading-tight">LIBRARY LOGO</span>
                  </div>
                )}
              </motion.div>

              {/* Title & Status */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-1.5 pt-2"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    ● Open
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Verified Partner</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{library.name}</h1>

                {library.reviews_count > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-bold text-slate-900">{library.average_rating}</span>
                    <span className="text-xs text-slate-500">({library.reviews_count} reviews)</span>
                  </div>
                )}

                {library.address && (
                  <div className="flex items-center gap-2 text-slate-600 text-xs sm:text-sm font-medium">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{library.address}</span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right: Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-3 shrink-0"
            >
              {library.google_maps_url && (
                <a
                  href={library.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  <span>Get Directions</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* PART 2 — TWO-COLUMN INFORMATION SECTION BELOW HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT CARD (2/3 width) — TABBED DETAILS */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          {/* Compact Editorial Tab Header */}
          <div className="flex items-center gap-6 border-b border-slate-100 overflow-x-auto no-scrollbar">
            {[
              { id: 'about', label: 'About' },
              { id: 'contact', label: 'Contact' },
              { id: 'location', label: 'Location' },
              { id: 'collections', label: 'Collections' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-semibold transition-all duration-200 border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'text-amber-700 border-amber-500 font-bold'
                      : 'text-slate-500 hover:text-slate-800 border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content with Subtle Fade/Slide Transition */}
          <AnimatePresence mode="wait">
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed"
              >
                <p className="whitespace-pre-line">
                  {library.description ||
                    'Welcome to our library. We provide a wide range of academic resources, digital materials, and quiet study spaces for readers and students.'}
                </p>

                {/* Library Lending Terms & Policy Parameters */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Lending Terms & Policies</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Borrow Period</span>
                      <span className="text-sm font-extrabold text-slate-900">{library.borrowing_period_days ?? 14} Days</span>
                      <span className="text-[10px] text-slate-500 block">Allowed loan duration</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fine Per Day</span>
                      <span className="text-sm font-extrabold text-slate-900">${Number(library.fine_per_day ?? 0.50).toFixed(2)}</span>
                      <span className="text-[10px] text-slate-500 block">For late returns</span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Max Books Limit</span>
                      <span className="text-sm font-extrabold text-slate-900">{library.max_books_per_member ?? 3} Books</span>
                      <span className="text-[10px] text-slate-500 block">Concurrent loans per member</span>
                    </div>
                  </div>

                  {library.borrowing_rules && (
                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-1 mt-2">
                      <span className="text-[11px] font-bold text-amber-900 block uppercase tracking-wider">Borrowing Rules</span>
                      <p className="text-xs text-amber-950/90 whitespace-pre-line leading-relaxed">
                        {library.borrowing_rules}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-xs sm:text-sm text-slate-600"
              >
                {library.phone && (
                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <Phone className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider mb-0.5">Phone Contact</span>
                      <span className="text-slate-700 font-semibold">{library.phone}</span>
                    </div>
                  </div>
                )}

                {library.email && (
                  <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <Mail className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider mb-0.5">Email Address</span>
                      <span className="text-slate-700 font-semibold break-all">{library.email}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <MapPin className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider mb-0.5">Province / Location</span>
                    <span className="text-slate-700 font-semibold">{library.city ? `Province: ${library.city}` : (library.address || 'Phnom Penh, Cambodia')}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <Clock className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider mb-0.5">Opening Hours</span>
                    <span className="text-slate-700 font-semibold">{library.opening_hours && !library.opening_hours.includes('Mollitia') ? library.opening_hours : 'Mon - Sat: 08:00 AM - 05:00 PM'}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'location' && (
              <motion.div
                key="location"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-xs sm:text-sm text-slate-600"
              >
                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <MapPin className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">Physical Address</span>
                    <p className="text-slate-700 font-medium">{library.address || 'Phnom Penh, Cambodia'}</p>
                  </div>
                </div>

                {library.google_maps_url && (
                  <div className="pt-2">
                    <a
                      href={library.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all"
                    >
                      <span>Get Directions</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'collections' && (
              <motion.div
                key="collections"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs"
              >
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center space-y-1">
                  <span className="text-slate-500 text-[11px] font-semibold block uppercase tracking-wider">Total Books</span>
                  <span className="text-2xl font-extrabold text-slate-900">{totalBooksCount}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center space-y-1">
                  <span className="text-slate-500 text-[11px] font-semibold block uppercase tracking-wider">Available Books</span>
                  <span className="text-2xl font-extrabold text-amber-700">{meta.total}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center space-y-1">
                  <span className="text-slate-500 text-[11px] font-semibold block uppercase tracking-wider">Categories</span>
                  <span className="text-2xl font-extrabold text-slate-900">{categories.length}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT CARD (1/3 width) — LIBRARY INFORMATION SUMMARY */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs h-fit">
          <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
            Library Information
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100/80">
              <span className="text-slate-500 font-medium">Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/80 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ● Open
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100/80">
              <span className="text-slate-500 font-medium">Borrow Period</span>
              <span className="font-extrabold text-slate-900">{library.borrowing_period_days ?? 14} Days</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100/80">
              <span className="text-slate-500 font-medium">Fine Per Day</span>
              <span className="font-extrabold text-amber-700">${Number(library.fine_per_day ?? 0.50).toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100/80">
              <span className="text-slate-500 font-medium">Max Books / Member</span>
              <span className="font-extrabold text-slate-900">{library.max_books_per_member ?? 3} Books</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100/80">
              <span className="text-slate-500 font-medium">Province / Location</span>
              <span className="font-extrabold text-slate-900 text-right truncate max-w-[130px]" title={library.city || library.address}>
                {library.city || library.address || 'Phnom Penh'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100/80">
              <span className="text-slate-500 font-medium">Opening Hours</span>
              <span className="font-extrabold text-slate-900 text-right truncate max-w-[140px]" title={library.opening_hours || 'Mon - Sat: 08:00 AM - 05:00 PM'}>
                {library.opening_hours && !library.opening_hours.includes('Mollitia') ? library.opening_hours : '08:00 AM - 05:00 PM'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100/80">
              <span className="text-slate-500 font-medium">Book Collections</span>
              <span className="font-extrabold text-slate-900">{totalBooksCount}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100/80">
              <span className="text-slate-500 font-medium">Available Books</span>
              <span className="font-extrabold text-amber-700">{meta.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP RATED BOOKS SECTION */}
      <LibraryTopRatedBooks libraryId={id} libraryName={library.name} />

      {/* LIBRARY REVIEWS SECTION */}
      <LibraryReviews libraryId={id} initialReviewsCount={library.reviews_count || 0} />

      {/* PART 3 — BOOKS AT THIS LIBRARY & LIBRARY-SPECIFIC CATEGORY FILTERS */}
      <div ref={booksGridRef} className="space-y-6 pt-4 border-t border-slate-200/80">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Books at this Library</h2>
              <p className="text-xs text-slate-500">Browse catalogue holdings available at {library.name}</p>
            </div>
          </div>

          {(search || categoryId || sort !== 'latest' || page > 1) && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Filter Toolbar: Search + Library-Specific Categories + Sort */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-xs">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, author, ISBN..."
              value={search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition-all"
            />
            {search && (
              <button
                onClick={() => updateFilters({ search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Library-Specific Category Dropdown */}
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => updateFilters({ category_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium cursor-pointer"
            >
              <option value="">All Categories in this library</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium cursor-pointer"
            >
              <option value="latest">Newest Added</option>
              <option value="top_rated">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Real-time Count Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-600" />
            <span>
              Showing <strong className="text-slate-900">{startItem}–{endItem}</strong> of <strong className="text-slate-900">{meta.total}</strong> books
            </span>
          </div>
        </div>

        {/* Book Grid Container */}
        {loadingBooks ? (
          /* Skeleton Loading Cards */
          <BookSkeleton count={10} />
        ) : books.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto text-amber-600">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {search || categoryId ? 'No matching books found' : 'No books available yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {search || categoryId
                ? 'We couldn\'t find any books at this library matching your active filters.'
                : 'This library has not added any books to its catalogue yet.'}
            </p>
            <div className="pt-2">
              {search || categoryId ? (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Clear filters</span>
                </button>
              ) : (
                <Link
                  to="/libraries"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  <span>Browse other libraries</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* Book Cards Grid & Pagination Bar */
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
              {books.map((b) => (
                <BookCard
                  key={b.id}
                  book={{ ...b, library: { id: library.id, name: library.name } }}
                />
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
