import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

import FocusLock from 'react-focus-lock';

export default function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <FocusLock>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal content */}
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto"
            >
              <form onSubmit={handleSubmit} className="relative flex items-center border-b border-slate-100 p-2">
                <Search className="w-5 h-5 text-amber-500 ml-3 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  aria-label="Search catalogue"
                  placeholder="Search for books, authors, or libraries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none py-3 px-4 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close search"
                  className="flex h-11 w-11 items-center justify-center mr-1 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
              <div className="p-4 bg-slate-50">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3">
                  Quick links
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Fiction', 'Technology', 'Science', 'Design'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        navigate(`/books?search=${cat}`);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-amber-400 hover:text-amber-700 rounded-lg text-xs font-medium text-slate-600 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </FocusLock>
      )}
    </AnimatePresence>
  );
}
