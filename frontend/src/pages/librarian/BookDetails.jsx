import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, BookOpen, Edit3, Trash2, Tag, Calendar, 
  Building2, CheckCircle2, AlertTriangle, Clock, RefreshCw, AlertCircle,
  User, History, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PAGE_MOTION_VARIANTS, LIST_STAGGER, LIST_ITEM, BANNER_MOTION } from '../../constants/motionTokens';
import librarianService from '../../services/librarianService';

import BookForm from '../../components/librarian/books/BookForm';
import DeleteBookModal from '../../components/librarian/books/DeleteBookModal';
import { DetailSkeleton } from '../../components/librarian/common/Skeleton';

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [categories, setCategories] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Notifications
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchBookDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const bookRes = await librarianService.getBook(id);
      setBook(bookRes.data || null);

      try {
        const catRes = await librarianService.getCategories();
        setCategories(catRes.data || []);
      } catch {
        setCategories([]);
      }

      try {
        const borRes = await librarianService.getBorrowings();
        const list = borRes.data || [];
        const bookBorrows = list.filter((b) => String(b.book_id || b.book?.id) === String(id));
        setBorrowings(bookBorrows);
      } catch {
        setBorrowings([]);
      }
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 403) {
        setError('Book not found or you do not have permission to manage this volume.');
      } else {
        setError(err.response?.data?.message || 'Unable to load book details.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  const handleUpdateBook = async (formData, bookId) => {
    await librarianService.updateBook(bookId, formData);
    setShowEditModal(false);
    setSuccessMessage('Book information updated successfully.');
    await fetchBookDetails();
  };

  const handleDeleteBook = async (bookId) => {
    await librarianService.deleteBook(bookId);
    setShowDeleteModal(false);
    navigate('/librarian/books');
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !book) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
        <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center shadow-2xs">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-slate-900">Access Denied</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>
    );
  }

  const activeLoans = Math.max((book.quantity ?? 1) - (book.available_quantity ?? 0), 0);

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="flex-1 flex flex-col min-h-0 h-full w-full space-y-3 justify-between">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200/80 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all shadow-2xs shrink-0 cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <span className="text-[9px] uppercase font-extrabold tracking-widest text-amber-700 block">
              Volume Profile & Circulation
            </span>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight truncate leading-tight">
              {book.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Volume</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div {...BANNER_MOTION} key="success-banner" className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold text-xs cursor-pointer">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1-Screen Compact Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0">
        {/* Left Column: Book Identity Card & Description */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-2xs min-h-0 overflow-y-auto">
          <div className="flex items-start gap-4">
            <div className="w-24 h-36 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              {book.cover_image_url ? (
                <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="space-y-2.5 flex-1 min-w-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {book.category && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-full font-extrabold text-[9px] uppercase">
                      <Tag className="w-3 h-3 text-amber-600" />
                      {book.category.name}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    book.available_quantity > 0 ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200'
                  }`}>
                    {book.available_quantity > 0 ? `🟢 ${book.available_quantity} Available` : '🔴 Out of Stock'}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight truncate" title={book.title}>{book.title}</h2>
                <p className="text-xs font-bold text-slate-600 truncate">Author: {book.author || 'N/A'}</p>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">ISBN</span>
                  <span className="font-extrabold text-slate-800 font-mono truncate block">{book.isbn || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Publisher</span>
                  <span className="font-extrabold text-slate-800 truncate block">{book.publisher || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Publication Year</span>
                  <span className="font-extrabold text-slate-800 truncate block">{book.publication_year || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Library Branch</span>
                  <span className="font-extrabold text-slate-800 truncate block">{book.library?.name || 'Main Library'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Book Description */}
          {book.description && (
            <div className="border-t border-slate-100 pt-3 space-y-1">
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Synopsis / Description</h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100 italic line-clamp-3">
                "{book.description}"
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Inventory & Stats Grid */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-2xs">
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-700 flex items-center gap-1.5 shrink-0">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Inventory & Circulation Metrics</span>
          </h3>

          <motion.div variants={LIST_STAGGER} initial="initial" animate="animate" className="grid grid-cols-2 gap-2.5 text-xs flex-1">
            <motion.div variants={LIST_ITEM} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col justify-center space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Total Copies</span>
              <span className="text-xl font-extrabold text-slate-900">{book.quantity ?? 1}</span>
            </motion.div>

            <motion.div variants={LIST_ITEM} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col justify-center space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Available Stock</span>
              <span className="text-xl font-extrabold text-emerald-700">{book.available_quantity ?? 0}</span>
            </motion.div>

            <motion.div variants={LIST_ITEM} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col justify-center space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Active Loans</span>
              <span className="text-xl font-extrabold text-amber-700">{activeLoans}</span>
            </motion.div>

            <motion.div variants={LIST_ITEM} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col justify-center space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Total Borrows</span>
              <span className="text-xl font-extrabold text-slate-900">{borrowings.length}</span>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Circulation History Table for this Volume (Fits on same screen) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5 shadow-2xs shrink-0 max-h-[220px] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-extrabold text-slate-900">Volume Circulation History</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {borrowings.length} Total Records
          </span>
        </div>

        {borrowings.length === 0 ? (
          <div className="text-center py-4 text-slate-400 text-xs italic">
            No borrowing activity recorded for this volume yet.
          </div>
        ) : (
          <div className="overflow-y-auto overflow-x-hidden flex-1 scrollbar-thin">
            <table className="w-full text-left text-xs align-middle table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[9px] sticky top-0">
                  <th className="py-2 px-3 w-[30%]">Member</th>
                  <th className="py-2 px-3 w-[20%]">Borrowed Date</th>
                  <th className="py-2 px-3 w-[20%]">Due Date</th>
                  <th className="py-2 px-3 w-[15%]">Status</th>
                  <th className="py-2 px-3 w-[15%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {borrowings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-900 whitespace-nowrap min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                          {b.user?.avatar_url || b.user?.avatar ? (
                            <img src={b.user.avatar_url || b.user.avatar} alt={b.user?.name} className="w-full h-full object-cover" />
                          ) : (
                            b.user?.name ? b.user.name[0].toUpperCase() : 'M'
                          )}
                        </div>
                        <span className="block truncate font-extrabold text-xs">{b.user?.name || 'Member'}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap text-xs">
                      {b.borrowed_at || b.requested_at ? new Date(b.borrowed_at || b.requested_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-700 whitespace-nowrap text-xs">
                      {b.due_date ? new Date(b.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        b.status === 'returned' ? 'bg-slate-100 text-slate-700' :
                        b.status === 'borrowed' || b.status === 'picked_up' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        b.status === 'overdue' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <Link
                        to={b.status === 'returned' ? `/librarian/returns/${b.id}` : `/librarian/borrow-requests/${b.id}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-colors inline-block"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <BookForm
            initialData={book}
            categories={categories}
            onSave={handleUpdateBook}
            onClose={() => setShowEditModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteBookModal
            book={book}
            onConfirm={handleDeleteBook}
            onClose={() => setShowDeleteModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
