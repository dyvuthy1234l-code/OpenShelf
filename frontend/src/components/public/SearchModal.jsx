import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, CornerDownLeft, Building2 } from 'lucide-react';

import { BACKDROP_MOTION_VARIANTS, MOTION_EASINGS } from '../../constants/motionTokens';
import { publicService } from '../../services/publicService';
import { getBookCoverUrl } from '../../utils/imageUrl';

import FocusLock from 'react-focus-lock';

// Command palette panel spring animation
const PANEL_VARIANTS = {
  initial: { opacity: 0, scale: 0.97, y: -14 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: -10 },
};

// Row staggered animation
const ROW_VARIANTS = {
  initial: { opacity: 0, y: 8 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.22, ease: MOTION_EASINGS.PREMIUM },
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
      setTimeout(() => inputRef.current?.focus(), 100);

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
    }, 280);

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
          {/* Backdrop placed below navbar (top-[56px] sm:top-[64px]) so Navbar stays 100% visible & clear */}
          <motion.div
            {...BACKDROP_MOTION_VARIANTS}
            className="fixed top-[56px] sm:top-[64px] left-0 right-0 bottom-0 z-40 bg-slate-950/25 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Floating Search Modal Container */}
          <div className="fixed top-[56px] sm:top-[64px] left-0 right-0 bottom-0 z-40 flex items-start justify-center pt-6 sm:pt-10 px-4 pointer-events-none">
            <motion.div
              variants={PANEL_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              role="dialog"
              aria-modal="true"
              aria-label="Global Search"
              className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
            >
              {/* Top Accent Gold Strip */}
              <div className="h-1 bg-gradient-to-r from-gold-500 via-amber-400 to-gold-500" />

              {/* Search Input Header with Close Button */}
              <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 h-16 border-b border-slate-200/80 bg-slate-50/80">
                <Search className="w-5 h-5 text-gold-600 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  aria-label="Search books and authors"
                  placeholder="Search books or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ outline: 'none', boxShadow: 'none' }}
                  className="flex-1 bg-transparent border-0 outline-none ring-0 focus:outline-none focus:ring-0 focus:border-0 focus-visible:outline-none focus-visible:ring-0 text-base text-navy-800 placeholder-slate-400 min-w-0 font-bold"
                />

                <kbd className="hidden sm:inline-flex items-center h-6 px-2 rounded-md bg-white border border-slate-200/80 text-[10px] font-extrabold text-slate-500 shadow-2xs">
                  Esc
                </kbd>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close search modal"
                  className="flex h-9 w-9 items-center justify-center text-slate-400 hover:text-navy-800 hover:bg-slate-200/80 rounded-xl transition-all duration-200 shrink-0 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>

              {/* Search Content Body with Generous Fixed Min-Height (340px) */}
              <div className="min-h-[340px] max-h-[55vh] overflow-y-auto bg-white flex flex-col">
                {showResults ? (
                  searching && results.length === 0 ? (
                    <div className="p-3 space-y-2.5 flex-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 animate-pulse">
                          <div className="w-11 h-14 rounded-lg bg-slate-200 shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-2/3 rounded bg-slate-200" />
                            <div className="h-3 w-1/3 rounded bg-slate-150" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : results.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-6 py-16 text-center my-auto flex flex-col items-center justify-center flex-1"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center mb-3 text-gold-600 shadow-2xs">
                        <BookOpen className="w-7 h-7" />
                      </div>
                      <p className="text-base text-navy-800 font-extrabold">
                        No results found for "{searchQuery.trim()}"
                      </p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">
                        Try searching for another book title or author name.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="p-3 space-y-1 flex-1" role="listbox">
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
                          className={`w-full flex items-center gap-4 p-3 rounded-xl text-left transition-colors duration-150 group cursor-pointer ${
                            activeIndex === i
                              ? 'bg-navy-50 border border-brand-border'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          {/* Thumbnail */}
                          <div className="w-11 h-14 rounded-lg bg-navy-50 overflow-hidden shrink-0 border border-slate-200/80 flex items-center justify-center shadow-2xs">
                            {getBookCoverUrl(book.cover_image_url || book.cover_image, 100) ? (
                              <img
                                src={getBookCoverUrl(book.cover_image_url || book.cover_image, 100)}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <BookOpen className="w-5 h-5 text-amber-600/70" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm font-extrabold text-navy-800 group-hover:text-gold-600 transition-colors truncate">
                              {book.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 truncate font-medium">
                              {book.author && <span>By {book.author}</span>}
                              {book.library?.name && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-gold-700 bg-gold-50 border border-gold-200 px-2 py-0.5 rounded-md font-semibold">
                                  <Building2 className="w-3 h-3 text-gold-600" />
                                  <span className="truncate">{book.library.name}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <CornerDownLeft
                            className={`w-4 h-4 shrink-0 transition-opacity ${
                              activeIndex === i ? 'text-gold-600 opacity-100' : 'text-slate-300 opacity-0'
                            }`}
                          />
                        </motion.button>
                      ))}

                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full mt-2 flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-extrabold text-gold-600 hover:bg-gold-50 border border-gold-200 transition-colors cursor-pointer"
                      >
                        <Search className="w-4 h-4" />
                        <span>See all results for "{searchQuery.trim()}"</span>
                      </button>
                    </div>
                  )
                ) : (
                  /* Initial state when no query typed — Clean Light OpenShelf Theme */
                  <div className="my-auto py-16 px-6 text-center flex flex-col items-center justify-center flex-1">
                    <div className="w-16 h-16 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center mb-3 text-gold-600 shadow-2xs">
                      <Search className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-extrabold text-navy-800">
                      Search OpenShelf Catalogue
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed font-semibold">
                      Type a book title or author name to inspect real-time availability.
                    </p>
                  </div>
                )}
              </div>

              {/* Command Palette Footer */}
              <div className="flex items-center justify-between px-5 py-3 bg-slate-50/90 border-t border-slate-200/80 text-[11px] text-slate-500 font-semibold">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200/80 text-[10px] text-slate-600 font-bold shadow-2xs">↑↓</kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200/80 text-[10px] text-slate-600 font-bold shadow-2xs">↵</kbd>
                    <span>Select</span>
                  </span>
                </div>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200/80 text-[10px] text-slate-600 font-bold shadow-2xs">Esc</kbd>
                  <span>Close</span>
                </span>
              </div>
            </motion.div>
          </div>
        </FocusLock>
      )}
    </AnimatePresence>
  );
}
