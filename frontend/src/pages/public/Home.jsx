import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, BookOpen, Building2, ArrowRight, CheckCircle2, 
  Sparkles, Library as LibraryIcon, ShieldCheck, Clock, Star, Sparkle 
} from 'lucide-react';
import publicService from '../../services/publicService';
import LibraryCard from '../../components/public/LibraryCard';
import BookCard from '../../components/public/BookCard';
import LibraryCardDeck from '../../components/public/LibraryCardDeck';
import HighlyRatedMarquee from '../../components/public/HighlyRatedMarquee';
import LoadingState from '../../components/public/LoadingState';
import ErrorState from '../../components/public/ErrorState';

export default function Home() {
  const navigate = useNavigate();
  const locationWord = 'Cambodia.';
  const [typedLocation, setTypedLocation] = useState('');
  const [libraries, setLibraries] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [recentlyAddedBooks, setRecentlyAddedBooks] = useState([]);
  const [highlyRatedBooks, setHighlyRatedBooks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setTypedLocation(locationWord);
      return undefined;
    }

    let cursor = 0;
    let deleting = false;
    const timer = window.setInterval(() => {
      if (!deleting) {
        cursor += 1;
        setTypedLocation(locationWord.slice(0, cursor));
        if (cursor === locationWord.length) deleting = true;
      } else {
        cursor -= 1;
        setTypedLocation(locationWord.slice(0, cursor));
        if (cursor === 0) deleting = false;
      }
    }, 145);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        setError(null);

        const [libRes, availRes, recentRes, ratedRes] = await Promise.allSettled([
          publicService.getLibraries({ per_page: 6 }),
          publicService.getBooks({ available_only: true, per_page: 8 }),
          publicService.getBooks({ sort: 'latest', per_page: 8 }),
          publicService.getBooks({ sort: 'top_rated', per_page: 12 }),
        ]);

        const libs = libRes.status === 'fulfilled' ? (libRes.value?.data || libRes.value?.libraries || []) : [];
        let avail = availRes.status === 'fulfilled' ? (availRes.value?.data || []) : [];
        const recent = recentRes.status === 'fulfilled' ? (recentRes.value?.data || []) : [];
        const rated = ratedRes.status === 'fulfilled' ? (ratedRes.value?.data || []) : [];

        // Ensure strict availability: only active books with available_quantity > 0
        avail = avail.filter((b) => b.status !== 'inactive' && Number(b.available_quantity ?? b.quantity ?? 0) > 0);

        setLibraries(libs);
        setAvailableBooks(avail);
        setRecentlyAddedBooks(recent);

        // Filter and rank highly rated books by rating evidence
        const filteredRated = rated.filter((b) => {
          const r = Number(b.reviews_avg_rating ?? b.rating ?? 0);
          return r > 0;
        });

        // Sort by quality evidence: reviews_count DESC, then reviews_avg_rating DESC
        filteredRated.sort((a, b) => {
          const countA = Number(a.reviews_count ?? a.rating_count ?? 0);
          const countB = Number(b.reviews_count ?? b.rating_count ?? 0);
          const rateA = Number(a.reviews_avg_rating ?? a.rating ?? 0);
          const rateB = Number(b.reviews_avg_rating ?? b.rating ?? 0);

          if (countB !== countA) return countB - countA;
          return rateB - rateA;
        });

        setHighlyRatedBooks(filteredRated.slice(0, 8));
      } catch {
        setError('Failed to load homepage resources. Please refresh or try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Motion container variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  const ratedItemVariants = {
    hidden: { opacity: 0, x: 70 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
      {/* 1. HERO SECTION — DEEP RICH NAVY FULL VIEWPORT */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center py-12 sm:py-20 bg-gradient-to-b from-[#061120] via-[#091A30] to-[#0D2440] text-white overflow-hidden border-b border-[#0D2440]">
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] sm:w-[50rem] h-[20rem] sm:h-[32rem] bg-[#D9A83E]/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-5 sm:space-y-6"
            >
              {/* Eyebrow / Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D9A83E]/10 border border-[#D9A83E]/30 text-[#D9A83E] text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#D9A83E]" />
                OPEN SHELF COLLECTION
              </div>

              {/* Editorial Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
                Discover books from libraries across{' '}
                <span
                  className="inline-flex min-w-[9ch] text-[#D9A83E]"
                  aria-label={locationWord}
                >
                  {typedLocation}
                  <span className="ml-1 inline-block w-1 h-[0.78em] self-center bg-[#D9A83E] rounded-full animate-pulse" aria-hidden="true" />
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-[#CBD5E1] text-sm sm:text-lg max-w-xl leading-relaxed">
                Connect with community libraries, browse physical catalogue collections, and borrow books with ease. Knowledge belongs to everyone.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleHeroSearch} className="pt-2 max-w-lg">
                <div className="relative flex items-center bg-[#091A30]/90 border border-[#DCE6F0]/20 focus-within:border-[#D9A83E] rounded-2xl p-1.5 sm:p-2 shadow-2xl transition-all">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8] ml-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by book title, author, or library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-[#94A3B8] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#D9A83E] hover:bg-[#C9962F] text-[#061120] text-xs font-black rounded-xl shadow-md shadow-[#D9A83E]/20 shrink-0 transition-all cursor-pointer"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 sm:gap-4 pt-2">
                <Link
                  to="/libraries"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-[#D9A83E] hover:bg-[#C9962F] text-[#061120] font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-[#D9A83E]/20 transition-all"
                >
                  <Building2 className="w-4 h-4 text-[#061120]" />
                  Explore Libraries
                </Link>
                <Link
                  to="/books"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-[#061120] hover:bg-[#091A30] text-white font-bold text-xs sm:text-sm rounded-xl border border-[#DCE6F0]/20 hover:border-[#D9A83E]/40 transition-all"
                >
                  <BookOpen className="w-4 h-4 text-[#D9A83E]" />
                  Browse Books
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 sm:pt-6 border-t border-[#0D2440] flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#CBD5E1]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#2D8A61]" />
                  <span>Verified Libraries</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D9A83E]" />
                  <span>Real-time Availability</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#F59E0B]" />
                  <span>Easy Pickups</span>
                </div>
              </div>
            </motion.div>

            {/* Right Side: Responsive LibraryCardDeck */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-6 flex justify-center lg:justify-end pt-4 lg:pt-0"
            >
              <LibraryCardDeck libraries={libraries} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 1. DISCOVER LIBRARIES — WHITE / SOFT GRAY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Building2 className="w-4 h-4" />
              <span>Network Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Discover Libraries</h2>
          </div>
          <Link
            to="/libraries"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors"
          >
            <span>View all libraries</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingState message="Loading community libraries..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : libraries.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
            No libraries currently active in the network.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {libraries.map((lib) => (
              <LibraryCard key={lib.id} library={lib} />
            ))}
          </div>
        )}
      </section>

      {/* 2. BOOKS AVAILABLE NOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Catalogue Highlights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Books Available Now</h2>
          </div>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors"
          >
            <span>Browse all books</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingState message="Loading book catalogue..." />
        ) : availableBooks.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No books are currently available.</h3>
            <p className="text-xs text-slate-500 font-medium">Check back later when copies are returned.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* 3. RECENTLY ADDED BOOKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Sparkle className="w-4 h-4 text-amber-500" />
              <span>RECENTLY ADDED</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Recently Added</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Discover the latest books added to the OpenShelf network.
            </p>
          </div>

          <Link
            to="/books"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors shrink-0"
          >
            <span>Browse all books</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingState message="Loading recently added books..." />
        ) : recentlyAddedBooks.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
            No recently added books yet.
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {recentlyAddedBooks.map((book) => (
              <motion.div key={`recent-${book.id}`} variants={itemVariants}>
                <BookCard book={book} showDateAdded={true} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* 4. HIGHLY RATED BOOKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4 border-b border-slate-200/80 pb-4"
        >
          <div>
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>HIGHLY RATED</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Highly Rated</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Books readers are enjoying across the OpenShelf network.
            </p>
          </div>

          <Link
            to="/books"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors shrink-0"
          >
            <span>Explore rated catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <HighlyRatedMarquee books={highlyRatedBooks} loading={loading} error={error} />
      </section>

      {/* 5. HOW OPENSHELF WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Simple & Seamless</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 mb-2">How OpenShelf Works</h2>
            <p className="text-slate-600 text-xs sm:text-sm">Borrow physical books from local libraries in 4 easy steps.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Search', desc: 'Browse books or physical libraries near you in Cambodia.' },
              { num: '02', title: 'Choose Library', desc: 'Select the community library holding your desired title.' },
              { num: '03', title: 'Request', desc: 'Reserve your copy online with your free member account.' },
              { num: '04', title: 'Pick Up', desc: 'Visit the library in person to collect and enjoy reading!' },
            ].map((step) => (
              <div
                key={step.num}
                className="group space-y-2.5 p-5 bg-slate-50 border border-slate-200/80 rounded-2xl transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md hover:bg-white hover:border-amber-400/60"
              >
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 group-hover:text-amber-500 transition-colors duration-200 block">
                  {step.num}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-950 transition-colors duration-200">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BECOME A LIBRARIAN CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <LibraryIcon className="w-3.5 h-3.5" />
                For Library Owners
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Own a library? Digitization starts here.
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                Join OpenShelf to manage your catalogue, track member borrowings, and bring your physical library to thousands of readers.
              </p>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <Link
                to="/become-librarian"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition-all"
              >
                <span>Become a Librarian</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
