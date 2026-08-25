import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, CornerDownLeft, TrendingUp, Loader2 } from 'lucide-react';

import { MODAL_MOTION_VARIANTS, BACKDROP_MOTION_VARIANTS, MOTION_EASINGS } from '../../constants/motionTokens';
import { publicService } from '../../services/publicService';
import { getBookCoverUrl } from '../../utils/imageUrl';

import FocusLock from 'react-focus-lock';

const POPULAR_CATEGORIES = ['Fiction', 'Technology', 'Science', 'Design'];

export default function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
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
    }
  }, [isOpen]);

  // Debounced live search
  useEffect(() => {
    const query = searchQuery.trim();
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
    if (searchQuery.trim()) {
      go(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
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
            className="fixed inset-0 z-[100] bg-navy-950/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal content */}
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[12vh] px-4 pointer-events-none">
            <motion.div
              {...MODAL_MOTION_VARIANTS}
              transition={{ duration: 0.22, ease: MOTION_EASINGS.PREMIUM }}
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl shadow-navy-950/30 ring-1 ring-navy-950/10 overflow-hidden pointer-events-auto"
            >
              {/* Search input row */}
              <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 h-16 border-b border-slate-100">
                <Search className="w-5 h-5 text-gold-500 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  aria-label="Search catalogue"
                  placeholder="Search for books, authors, or libraries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none text-base text-navy-800 placeholder-slate-400 focus:outline-none focus:ring-0 min-w-0"
                />
                {searching && <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />}
                <kbd className="hidden sm:inline-flex items-center h-6 px-1.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-400 shrink-0">
                  ESC
                </kbd>
                <span className="hidden sm:block w-px h-5 bg-slate-200 shrink-0" />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close search"
                  className="flex h-9 w-9 items-center justify-center text-slate-400 hover:text-navy-800 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </form>

              {/* Body */}
              <div className="max-h-[52vh] overflow-y-auto">
                {/* Live results */}
                {showResults ? (
                  searching && results.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-slate-400">Searching...</div>
                  ) : results.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 font-medium">
                        No results for "{searchQuery.trim()}"
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Try a different title, author, or keyword.</p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {results.map((book) => (
                        <button
                          key={book.id}
                          type="button"
                          onClick={() => go(`/books/${book.id}`)}
                          className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-left hover:bg-navy-50 transition-colors group"
                        >
                          <div className="w-10 h-14 rounded-lg bg-navy-50 overflow-hidden shrink-0 border border-slate-100">
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
                            <p className="text-sm font-semibold text-navy-800 truncate group-hover:text-gold-600 transition-colors">
                              {book.title}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {book.author || 'Unknown author'}
                              {book.library?.name ? ` · ${book.library.name}` : ''}
                            </p>
                          </div>
                          <CornerDownLeft className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full mt-1 flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold text-gold-600 hover:bg-gold-50 transition-colors border-t border-slate-100"
                      >
                        <Search className="w-3.5 h-3.5" />
                        See all results for "{searchQuery.trim()}"
                      </button>
                    </div>
                  )
                ) : (
                  /* Default state: popular categories */
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Popular categories
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => go(`/books?search=${cat}`)}
                          className="inline-flex items-center h-9 px-3.5 rounded-full bg-navy-50 hover:bg-navy-800 hover:text-white text-navy-800 border border-slate-200/80 text-xs font-semibold transition-colors"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer hints */}
              <div className="flex items-center gap-4 px-5 py-2.5 bg-navy-50 border-t border-slate-100 text-[11px] font-medium text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <kbd className="inline-flex items-center h-5 px-1.5 rounded bg-white border border-slate-200 text-[9px] font-bold text-slate-500">↵</kbd>
                  Search all books
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
