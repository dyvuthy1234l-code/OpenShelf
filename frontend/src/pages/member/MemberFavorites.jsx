import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Bookmark, BookOpen, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import memberService from '../../services/memberService';
import { PAGE_MOTION_VARIANTS, LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';
import Pagination from '../../components/public/Pagination';
import EmptyState from '../../components/public/EmptyState';
import ErrorState from '../../components/public/ErrorState';
import BookCard from '../../components/public/BookCard';
import BookSkeleton from '../../components/common/BookSkeleton';

export default function MemberFavorites() {
  const { favoriteBookIds } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const ITEMS_PER_PAGE = 15;
  const [favorites, setFavorites] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: ITEMS_PER_PAGE, total: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fromCount = meta.total > 0 ? (meta.current_page - 1) * meta.per_page + 1 : 0;
  const toCount = meta.total > 0 ? Math.min(meta.current_page * meta.per_page, meta.total) : 0;

  // Filter out any books that were unfavorited via BookCard
  const displayFavorites = favorites.filter((fav) => {
    const bookId = fav.book?.id || fav.book_id;
    return bookId && favoriteBookIds.includes(Number(bookId));
  });

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bookmark className="w-4 h-4" />
            <span>Saved Wishlist</span>
          </div>
          <h1 className="os-section-title text-slate-900 dark:text-white">Your Favorite Books</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Books you saved for future reading
            {!loading && meta.total > 0 && (
              <> · <strong className="font-bold tabular-nums text-slate-900 dark:text-white">{displayFavorites.length}</strong> saved</>
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

      {/* Meta Counter */}
      {!loading && !error && displayFavorites.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{fromCount}–{toCount}</strong> of <strong className="text-slate-900 dark:text-white">{meta.total}</strong> saved books
          </span>
          <span>Page {meta.current_page} of {meta.last_page}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <BookSkeleton count={10} />
      ) : error ? (
        <ErrorState message={error} />
      ) : displayFavorites.length === 0 ? (
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
            {displayFavorites.map((fav) => {
              const book = fav.book || fav;
              if (!book || !book.id) return null;

              return (
                <motion.div
                  key={fav.id || book.id}
                  variants={LIST_ITEM}
                  className="w-full sm:w-[calc(50%_-_0.625rem)] md:w-[calc(33.333%_-_0.833rem)] lg:w-[calc(20%_-_1rem)]"
                >
                  <BookCard book={book} />
                </motion.div>
              );
            })}
          </motion.div>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </motion.div>
  );
}


