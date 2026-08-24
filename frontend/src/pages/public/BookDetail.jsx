import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  BookOpen, Building2, User, CheckCircle2, XCircle, ArrowLeft, Bookmark, 
  AlertCircle, LogIn, Star, MessageSquare, Send, Clock, 
  Calendar, Layers, Globe, ShieldAlert, Check, X, RefreshCw 
} from 'lucide-react';
import publicService from '../../services/publicService';
import memberService from '../../services/memberService';
import { useAuth } from '../../context/AuthContext';
import BookCard from '../../components/public/BookCard';
import LoadingState from '../../components/public/LoadingState';
import ErrorState from '../../components/public/ErrorState';

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
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
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
  const hasRating = avgRating > 0;

  return (
    <>
      <Helmet>
        <title>{book.title} | OpenShelf</title>
        <meta name="description" content={book.description || `Borrow ${book.title} from OpenShelf.`} />
        <meta property="og:title" content={book.title} />
        <meta property="og:description" content={book.description || `Borrow ${book.title} from OpenShelf.`} />
        {book.cover_image_url && <meta property="og:image" content={book.cover_image_url} />}
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-20">
        {/* 1. Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {book.category?.name && (
          <span className="text-xs text-slate-400 font-semibold">
            {book.category.name}
          </span>
        )}
      </div>

      {/* 2. BOOK DETAIL HERO (2-COLUMN LAYOUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs">
        {/* LEFT: Book Cover */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="w-full max-w-sm h-80 sm:h-96 bg-slate-100/90 border border-slate-200/80 rounded-2xl p-6 flex items-center justify-center shadow-md relative overflow-hidden group">
            {book.cover_image_url ? (
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="h-full w-auto max-w-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-44 h-64 bg-gradient-to-tr from-slate-200 via-white to-slate-100 border border-slate-300 rounded-xl shadow-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
                <BookOpen className="w-12 h-12 text-amber-600/70" />
                <span className="text-xs font-extrabold text-slate-800 line-clamp-3 leading-snug">{book.title}</span>
              </div>
            )}

            {/* Category Overlay Tag */}
            {book.category?.name && (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 px-3 py-1 rounded-full text-xs font-extrabold shadow-xs">
                {book.category.name}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Book Meta & Action Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Title & Author */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {book.title}
            </h1>
            {book.author && (
              <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
                <User className="w-4 h-4 text-amber-600 shrink-0" />
                <span>By {book.author}</span>
              </div>
            )}
          </div>

          {/* Rating Badge */}
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(avgRating) ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-slate-900 font-extrabold">{avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'}</span>
            <span className="text-slate-400 font-normal">({totalReviews} {totalReviews === 1 ? 'rating' : 'ratings'})</span>
          </div>

          {/* Synopsis */}
          {book.description && (
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
              {book.description}
            </p>
          )}

          {/* Availability Info & Holding Library */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Availability</span>
              <div className="flex items-center gap-2">
                {isAvailable ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 font-extrabold text-xs sm:text-sm">
                      ✓ {availableQty} of {totalQty} copies available now
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span className="text-rose-700 font-extrabold text-xs sm:text-sm">
                      × Currently unavailable (0 copies available)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Holding Library Name */}
            {book.library?.name && (
              <Link
                to={`/libraries/${book.library_id || book.library?.id}`}
                className="flex items-center gap-1.5 text-xs text-amber-800 font-bold bg-amber-50 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 transition-colors px-3 py-1.5 rounded-xl shrink-0 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate max-w-[200px]">{book.library.name}</span>
              </Link>
            )}
          </div>

          {/* Toast / Alert Banners */}
          {requestSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{requestSuccess}</span>
            </div>
          )}

          {requestError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{requestError}</span>
            </div>
          )}

          {waitlistMessage && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{waitlistMessage}</span>
            </div>
          )}

          {/* MAIN ACTION BUTTONS ROW */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            {/* Primary Action Button (Borrow / Waitlist / Status) */}
            {!isAuthenticated ? (
              <button
                onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Request</span>
              </button>
            ) : user?.role !== 'member' ? (
              <div className="flex-1 px-4 py-3 bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold rounded-xl text-center">
                Librarians / Admins cannot request member loans
              </div>
            ) : activeBorrowing ? (
              <div className="flex-1 flex items-center justify-between gap-3 px-5 py-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-extrabold shadow-xs">
                <span className="flex items-center gap-2 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-amber-600" />
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
                <Link to="/member/borrowings" className="text-amber-700 underline text-[11px]">
                  View Record
                </Link>
              </div>
            ) : isAvailable ? (
              <button
                onClick={() => setShowBorrowModal(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>Request to Borrow</span>
              </button>
            ) : (
              <button
                onClick={handleWaitlistToggle}
                disabled={processingWaitlist}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
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
              className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border text-xs font-extrabold transition-all shadow-xs shrink-0 ${
                isSaved
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-300'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-slate-950 text-slate-950' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. BOOK OVERVIEW (DESCRIPTION + METADATA GRID) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <h3 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
          Book Overview
        </h3>

        <div className="space-y-4">
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
            {book.description || 'No detailed synopsis has been provided for this book.'}
          </p>

          {/* Book Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-slate-100 text-xs">
            {book.isbn && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">ISBN</span>
                <span className="font-bold text-slate-800">{book.isbn}</span>
              </div>
            )}

            {book.category?.name && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Category</span>
                <span className="font-bold text-slate-800">{book.category.name}</span>
              </div>
            )}

            {book.publisher && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Publisher</span>
                <span className="font-bold text-slate-800">{book.publisher}</span>
              </div>
            )}

            {book.published_at && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Published</span>
                <span className="font-bold text-slate-800">
                  {new Date(book.published_at).toLocaleDateString()}
                </span>
              </div>
            )}

            {book.language && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Language</span>
                <span className="font-bold text-slate-800">{book.language}</span>
              </div>
            )}

            {book.pages && (
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Pages</span>
                <span className="font-bold text-slate-800">{book.pages}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. HOLDING LIBRARY INFORMATION & SPECIFIC LENDING POLICIES */}
      {book.library && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5 min-w-0">
              <span className="text-[10px] text-amber-700 uppercase font-extrabold tracking-wider block">Holding Library</span>
              <h4 className="text-lg font-extrabold text-slate-900 truncate">{book.library.name}</h4>
              {book.library.address && (
                <p className="text-xs text-slate-500 truncate">📍 {book.library.address}</p>
              )}
            </div>

            <Link
              to={`/libraries/${book.library.id}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all shrink-0"
            >
              <span>View Library Profile</span>
              <Building2 className="w-4 h-4 text-amber-600" />
            </Link>
          </div>

          {/* Dynamic Library Parameters Policy Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Borrow Period</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900">{book.library.borrowing_period_days ?? 14} Days</span>
              <span className="text-[10px] text-slate-500 block">Set by this library</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fine Per Day</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900">${Number(book.library.fine_per_day ?? 0.50).toFixed(2)}</span>
              <span className="text-[10px] text-slate-500 block">Late return charge</span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Max Books / Member</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900">{book.library.max_books_per_member ?? 3} Books</span>
              <span className="text-[10px] text-slate-500 block">Concurrent borrowing limit</span>
            </div>
          </div>
        </div>
      )}

      {/* 5. READER REVIEWS & RATINGS SECTION */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-600" />
            <h3 className="text-xl font-extrabold text-slate-900">Reader Reviews & Ratings</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
          </span>
        </div>

        {/* Review Submission Form for Members */}
        {isAuthenticated && user?.role === 'member' && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Leave a Rating & Review</h4>

            {reviewSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold">
                {reviewSuccess}
              </div>
            )}

            {reviewError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs font-semibold">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Your Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= userRating
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-extrabold text-amber-700 ml-2">{userRating} / 5 Stars</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Your Comment (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Share your thoughts about this book..."
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-amber-500 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
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
          <div className="py-8 text-center text-slate-400 text-xs italic">
            No reviews yet. Be the first to review this book!
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-slate-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center overflow-hidden shrink-0 border border-white shadow-xs">
                      {rev.user?.avatar_url ? (
                        <img src={rev.user.avatar_url} alt={rev.user.name} className="w-full h-full object-cover" />
                      ) : (
                        rev.user?.name ? rev.user.name[0].toUpperCase() : 'U'
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{rev.user?.name || 'Anonymous Reader'}</h5>
                      <span className="text-[10px] text-slate-400">
                        {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= (Number(rev.rating) || 0) ? 'fill-amber-400 text-amber-500' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-xs text-slate-600 leading-relaxed pl-12">
                    {rev.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. RELATED BOOKS ("YOU MAY ALSO LIKE") */}
      {relatedBooks.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              You May Also Like
            </h3>
            <Link to="/books" className="text-xs font-bold text-amber-700 hover:text-amber-800">
              View All Catalogue →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {relatedBooks.map((relBook) => (
              <BookCard key={relBook.id} book={relBook} />
            ))}
          </div>
        </div>
      )}

      {/* BORROW CONFIRMATION MODAL */}
      <AnimatePresence>
        {showBorrowModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                  <h3>Request Book Borrowing</h3>
                </div>
                <button
                  onClick={() => setShowBorrowModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-600">
                Are you sure you want to request to borrow this book?
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Book</span>
                  <span className="font-extrabold text-slate-900 text-sm block truncate">{book.title}</span>
                  {book.author && <span className="text-slate-500 block truncate">By {book.author}</span>}
                </div>

                {book.library?.name && (
                  <div className="pt-2 border-t border-slate-200/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Holding Library</span>
                      <span className="font-bold text-amber-700 truncate">{book.library.name}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                      <div>
                        <span className="text-slate-400 block font-semibold">Period</span>
                        <span className="font-extrabold text-slate-900">{book.library.borrowing_period_days ?? 14} Days</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Late Fine</span>
                        <span className="font-extrabold text-amber-700">${Number(book.library.fine_per_day ?? 0.50).toFixed(2)}/d</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Max Limit</span>
                        <span className="font-extrabold text-slate-900">{book.library.max_books_per_member ?? 3} Books</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                Your request will be sent to the library. Visit the library for physical pickup once approved.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowBorrowModal(false)}
                  disabled={requesting}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBorrowRequest}
                  disabled={requesting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
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
          </div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
}
