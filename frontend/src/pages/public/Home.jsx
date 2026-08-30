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
    const timer = window.setInterval(() => {
      cursor += 1;
      setTypedLocation(locationWord.slice(0, cursor));
      if (cursor === locationWord.length) {
        window.clearInterval(timer);
      }
    }, 120);

    return () => window.clearInterval(timer);
  }, []);

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
          {/* 1. HERO SECTION — LIGHT PREMIUM LIBRARY WEBSITE */}
        <section className="relative py-8 sm:py-12 lg:py-14 bg-[#FAF9F6] border-b border-slate-200/80 text-slate-900 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] sm:w-[40rem] h-[16rem] sm:h-[24rem] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
              {/* Left Content */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="lg:col-span-6 space-y-4 sm:space-y-5"
              >
                {/* Eyebrow / Badge */}
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/90 text-amber-900 text-[11px] font-extrabold tracking-wider uppercase shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>OPEN SHELF COLLECTION</span>
                </motion.div>

                {/* Editorial Headline */}
                <motion.h1 variants={itemVariants} className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-slate-900">
                  Discover books from libraries across{' '}
                  <span
                    className="inline-flex min-w-[9ch] text-amber-600 font-black"
                    aria-label={locationWord}
                  >
                    {typedLocation}
                    <span className="ml-1 inline-block w-1 h-[0.78em] self-center bg-amber-500 rounded-full animate-pulse" aria-hidden="true" />
                  </span>
                </motion.h1>

                {/* Supporting Text */}
                <motion.p variants={itemVariants} className="text-slate-600 text-xs sm:text-sm max-w-lg leading-relaxed font-medium">
                  Connect with community libraries, browse physical catalogue collections, and borrow books with ease. Knowledge belongs to everyone.
                </motion.p>

                {/* Search Bar */}
                <motion.form variants={itemVariants} onSubmit={handleHeroSearch} className="pt-1 max-w-lg">
                  <div className="relative flex flex-col sm:flex-row bg-white border border-slate-200/90 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 rounded-2xl p-1.5 shadow-md transition-all gap-1.5 sm:gap-0">
                    <div className="flex flex-1 items-center">
                      <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search by book title, author, or library..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent px-2.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-extrabold rounded-xl shadow-xs shrink-0 transition-all cursor-pointer"
                    >
                      Search
                    </button>
                  </div>
                </motion.form>

                {/* Category Pills */}
                <motion.div variants={itemVariants} className="pt-1 flex flex-wrap gap-1.5 items-center">
                  <span className="text-slate-500 text-xs font-bold mr-1">Trending:</span>
                  {['Fiction', 'Technology', 'Science', 'Design'].map(cat => (
                    <Link
                      key={cat}
                      to={`/books?search=${cat}`}
                      className="px-3 py-1 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 rounded-lg text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      {cat}
                    </Link>
                  ))}
                </motion.div>

                {/* Action Buttons */}
                <motion.div variants={itemVariants} className="flex flex-wrap gap-3 pt-1">
                  <Link
                    to="/libraries"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-slate-950" />
                    <span>Explore Libraries</span>
                  </Link>
                  <Link
                    to="/books"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs sm:text-sm rounded-xl border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>Browse Books</span>
                  </Link>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div variants={itemVariants} className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-4 text-xs text-slate-600 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified Libraries</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>Real-time Availability</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Easy Pickups</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Side: Responsive LibraryCardDeck */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="lg:col-span-6 flex justify-center lg:justify-end pt-2 lg:pt-0"
              >
                <LibraryCardDeck libraries={libraries} />
              </motion.div>
            </div>
          </div>
        </section>

      {/* 1. DISCOVER LIBRARIES — WHITE / SOFT GRAY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...REVEAL_VARIANTS} className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-600 mb-1.5">
              <Building2 className="w-4 h-4" />
              <span>Network Directory</span>
            </div>
            <h2 className="os-section-title">Discover Libraries</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Community partner libraries open to readers across Cambodia.
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
            className="flex overflow-x-auto sm:flex-wrap sm:justify-center gap-5 pb-4 sm:pb-0 snap-x scrollbar-none"
          >
            {[...Array(6)].map((_, i) => (
              <div key={`lib-skeleton-${i}`} className="min-w-[85vw] sm:min-w-0 sm:w-[calc(50%_-_0.625rem)] lg:w-[calc(33.333%_-_0.833rem)] snap-center shrink-0">
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
            className="flex overflow-x-auto sm:flex-wrap sm:justify-center gap-5 pb-4 sm:pb-0 snap-x scrollbar-none"
          >
            {libraries.map((library) => (
              <motion.div key={library.id} variants={LIST_ITEM} className="min-w-[85vw] sm:min-w-0 sm:w-[calc(50%_-_0.625rem)] lg:w-[calc(33.333%_-_0.833rem)] snap-center shrink-0">
                <LibraryCard library={library} />
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
            className="flex flex-wrap justify-center gap-5"
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
            className="flex flex-wrap justify-center gap-5"
          >
            {availableBooks.map((book) => (
              <motion.div key={book.id} variants={LIST_ITEM} className="w-full sm:w-[calc(50%_-_0.625rem)] md:w-[calc(33.333%_-_0.833rem)] lg:w-[calc(20%_-_1rem)]">
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
            className="flex flex-wrap justify-center gap-5"
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
            className="flex flex-wrap justify-center gap-5"
          >
            {recentlyAddedBooks.map((book) => (
              <motion.div key={`recent-${book.id}`} variants={LIST_ITEM} className="w-full sm:w-[calc(50%_-_0.625rem)] md:w-[calc(33.333%_-_0.833rem)] lg:w-[calc(20%_-_1rem)]">
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


