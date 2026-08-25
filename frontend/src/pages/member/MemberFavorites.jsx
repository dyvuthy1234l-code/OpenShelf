import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bookmark, BookOpen, Trash2, ArrowRight, Building2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import memberService from '../../services/memberService';
import { PAGE_MOTION_VARIANTS, LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';
import Pagination from '../../components/public/Pagination';
import EmptyState from '../../components/public/EmptyState';
import ErrorState from '../../components/public/ErrorState';
import BookSkeleton from '../../components/common/BookSkeleton';
import { getBookCoverUrl } from '../../utils/imageUrl';

export default function MemberFavorites() {
  const { toggleFavorite } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const ITEMS_PER_PAGE = 12;
  const [favorites, setFavorites] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: ITEMS_PER_PAGE, total: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [erroredCovers, setErroredCovers] = useState({});

  const fetchFavorites = useCallback(async (pageToFetch = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await memberService.getFavorites({ page: pageToFetch, per_page: ITEMS_PER_PAGE });
      
      const items = res.data || [];
      setFavorites(items);

      if (res.meta) {
        setMeta({
          current_page: res.meta.current_page || pageToFetch,
          last_page: res.meta.last_page || 1,
          per_page: res.meta.per_page || ITEMS_PER_PAGE,
          total: res.meta.total || 0,
        });
      } else {
        setMeta({
          current_page: 1,
          last_page: 1,
          per_page: ITEMS_PER_PAGE,
          total: items.length,
        });
      }
    } catch {
      setError('Failed to load saved books. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites(currentPage);
  }, [currentPage, fetchFavorites]);

  const handlePageChange = (newPage) => {
    if (newPage === currentPage || newPage < 1 || newPage > meta.last_page) return;
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemove = async (favId, bookId, bookTitle) => {
    try {
      setRemovingId(favId);
      await toggleFavorite(bookId);

      setToastMessage(`"${bookTitle || 'Book'}" removed from saved favorites.`);
      setTimeout(() => setToastMessage(''), 3500);

      // Check if this was the last item on the page
      if (favorites.length === 1 && currentPage > 1) {
        setSearchParams({ page: (currentPage - 1).toString() });
      } else {
        fetchFavorites(currentPage);
      }
    } catch {
      alert('Failed to remove saved book. Please try again.');
    } finally {
      setRemovingId(null);
    }
  };

  const fromCount = meta.total > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0;
  const toCount = meta.total > 0 ? Math.min(meta.current_page * meta.per_page, meta.total) : 0;

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 text-gold-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" />
            <span>Saved Wishlist</span>
          </div>
          <h1 className="os-section-title">Your Favorite Books</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Books you saved for future reading
            {!loading && meta.total > 0 && (
              <> · <strong className="font-bold tabular-nums text-navy-800">{meta.total}</strong> saved</>
            )}
          </p>
        </div>

        <Link
          to="/books"
          className="os-btn-gold shrink-0"
        >
          <BookOpen className="w-4 h-4" />
          <span>Browse Catalogue</span>
        </Link>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200/70 text-emerald-700 p-3 rounded-xl text-xs font-semibold">
          {toastMessage}
        </div>
      )}

      {/* Meta Counter */}
      {!loading && !error && meta.total > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>
            Showing <strong className="text-slate-900">{fromCount}–{toCount}</strong> of <strong className="text-slate-900">{meta.total}</strong> saved books
          </span>
          <span>Page {meta.current_page} of {meta.last_page}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <BookSkeleton count={10} />
      ) : error ? (
        <ErrorState message={error} />
      ) : meta.total === 0 ? (
        <EmptyState
          title="No saved books yet"
          description="Save books you want to read later and they will appear here."
          action={
            <Link
              to="/books"
              className="os-btn-gold"
            >
              <span>Browse Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          <motion.div variants={LIST_STAGGER} initial="initial" animate="animate" className="flex flex-wrap justify-center gap-5">
            {favorites.map((fav) => {
              const book = fav.book || {};
              const isAvailable = (book.available_quantity ?? book.quantity ?? 0) > 0;
              const coverErrored = !!erroredCovers[fav.id];

              return (
                <motion.div
                  key={fav.id}
                  variants={LIST_ITEM}
                  className="os-card flex flex-col h-full group w-full sm:w-[calc(50%_-_0.625rem)] md:w-[calc(33.333%_-_0.833rem)] lg:w-[calc(25%_-_0.9375rem)]"
                >
                  <div className="relative aspect-[3/4] w-full bg-slate-100/80 overflow-hidden flex items-center justify-center group/cover">
                    {book.cover_image_url && !coverErrored ? (
                      <img
                        src={getBookCoverUrl(book.cover_image_url, 400)}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={() => setErroredCovers((prev) => ({ ...prev, [fav.id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-slate-200 via-white to-slate-100 flex flex-col items-center justify-center p-4 text-center">
                        <BookOpen className="w-12 h-12 text-gold-600/70 mb-3" />
                        <span className="text-xs text-slate-700 font-bold line-clamp-3 leading-snug px-4">{book.title}</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleRemove(fav.id, book.id, book.title)}
                      disabled={removingId === fav.id}
                      title="Remove from favorites"
                      aria-label={`Remove ${book.title || 'book'} from favorites`}
                      className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-brand-border rounded-xl transition-colors shadow-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 flex flex-col flex-grow bg-white">
                    <h3 className="text-base font-bold text-navy-900 group-hover:text-gold-600 transition-colors line-clamp-1 mb-1">
                      {book.title || 'Book Title'}
                    </h3>

                    <p className="text-xs text-slate-500 mb-3 line-clamp-1">{book.author || 'Author'}</p>

                    {book.library?.name && (
                      <div className="flex items-center gap-1.5 text-xs text-navy-800 bg-navy-50 border border-brand-border px-3 py-1.5 rounded-xl mb-4">
                        <Building2 className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                        <span className="line-clamp-1 font-semibold">{book.library.name}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                      <div>
                        {isAvailable ? (
                          <span className="os-badge-success">
                            <CheckCircle2 className="w-3 h-3" />
                            Available
                          </span>
                        ) : (
                          <span className="os-badge-danger">
                            <XCircle className="w-3 h-3" />
                            Borrowed
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/books/${book.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-gold-600 hover:text-gold-500"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Pagination */}
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </motion.div>
  );
}


