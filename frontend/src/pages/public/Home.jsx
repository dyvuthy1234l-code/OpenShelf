import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
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
import BookSkeleton from '../../components/common/BookSkeleton';
import LibrarySkeleton from '../../components/common/LibrarySkeleton';
import { LIST_STAGGER, LIST_ITEM, REVEAL_VARIANTS } from '../../constants/motionTokens';
import angkorHeroImg from '../../assets/angkor_hero.jpg';

export default function Home() {
  const navigate = useNavigate();
  const LOCATION_WORDS = useMemo(() => ['Cambodia.', 'Phnom Penh.', 'Siem Reap.', 'Battambang.', 'Kampong Cham.'], []);
  const [wordIdx, setWordIdx] = useState(0);
  const [typedLocation, setTypedLocation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [libraries, setLibraries] = useState([]);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [recentlyAddedBooks, setRecentlyAddedBooks] = useState([]);
  const [highlyRatedBooks, setHighlyRatedBooks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Continuous back and forth typewriter animation effect
  useEffect(() => {
    const currentWord = LOCATION_WORDS[wordIdx % LOCATION_WORDS.length];
    let timer;

    if (!isDeleting) {
      if (typedLocation.length < currentWord.length) {
        timer = setTimeout(() => {
          setTypedLocation(currentWord.slice(0, typedLocation.length + 1));
        }, 110);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (typedLocation.length > 0) {
        timer = setTimeout(() => {
          setTypedLocation(currentWord.slice(0, typedLocation.length - 1));
        }, 55);
      } else {
        setIsDeleting(false);
        setWordIdx((prev) => (prev + 1) % LOCATION_WORDS.length);
      }
    }

    return () => clearTimeout(timer);
  }, [typedLocation, isDeleting, wordIdx, LOCATION_WORDS]);

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        setError(null);

        const [libRes, availRes, recentRes, ratedRes] = await Promise.allSettled([
          publicService.getLibraries({ per_page: 6 }),
          publicService.getBooks({ available_only: true, per_page: 10 }),
          publicService.getBooks({ sort: 'latest', per_page: 10 }),
          publicService.getBooks({ sort: 'top_rated', per_page: 15 }),
        ]);

        const libs = libRes.status === 'fulfilled' ? (libRes.value?.data || libRes.value?.libraries || []) : [];
        let avail = availRes.status === 'fulfilled' ? (availRes.value?.data || []) : [];
        const recent = recentRes.status === 'fulfilled' ? (recentRes.value?.data || []) : [];
        const rated = ratedRes.status === 'fulfilled' ? (ratedRes.value?.data || []) : [];

        // Ensure strict availability: only active books with available_quantity > 0
        avail = avail.filter((b) => b.status !== 'inactive' && Number(b.available_quantity ?? b.quantity ?? 0) > 0);

        // Sort libraries by highest rating, then reviews count, then books count to get Top 1 to 3
        const sortedLibs = [...libs].sort((a, b) => {
          const rateA = Number(a.rating || a.reviews_avg_rating || 0);
          const rateB = Number(b.rating || b.reviews_avg_rating || 0);
          if (rateB !== rateA) return rateB - rateA;

          const booksA = Number(a.books_count ?? (a.books ? a.books.length : 0));
          const booksB = Number(b.books_count ?? (b.books ? b.books.length : 0));
          return booksB - booksA;
        });

        // Pass top 4 highest rated libraries
        setLibraries(sortedLibs.slice(0, 4));
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

        setHighlyRatedBooks(filteredRated.slice(0, 10));
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

  return (
    <>
      <Helmet>
        <title>OpenShelf | Discover & Borrow Books in Cambodia</title>
        <meta name="description" content="Connect with community libraries, browse physical catalogue collections, and borrow books with ease across Cambodia." />
        <meta property="og:title" content="OpenShelf" />
        <meta property="og:description" content="Connect with community libraries, browse physical catalogue collections, and borrow books with ease across Cambodia." />
      </Helmet>
      
      <div className="space-y-16 sm:space-y-24 pb-20 overflow-hidden">
          {/* 1. HERO SECTION — CUSTOM ANGKOR WAT & MODERN LIBRARY FUSION BACKGROUND */}
        <section
          className="relative py-14 sm:py-20 lg:py-24 bg-slate-950 bg-cover bg-center text-white overflow-hidden border-b border-slate-800"
          style={{ backgroundImage: `url(${angkorHeroImg})` }}
        >
          {/* Light Subtle Gradient Overlay — Sharp, Bright & Crystal Clear Background Image */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#040C16]/65 via-[#061426]/35 to-black/20 pointer-events-none" />

          {/* Decorative Ambient Warm Glow */}
          <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-[32rem] h-72 sm:h-[32rem] bg-amber-500/12 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
              {/* Left Content Column */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="lg:col-span-6 space-y-3.5 sm:space-y-4"
              >
                {/* Eyebrow / Badge */}
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-400 text-[11px] font-extrabold tracking-wider uppercase backdrop-blur-md shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>OPEN SHELF COLLECTION</span>
                </motion.div>

                {/* Editorial Headline */}
                <motion.h1 variants={itemVariants} className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white break-words drop-shadow-md">
                  Discover books from libraries across{' '}
                  <span
                    className="inline-flex min-w-[9ch] font-black text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)] [text-shadow:_0_0_30px_rgb(251_191_36_/_80%),_0_0_50px_rgb(245_158_11_/_60%)] filter brightness-125 saturate-150 transition-all duration-300"
                    aria-label={typedLocation || 'Cambodia.'}
                  >
                    {typedLocation}
                    <span className="ml-1.5 inline-block w-1.5 h-[0.78em] self-center bg-amber-300 rounded-full animate-pulse shadow-[0_0_15px_rgba(251,191,36,1)]" aria-hidden="true" />
                  </span>
                </motion.h1>

                {/* Supporting Text */}
                <motion.p variants={itemVariants} className="text-slate-200 text-xs sm:text-sm max-w-lg leading-relaxed font-semibold drop-shadow-xs">
                  Connect with community libraries, browse physical catalogue collections, and borrow books with ease. Knowledge belongs to everyone.
                </motion.p>

                {/* Search Bar */}
                <motion.form variants={itemVariants} onSubmit={handleHeroSearch} className="pt-1 max-w-lg w-full">
                  <div className="relative flex flex-col sm:flex-row bg-white/95 border border-white/40 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/40 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md transition-all gap-1.5 sm:gap-0 w-full">
                    <div className="flex flex-1 items-center min-w-0">
                      <Search className="w-4 h-4 text-slate-500 ml-2 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search by book title, author, or library..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent px-2.5 py-2 text-xs sm:text-sm text-slate-950 placeholder-slate-500 focus:outline-none font-bold truncate"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black rounded-xl shadow-md shrink-0 transition-all cursor-pointer"
                    >
                      Search
                    </button>
                  </div>
                </motion.form>

                {/* Category Pills */}
                <motion.div variants={itemVariants} className="pt-0.5 flex flex-wrap gap-1.5 items-center">
                  <span className="text-slate-300 text-xs font-extrabold mr-1">Trending:</span>
                  {['Fiction', 'Technology', 'Science', 'Design'].map(cat => (
                    <Link
                      key={cat}
                      to={`/books?search=${cat}`}
                      className="px-2.5 py-0.5 bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-white/20 hover:border-amber-400 rounded-lg text-[11px] font-extrabold backdrop-blur-md transition-all shadow-xs cursor-pointer"
                    >
                      {cat}
                    </Link>
                  ))}
                </motion.div>

                {/* Action Buttons */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-2.5 pt-1 w-full sm:w-auto">
                  <Link
                    to="/libraries"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-slate-950" />
                    <span>Explore Libraries</span>
                  </Link>
                  <Link
                    to="/books"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm rounded-xl border border-white/30 backdrop-blur-md transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Browse Books</span>
                  </Link>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div variants={itemVariants} className="pt-2.5 border-t border-white/15 flex flex-wrap items-center gap-4 text-xs text-slate-200 font-extrabold">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Verified Libraries</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    <span>Real-time Availability</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Easy Pickups</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Side: Responsive LibraryCardDeck */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="lg:col-span-6 flex justify-center lg:justify-end pt-3 lg:pt-0 w-full overflow-visible"
              >
                <LibraryCardDeck libraries={libraries} />
              </motion.div>
            </div>
          </div>
        </section>

      {/* 1. DISCOVER LIBRARIES — TOP RATED 1 TO 4 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...REVEAL_VARIANTS} className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-600 mb-1.5">
              <Building2 className="w-4 h-4" />
              <span>FEATURED PARTNERS</span>
            </div>
            <h2 className="os-section-title">Top Rated Libraries</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Top 1 to 4 highest rated community partner libraries open to readers across Cambodia.
            </p>
          </div>
          <motion.div initial="rest" whileHover="hover" className="inline-flex">
            <Link
              to="/libraries"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gold-600 hover:text-gold-500 transition-colors"
            >
              <span>View all libraries</span>
              <motion.span variants={{ rest: { x: 0 }, hover: { x: 6, transition: { type: 'spring', stiffness: 400 } } }} style={{ willChange: 'transform' }}>
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        {loading ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {[...Array(4)].map((_, i) => (
              <div key={`lib-skeleton-${i}`} className="w-full">
                <LibrarySkeleton />
              </div>
            ))}
          </motion.div>
        ) : error ? (
          <ErrorState message={error} />
        ) : libraries.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
            No libraries currently active in the network.
          </div>
        ) : (
          <motion.div
            variants={LIST_STAGGER}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {libraries.map((library, idx) => (
              <motion.div key={library.id} variants={LIST_ITEM} className="w-full">
                <LibraryCard library={library} rankIndex={idx} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* 2. BOOKS AVAILABLE NOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...REVEAL_VARIANTS} className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-600 mb-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Catalogue Highlights</span>
            </div>
            <h2 className="os-section-title">Books Available Now</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Physical copies ready to borrow right now.
            </p>
          </div>
            <Link
              to="/books"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gold-600 hover:text-gold-500 transition-colors"
            >
              <span>Browse all books</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

        {loading ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5"
          >
            {[...Array(10)].map((_, i) => (
              <BookSkeleton key={`book-skeleton-${i}`} />
            ))}
          </motion.div>
        ) : availableBooks.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No books are currently available.</h3>
            <p className="text-xs text-slate-500 font-medium">Check back later when copies are returned.</p>
          </div>
        ) : (
          <motion.div
            variants={LIST_STAGGER}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5"
          >
            {availableBooks.map((book) => (
              <motion.div key={book.id} variants={LIST_ITEM} className="h-full">
                <BookCard book={book} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* 3. RECENTLY ADDED BOOKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...REVEAL_VARIANTS} className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-600 mb-1.5">
              <Sparkle className="w-4 h-4 text-gold-500" />
              <span>Recently Added</span>
            </div>
            <h2 className="os-section-title">Recently Added</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Discover the latest books added to the OpenShelf network.
            </p>
          </div>

          <motion.div initial="rest" whileHover="hover" className="inline-flex">
            <Link
              to="/books"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gold-600 hover:text-gold-500 transition-colors shrink-0"
            >
              <span>Explore catalogue</span>
              <motion.span variants={{ rest: { x: 0 }, hover: { x: 6, transition: { type: 'spring', stiffness: 400 } } }} style={{ willChange: 'transform' }}>
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        {loading ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5"
          >
            {[...Array(10)].map((_, i) => (
              <BookSkeleton key={`recent-skeleton-${i}`} />
            ))}
          </motion.div>
        ) : recentlyAddedBooks.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
            No recently added books yet.
          </div>
        ) : (
          <motion.div
            variants={LIST_STAGGER}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5"
          >
            {recentlyAddedBooks.map((book) => (
              <motion.div key={`recent-${book.id}`} variants={LIST_ITEM} className="h-full">
                <BookCard book={book} showDateAdded={true} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* 4. HIGHLY RATED BOOKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          {...REVEAL_VARIANTS}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4 border-b border-slate-200/80 pb-4"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-600 mb-1.5">
              <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
              <span>Highly Rated</span>
            </div>
            <h2 className="os-section-title">Highly Rated</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Books readers are enjoying across the OpenShelf network.
            </p>
          </div>

          <motion.div initial="rest" whileHover="hover" className="inline-flex">
            <Link
              to="/books?sort=top_rated"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-gold-600 hover:text-gold-500 transition-colors shrink-0"
            >
              <span>Explore rated catalogue</span>
              <motion.span variants={{ rest: { x: 0 }, hover: { x: 6, transition: { type: 'spring', stiffness: 400 } } }} style={{ willChange: 'transform' }}>
                <ArrowRight className="w-4 h-4" />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        <HighlyRatedMarquee books={highlyRatedBooks} loading={loading} error={error} />
      </section>

      {/* 5. HOW OPENSHELF WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...REVEAL_VARIANTS} className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-gold-600 uppercase tracking-widest">Simple &amp; Seamless</span>
            <h2 className="os-section-title mt-1 mb-2 text-center">How OpenShelf Works</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Borrow physical books from local libraries in 4 easy steps.</p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-[45px] left-[12%] right-[12%] h-[2px] bg-slate-100 overflow-hidden rounded-full">
               <motion.div 
                 initial={{ x: '-100%' }}
                 whileInView={{ x: 0 }}
                 viewport={{ once: true, margin: '-50px' }}
                 transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
                 className="w-full h-full bg-amber-400"
                 style={{ willChange: 'transform' }}
               />
            </div>
            
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.2 } }
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
            >
              {[
                { num: '01', title: 'Search', desc: 'Browse books or physical libraries near you in Cambodia.' },
                { num: '02', title: 'Choose Library', desc: 'Select the community library holding your desired title.' },
                { num: '03', title: 'Request', desc: 'Reserve your copy online with your free member account.' },
                { num: '04', title: 'Pick Up', desc: 'Visit the library in person to collect and enjoy reading!' },
              ].map((step) => (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                  }}
                  style={{ willChange: 'transform' }}
                  key={step.num}
                  className="group space-y-2.5 p-5 bg-slate-50 border border-slate-200/80 rounded-2xl transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:bg-white hover:border-amber-400/60"
                >
                  <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 group-hover:text-amber-500 transition-colors duration-200 block">
                    {step.num}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-950 transition-colors duration-200">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 6. BECOME A LIBRARIAN CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...REVEAL_VARIANTS} className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
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
              <motion.div initial="rest" whileHover="hover">
                <Link
                  to="/become-librarian"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition-all"
                >
                  <span>Become a Librarian</span>
                  <motion.span variants={{ rest: { x: 0 }, hover: { x: 6, transition: { type: 'spring', stiffness: 400 } } }} style={{ willChange: 'transform' }}>
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>
      </div>
    </>
  );
}


