import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, CornerDownLeft, TrendingUp } from 'lucide-react';

import { BACKDROP_MOTION_VARIANTS, MOTION_EASINGS } from '../../constants/motionTokens';
import { publicService } from '../../services/publicService';
import { getBookCoverUrl } from '../../utils/imageUrl';

import FocusLock from 'react-focus-lock';

const POPULAR_CATEGORIES = ['Fiction', 'Technology', 'Science', 'Design'];

// Springy entrance for the panel
const PANEL_VARIANTS = {
  initial: { opacity: 0, scale: 0.96, y: -12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -8 },
};

// Staggered rows
const ROW_VARIANTS = {
  initial: { opacity: 0, y: 10 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.25, ease: MOTION_EASINGS.PREMIUM },
  }),
};

export default function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 120);

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setResults([]);
      setActiveIndex(-1);
    }
  }, [isOpen]);

  // Debounced live search
  useEffect(() => {
    const query = searchQuery.trim();
    setActiveIndex(-1);
    if (!isOpen || query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    let ignore = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await publicService.getBooks({ search: query, per_page: 6 });
        if (!ignore) setResults(Array.isArray(res?.data) ? res.data.slice(0, 6) : []);
      } catch {
        if (!ignore) setResults([]);
      } finally {
        if (!ignore) setSearching(false);
      }
    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [searchQuery, isOpen]);

  const go = (path) => {
    setSearchQuery('');
    onClose();
    navigate(path);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Keyboard selection takes priority
    if (activeIndex >= 0 && results[activeIndex]) {
      go(`/books/${results[activeIndex].id}`);
      return;
    }
    if (searchQuery.trim()) {
      go(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    }
  };

  const showResults = searchQuery.trim().length >= 2;

  return (
    <AnimatePresence>
      {isOpen && (
        <FocusLock>
          {/* Backdrop */}
          <motion.div
            {...BACKDROP_MOTION_VARIANTS}
            className="fixed inset-0 z-[100] bg-navy-950/60 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal content */}
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[12vh] px-4 pointer-events-none">
            <motion.div
              variants={PANEL_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl shadow-navy-950/40 ring-1 ring-navy-950/10 overflow-hidden pointer-events-auto"
            >
              {/* Gold glow accent line */}
              <div className="h-[3px] bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500" />

              {/* Search input row */}
              <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 h-16 border-b border-slate-100">
                <motion.div
                  animate={
                    searchQuery
                      ? { scale: [1, 1.15, 1], rotate: [0, -8, 0] }
                      : { scale: 1, rotate: 0 }
                  }
                  transition={{ duration: 0.35 }}
                >
                  <Search className="w-5 h-5 text-gold-500 shrink-0" />
                </motion.div>
                <input
                  ref={inputRef}
                  type="text"
                  aria-label="Search catalogue"
                  placeholder="Search for books, authors, or libraries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none text-base text-navy-800 placeholder-slate-400 focus:outline-none focus:ring-0 min-w-0"
                />
                <kbd className="hidden sm:inline-flex items-center h-6 px-1.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-400 shrink-0">
                  ESC
                </kbd>
                <span className="hidden sm:block w-px h-5 bg-slate-200 shrink-0" />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close search"
                  className="flex h-9 w-9 items-center justify-center text-slate-400 hover:text-navy-800 hover:bg-slate-100 hover:rotate-90 rounded-xl transition-all duration-300 shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>

              {/* Body */}
              <div className="max-h-[52vh] overflow-y-auto">
                {showResults ? (
                  searching && results.length === 0 ? (
                    /* Shimmer skeleton rows */
                    <div className="p-2" aria-label="Searching">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3.5 p-2.5">
                          <div className="w-10 h-14 rounded-lg bg-slate-200 animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3.5 w-2/3 rounded bg-slate-200 animate-pulse" />
                            <div className="h-3 w-1/3 rounded bg-slate-100 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : results.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-5 py-10 text-center"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-3">
                        <BookOpen className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-600 font-semibold">
                        No results for "{searchQuery.trim()}"
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try a different title, author, or keyword.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="p-2" role="listbox">
                      {results.map((book, i) => (
                        <motion.button
                          key={book.id}
                          type="button"
                          custom={i}
                          variants={ROW_VARIANTS}
                          initial="initial"
                          animate="animate"
                          onClick={() => go(`/books/${book.id}`)}
                          onMouseEnter={() => setActiveIndex(i)}
                          role="option"
                          aria-selected={activeIndex === i}
                          className={`w-full flex items-center gap-3.5 p-2.5 rounded-xl text-left transition-colors duration-150 group ${
                            activeIndex === i ? 'bg-navy-50' : ''
                          }`}
                        >
                          <div className="w-10 h-14 rounded-lg bg-navy-50 overflow-hidden shrink-0 border border-slate-100 transition-transform duration-300 group-hover:scale-105">
                            {getBookCoverUrl(book.cover_image_url || book.cover_image, 80) ? (
                              <img
                                src={getBookCoverUrl(book.cover_image_url || book.cover_image, 80)}
                                alt=""
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-semibold truncate transition-colors ${
                                activeIndex === i
                                  ? 'text-gold-600'
                                  : 'text-navy-800 group-hover:text-gold-600'
                              }`}
                            >
                              {book.title}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {book.author || 'Unknown author'}
                              {book.library?.name ? ` · ${book.library.name}` : ''}
                            </p>
                          </div>
                          <CornerDownLeft
                            className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                              activeIndex === i ? 'text-gold-500 opacity-100' : 'text-slate-300 opacity-0'
                            }`}
                          />
                        </motion.button>
                      ))}

                      <motion.button
                        type="button"
                        onClick={handleSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: results.length * 0.04 + 0.05 } }}
                        className="w-full mt-1 flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold text-gold-600 hover:bg-gold-50 transition-colors border-t border-slate-100"
                      >
                        <Search className="w-3.5 h-3.5" />
                        See all results for "{searchQuery.trim()}"
                      </motion.button>
                    </div>
                  )
                ) : (
                  /* Default state: popular categories */
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                      <TrendingUp className="w-3.5 h-3.5 text-gold-500" />
                      Popular categories
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_CATEGORIES.map((cat, i) => (
                        <motion.button
                          key={cat}
                          type="button"
                          custom={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: 0.08 + i * 0.05 } }}
                          whileHover={{ scale: 1.04, y: -1 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => go(`/books?search=${cat}`)}
                          className="inline-flex items-center h-9 px-3.5 rounded-full bg-navy-50 hover:bg-navy-800 hover:text-white text-navy-800 border border-slate-200/80 text-xs font-semibold transition-colors"
                        >
                          {cat}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer hints */}
              <div className="flex items-center gap-4 px-5 py-2.5 bg-navy-50 border-t border-slate-100 text-[11px] font-medium text-slate-400">
                {showResults && results.length > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <kbd className="inline-flex items-center h-5 px-1.5 rounded bg-white border border-slate-200 text-[9px] font-bold text-slate-500">↑↓</kbd>
                    Navigate
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="inline-flex items-center h-5 px-1.5 rounded bg-white border border-slate-200 text-[9px] font-bold text-slate-500">↵</kbd>
                  {showResults && results.length > 0 ? 'Open selected' : 'Search all books'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="inline-flex items-center h-5 px-1.5 rounded bg-white border border-slate-200 text-[9px] font-bold text-slate-500">ESC</kbd>
                  Close
                </span>
              </div>
            </motion.div>
          </div>
        </FocusLock>
      )}
    </AnimatePresence>
  );
}
