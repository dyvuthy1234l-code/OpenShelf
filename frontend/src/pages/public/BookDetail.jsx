import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  BookOpen, Building2, User, CheckCircle2, XCircle, ArrowLeft, Bookmark, 
  AlertCircle, LogIn, Star, MessageSquare, Send, Clock, 
  Check, X, RefreshCw 
} from 'lucide-react';
import publicService from '../../services/publicService';
import memberService from '../../services/memberService';
import { useAuth } from '../../context/AuthContext';
import BookCard from '../../components/public/BookCard';
import LoadingState from '../../components/public/LoadingState';
import ErrorState from '../../components/public/ErrorState';
import { LIST_STAGGER, LIST_ITEM, REVEAL_VARIANTS, MODAL_MOTION_VARIANTS, BACKDROP_MOTION_VARIANTS } from '../../constants/motionTokens';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, isBookFavorite, toggleFavorite } = useAuth();

  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Borrowing State
  const [activeBorrowing, setActiveBorrowing] = useState(null);
  const [waitlistEntry, setWaitlistEntry] = useState(null);

  // Borrowing confirmation modal
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');

  // Waitlist state
  const [processingWaitlist, setProcessingWaitlist] = useState(false);
  const [waitlistMessage, setWaitlistMessage] = useState('');

  // Save/Favorite state
  const [savingFav, setSavingFav] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ average_rating: 0, total_reviews: 0 });
  const [loadingReviews, setLoadingReviews] = useState(true);
  
  // Review submission form state
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const isSaved = isBookFavorite(id);

  // Load Book Details & Related Books
  const loadBookData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await publicService.getBook(id);
      const bookObj = data.data || data;
      setBook(bookObj);

      // Fetch related books in same category/library
      if (bookObj?.category_id || bookObj?.library_id) {
        try {
          const relRes = await publicService.getBooks({
            category_id: bookObj.category_id,
            library_id: bookObj.library_id,
            per_page: 5,
          });
          const relList = (relRes.data || []).filter((b) => b.id !== Number(id)).slice(0, 4);
          setRelatedBooks(relList);
        } catch {
          setRelatedBooks([]);
        }
      }
    } catch {
      setError('Book not found or is no longer available.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load Member Borrowing & Waitlist Status
  const loadMemberBookState = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'member') {
      setActiveBorrowing(null);
      setWaitlistEntry(null);
      return;
    }

    try {
      const borRes = await memberService.getBorrowings({ per_page: 100 });
      const borList = borRes.data || [];
      const currentActive = borList.find(
        (b) => b.book_id === Number(id) && ['pending', 'approved', 'borrowed', 'picked_up', 'overdue', 'return_requested'].includes(b.status)
      );
      setActiveBorrowing(currentActive || null);

      // Waitlist check if copies unavailable
      if (book && (book.available_quantity ?? 0) === 0) {
        const wlRes = await memberService.getWaitlistPosition(id);
        setWaitlistEntry(wlRes.data || null);
      }
    } catch {
      // Non-critical
    }
  }, [id, isAuthenticated, user, book]);

  // Load Reviews Data
  const loadReviewsData = useCallback(async () => {
    try {
      setLoadingReviews(true);
      const res = await publicService.getBookReviews(id);
      setReviews(res.data || []);
      if (res.summary) {
        setReviewSummary(res.summary);
      }
    } catch {
      // Non-critical
    } finally {
      setLoadingReviews(false);
    }
  }, [id]);

  useEffect(() => {
    loadBookData();
    loadReviewsData();
  }, [loadBookData, loadReviewsData]);

  useEffect(() => {
    if (book) {
      loadMemberBookState();
    }
  }, [book, loadMemberBookState]);

  // Toggle Save / Favorite
  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    try {
      setSavingFav(true);
      await toggleFavorite(id);
    } catch {
      // Error handled by AuthContext
    } finally {
      setSavingFav(false);
    }
  };

  // Submit Borrowing Request
  const handleConfirmBorrowRequest = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (user?.role !== 'member') {
      setRequestError('Only members can request book borrowings.');
      setShowBorrowModal(false);
      return;
    }

    try {
      setRequesting(true);
      setRequestError('');
      setRequestSuccess('');
      const res = await publicService.requestBorrowing(id);
      setRequestSuccess('Borrow request submitted successfully. You can track it in My Borrowings.');
      setShowBorrowModal(false);
      setActiveBorrowing(res.data || { status: 'pending' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit borrowing request.';
      setRequestError(msg);
      setShowBorrowModal(false);
    } finally {
      setRequesting(false);
    }
  };

  // Join / Leave Waitlist
  const handleWaitlistToggle = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    try {
      setProcessingWaitlist(true);
      setWaitlistMessage('');

      if (waitlistEntry) {
        await memberService.leaveWaitlist(id);
        setWaitlistEntry(null);
        setWaitlistMessage('You left the waitlist.');
      } else {
        const res = await memberService.joinWaitlist(id);
        setWaitlistEntry(res.data || { position: 1 });
        setWaitlistMessage('You joined the waitlist successfully.');
      }
    } catch (err) {
      setWaitlistMessage(err.response?.data?.message || 'Failed to update waitlist status.');
    } finally {
      setProcessingWaitlist(false);
    }
  };

  // Submit Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (user?.role !== 'member') {
      setReviewError('Only members can submit reviews.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError('');
      setReviewSuccess('');
      await memberService.submitBookReview(id, {
        rating: userRating,
        comment: userComment,
      });

      setReviewSuccess('Your review has been submitted successfully!');
      setUserComment('');
      loadReviewsData();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingState message="Fetching book details..." />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 space-y-6 text-center">
        <ErrorState message={error || 'Book not found'} />
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex min-h-11 items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Previous Page</span>
        </button>
      </div>
    );
  }

  const isAvailable = (book.available_quantity ?? book.quantity ?? 0) > 0;
  const availableQty = book.available_quantity ?? 0;
  const totalQty = book.quantity ?? 0;

  const rawAvg = reviewSummary?.average_rating ?? book.reviews_avg_rating ?? 0;
  const avgRating = Number(rawAvg) || 0;
  const totalReviews = Number(reviewSummary?.total_reviews ?? book.reviews_count ?? 0);

  return (
    <>
      <Helmet>
        <title>{book.title} | OpenShelf</title>
        <meta name="description" content={book.description || `Borrow ${book.title} from OpenShelf.`} />
        <meta property="og:title" content={book.title} />
        <meta property="og:description" content={book.description || `Borrow ${book.title} from OpenShelf.`} />
        {book.cover_image_url && <meta property="og:image" content={book.cover_image_url} />}
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-[calc(9rem+env(safe-area-inset-bottom))] md:pb-20">
        {/* 1. Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {book.category?.name && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              {book.category.name}
            </span>
          )}
        </div>

        {/* 2. BOOK DETAIL HERO (2-COLUMN LAYOUT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs">
          {/* LEFT: Book Cover */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="w-full max-w-sm h-80 sm:h-96 bg-slate-100/90 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 flex items-center justify-center shadow-md relative overflow-hidden group">
              {book.cover_image_url ? (
                <motion.img
                  src={book.cover_image_url}
                  alt={book.title}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full w-auto max-w-full object-contain drop-shadow-xl"
                />
              ) : (
                <div className="w-44 h-64 bg-gradient-to-tr from-slate-200 via-white to-slate-100 dark:from-slate-900 dark:via-slate-850 dark:to-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <BookOpen className="w-12 h-12 text-amber-500/70" />
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 line-clamp-3 leading-snug">{book.title}</span>
                </div>
              )}

              {/* Category Overlay Tag */}
              {book.category?.name && (
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-white/20 text-slate-100 px-3 py-1 rounded-full text-xs font-black shadow-sm select-none">
                  {book.category.name}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Book Meta & Action Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title & Author */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {book.title}
              </h1>
              {book.author && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-semibold text-sm">
                  <User className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>By {book.author}</span>
                </div>
              )}
            </div>

            {/* Rating Badge */}
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(avgRating) ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-slate-900 dark:text-white font-extrabold">{avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'}</span>
              <span className="text-slate-400 font-normal">({totalReviews} {totalReviews === 1 ? 'rating' : 'ratings'})</span>
            </div>

            {/* Synopsis (clamped — full text in Overview below) */}
            {book.description && (
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal line-clamp-3">
                {book.description}
              </p>
            )}

            {/* Availability Info & Holding Library */}
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2">
                    {isAvailable ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-xs sm:text-sm">
                          {availableQty} of {totalQty} copies available now
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        <span className="text-rose-700 dark:text-rose-400 font-extrabold text-xs sm:text-sm">
                          Currently unavailable (0 copies available)
                        </span>
                      </>
                    )}
                  </div>

                  {/* Copies progress bar */}
                  {totalQty > 0 && (
                    <div className="h-1.5 w-full max-w-xs rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isAvailable ? 'bg-emerald-500' : 'bg-rose-400'}`}
                        style={{ width: `${Math.round((availableQty / totalQty) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Holding Library Name */}
                {book.library?.name && (
                  <Link
                    to={`/libraries/${book.library_id || book.library?.id}`}
                    className="inline-flex min-h-11 items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300 font-bold bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors px-3 py-1.5 rounded-xl shrink-0 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="truncate max-w-[200px]">{book.library.name}</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Toast / Alert Banners */}
            {requestSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{requestSuccess}</span>
              </div>
            )}

            {requestError && (
              <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{requestError}</span>
              </div>
            )}

            {waitlistMessage && (
              <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{waitlistMessage}</span>
              </div>
            )}

            {/* MAIN ACTION BUTTONS ROW */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {/* Primary Action Button (Borrow / Waitlist / Status) */}
              {!isAuthenticated ? (
                <button
                  onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
                  className="os-btn-gold flex-1"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Request</span>
                </button>
              ) : user?.role !== 'member' ? (
                <div className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl text-center">
                  Librarians / Admins cannot request member loans
                </div>
              ) : activeBorrowing ? (
                <div className="flex-1 flex items-center justify-between gap-3 px-5 py-3 bg-amber-50 dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl text-amber-900 dark:text-amber-300 text-xs font-extrabold shadow-xs">
                  <span className="flex items-center gap-2 uppercase tracking-wider">
                    <Clock className="w-4 h-4 text-amber-500" />
                    {activeBorrowing.status === 'pending'
                      ? 'Request Pending'
                      : activeBorrowing.status === 'approved'
                      ? 'Approved - Await Pickup'
                      : activeBorrowing.status === 'return_requested'
                      ? 'Return Requested'
                      : activeBorrowing.status === 'overdue'
                      ? 'Overdue - Return Required'
                      : 'Currently Borrowed'}
                  </span>
                  <Link to="/member/borrowings" className="text-amber-600 dark:text-amber-400 underline text-[11px]">
                    View Record
                  </Link>
                </div>
              ) : isAvailable ? (
                <button
                  onClick={() => setShowBorrowModal(true)}
                  className="os-btn-gold flex-1 min-h-12 text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Request to Borrow</span>
                </button>
              ) : (
                <button
                  onClick={handleWaitlistToggle}
                  disabled={processingWaitlist}
                  className="os-btn-primary flex-1 min-h-12 text-sm"
                >
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>
                    {processingWaitlist
                      ? 'Processing...'
                      : waitlistEntry
                      ? `Leave Waitlist (Position #${waitlistEntry.position || 1})`
                      : 'Join Waitlist'}
                  </span>
                </button>
              )}

              {/* Save / Favorite Button */}
              <button
                onClick={handleSaveToggle}
                disabled={savingFav}
                className={`inline-flex min-h-11 items-center justify-center gap-2 px-5 rounded-xl border text-xs font-extrabold transition-all shadow-xs shrink-0 cursor-pointer ${
                  isSaved
                    ? 'bg-amber-400 text-navy-950 border-amber-400 shadow-md shadow-amber-400/20'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-600'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-navy-950 text-navy-950' : 'text-slate-700 dark:text-amber-400'}`} strokeWidth={2.4} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. BOOK OVERVIEW (DESCRIPTION + METADATA GRID) */}
        <motion.div {...REVEAL_VARIANTS} className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
            Book Overview
          </h3>

          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {book.description || 'No detailed synopsis has been provided for this book.'}
            </p>

            {/* Book Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              {book.isbn && (
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">ISBN</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{book.isbn}</span>
                </div>
              )}

              {book.category?.name && (
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">Category</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{book.category.name}</span>
                </div>
              )}

              {book.publisher && (
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">Publisher</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{book.publisher}</span>
                </div>
              )}

              {book.published_at && (
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">Published</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {new Date(book.published_at).toLocaleDateString()}
                  </span>
                </div>
              )}

              {book.language && (
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">Language</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{book.language}</span>
                </div>
              )}

              {book.pages && (
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">Pages</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{book.pages}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* 4. HOLDING LIBRARY INFORMATION & SPECIFIC LENDING POLICIES */}
        {book.library && (
          <motion.div {...REVEAL_VARIANTS} className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1.5 min-w-0">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-extrabold tracking-wider block">Holding Library</span>
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">{book.library.name}</h4>
                {book.library.address && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">📍 {book.library.address}</p>
                )}
              </div>

              <Link
                to={`/libraries/${book.library.id}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all shrink-0 cursor-pointer"
              >
                <span>View Library Profile</span>
                <Building2 className="w-4 h-4 text-amber-500" />
              </Link>
            </div>

            {/* Dynamic Library Parameters Policy Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Borrow Period</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">{book.library.borrowing_period_days ?? 14} Days</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Set by this library</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Fine Per Day</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">${Number(book.library.fine_per_day ?? 0.50).toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Late return charge</span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-1">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Max Books / Member</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">{book.library.max_books_per_member ?? 3} Books</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Concurrent borrowing limit</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 5. READER REVIEWS & RATINGS SECTION */}
        <motion.div {...REVEAL_VARIANTS} className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Reader Reviews & Ratings</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>

          {/* Review Submission Form for Members */}
          {isAuthenticated && user?.role === 'member' && (
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Leave a Rating & Review</h4>

              {reviewSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 p-3.5 rounded-xl text-xs font-semibold">
                  {reviewSuccess}
                </div>
              )}

              {reviewError && (
                <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 p-3.5 rounded-xl text-xs font-semibold">
                  {reviewError}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Your Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        aria-label={`Rate ${star} star${star === 1 ? '' : 's'}`}
                        className="flex h-11 w-11 items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= userRating
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 ml-2">{userRating} / 5 Stars</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Your Comment (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Share your thoughts about this book..."
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="os-input h-auto py-3"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="os-btn-gold"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReview ? 'Submitting...' : 'Submit Review'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Existing Reviews List */}
          {loadingReviews ? (
            <LoadingState message="Loading reader reviews..." />
          ) : reviews.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs italic">
              No reviews yet. Be the first to review this book!
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
              {reviews.map((rev) => (
                <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center overflow-hidden shrink-0 border border-white dark:border-slate-700 shadow-xs">
                        {rev.user?.avatar_url ? (
                          <img src={rev.user.avatar_url} alt={rev.user.name} className="w-full h-full object-cover" />
                        ) : (
                          rev.user?.name ? rev.user.name[0].toUpperCase() : 'U'
                        )}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">{rev.user?.name || 'Anonymous Reader'}</h5>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= (Number(rev.rating) || 0) ? 'fill-amber-400 text-amber-500' : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {rev.comment && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-12">
                      {rev.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* 6. RELATED BOOKS ("YOU MAY ALSO LIKE") */}
        {relatedBooks.length > 0 && (
          <motion.div {...REVEAL_VARIANTS} className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-4">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                You May Also Like
              </h3>
              <Link to="/books" className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:text-gold-500">
                View All Catalogue →
              </Link>
            </div>

            <motion.div
              variants={LIST_STAGGER}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-60px' }}
              className="flex flex-wrap justify-center gap-5"
            >
              {relatedBooks.map((relBook) => (
                <motion.div key={relBook.id} variants={LIST_ITEM} className="w-full sm:w-[calc(50%_-_0.625rem)] md:w-[calc(33.333%_-_0.833rem)] lg:w-[calc(20%_-_1rem)]">
                  <BookCard book={relBook} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* BORROW CONFIRMATION MODAL */}
        <AnimatePresence>
          {showBorrowModal && (
            <motion.div {...BACKDROP_MOTION_VARIANTS} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm">
              <motion.div
                {...MODAL_MOTION_VARIANTS}
                className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-lg">
                    <BookOpen className="w-5 h-5 text-amber-500" />
                    <h3>Request Book Borrowing</h3>
                  </div>
                  <button
                    onClick={() => setShowBorrowModal(false)}
                    aria-label="Close borrow request"
                    className="flex h-11 w-11 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Are you sure you want to request to borrow this book?
                </p>

                <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">Book</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm block truncate">{book.title}</span>
                    {book.author && <span className="text-slate-500 dark:text-slate-400 block truncate">By {book.author}</span>}
                  </div>

                  {book.library?.name && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Holding Library</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 truncate">{book.library.name}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center">
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block font-semibold">Period</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">{book.library.borrowing_period_days ?? 14} Days</span>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block font-semibold">Late Fine</span>
                          <span className="font-extrabold text-amber-600 dark:text-amber-400">${Number(book.library.fine_per_day ?? 0.50).toFixed(2)}/d</span>
                        </div>
                        <div>
                          <span className="text-slate-400 dark:text-slate-500 block font-semibold">Max Limit</span>
                          <span className="font-extrabold text-slate-900 dark:text-white">{book.library.max_books_per_member ?? 3} Books</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 font-medium">
                  Your request will be sent to the library. Visit the library for physical pickup once approved.
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowBorrowModal(false)}
                    disabled={requesting}
                    className="os-btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBorrowRequest}
                    disabled={requesting}
                    className="os-btn-gold"
                  >
                    {requesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm Request</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Sticky Borrow Action Bar */}
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 pt-3 pb-3 shadow-lg block md:hidden">
          <div className="flex items-center gap-2 max-w-7xl mx-auto">
            {!isAuthenticated ? (
              <button
                onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
                className="os-btn-gold flex-1"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Request</span>
              </button>
            ) : user?.role !== 'member' ? (
              <div className="flex-1 min-h-11 flex items-center justify-center px-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-bold rounded-xl text-center">
                Librarians / Admins cannot borrow
              </div>
            ) : activeBorrowing ? (
              <Link to="/member/borrowings" className="flex-1 min-h-11 flex items-center justify-center px-2 text-center bg-gold-50 dark:bg-slate-800 border border-gold-200 dark:border-gold-700/60 text-gold-600 dark:text-gold-300 text-xs font-bold rounded-xl truncate">
                {activeBorrowing.status === 'pending' ? 'Request Pending' : 'Currently Borrowed'} • View Record
              </Link>
            ) : isAvailable ? (
              <button
                onClick={() => setShowBorrowModal(true)}
                className="os-btn-gold flex-1"
              >
                <BookOpen className="w-4 h-4" />
                <span>Request to Borrow</span>
              </button>
            ) : (
              <button
                onClick={handleWaitlistToggle}
                disabled={processingWaitlist}
                className="os-btn-primary flex-1"
              >
                <Clock className="w-4 h-4 text-gold-400" />
                <span>{waitlistEntry ? 'Leave Waitlist' : 'Join Waitlist'}</span>
              </button>
            )}

            <button
              onClick={handleSaveToggle}
              disabled={savingFav}
              aria-label="Save book"
              className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                isSaved
                  ? 'bg-amber-400 text-navy-950 border-amber-400'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-navy-950 text-navy-950' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
