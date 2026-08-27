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
    return (
      <div className="flex-1 space-y-4 animate-pulse">
        <div className="h-64 bg-white rounded-3xl border border-slate-200" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
        <div className="w-14 h-14 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center shadow-2xs">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900">Access Denied</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>
    );
  }

  const activeLoans = Math.max((book.quantity ?? 1) - (book.available_quantity ?? 0), 0);

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="space-y-6 max-w-7xl w-full mx-auto pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl transition-all shadow-2xs shrink-0 cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-700 block">
              Volume Profile & Circulation
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
              {book.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Volume</span>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div {...BANNER_MOTION} key="success-banner" className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold text-xs">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Book Identity Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-36 h-52 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
              {book.cover_image_url ? (
                <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-12 h-12 text-slate-400" />
              )}
            </div>

            <div className="space-y-4 flex-1 min-w-0">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {book.category && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-full font-extrabold text-[10px] uppercase">
                      <Tag className="w-3 h-3 text-amber-600" />
                      {book.category.name}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    book.available_quantity > 0 ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200'
                  }`}>
                    {book.available_quantity > 0 ? `🟢 ${book.available_quantity} Available` : '🔴 Out of Stock'}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">{book.title}</h2>
                <p className="text-sm font-bold text-slate-600">Author: {book.author || 'N/A'}</p>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">ISBN</span>
                  <span className="font-extrabold text-slate-800 font-mono">{book.isbn || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Publisher</span>
                  <span className="font-extrabold text-slate-800">{book.publisher || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Publication Year</span>
                  <span className="font-extrabold text-slate-800">{book.publication_year || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Library Branch</span>
                  <span className="font-extrabold text-slate-800">{book.library?.name || 'Main Library'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Book Description */}
          {book.description && (
            <div className="border-t border-slate-100 pt-5 space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Synopsis / Description</h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100 italic">
                "{book.description}"
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Inventory & Stats Grid */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-2xs">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Inventory & Circulation Metrics</span>
            </h3>

            <motion.div variants={LIST_STAGGER} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <motion.div variants={LIST_ITEM} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Copies</span>
                <span className="text-2xl font-extrabold text-slate-900">{book.quantity ?? 1}</span>
              </motion.div>

              <motion.div variants={LIST_ITEM} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Available Stock</span>
                <span className="text-2xl font-extrabold text-emerald-700">{book.available_quantity ?? 0}</span>
              </motion.div>

              <motion.div variants={LIST_ITEM} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Active Loans</span>
                <span className="text-2xl font-extrabold text-amber-700">{activeLoans}</span>
              </motion.div>

              <motion.div variants={LIST_ITEM} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Borrows</span>
                <span className="text-2xl font-extrabold text-slate-900">{borrowings.length}</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Circulation History Table for this Volume */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-extrabold text-slate-900">Volume Circulation History</h3>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {borrowings.length} Total Records
          </span>
        </div>

        {borrowings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs italic">
            No borrowing activity recorded for this volume yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full max-w-[800px] text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Member</th>
                  <th className="py-3.5 px-4">Borrowed Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {borrowings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                          {b.user?.avatar_url || b.user?.avatar ? (
                            <img src={b.user.avatar_url || b.user.avatar} alt={b.user?.name} className="w-full h-full object-cover" />
                          ) : (
                            b.user?.name ? b.user.name[0].toUpperCase() : 'M'
                          )}
                        </div>
                        <div>
                          <span className="block truncate max-w-[140px] font-extrabold">{b.user?.name || 'Member'}</span>
                          <span className="text-[10px] text-slate-400 font-normal block truncate max-w-[140px]">{b.user?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {b.borrowed_at || b.requested_at ? new Date(b.borrowed_at || b.requested_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {b.due_date ? new Date(b.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        b.status === 'returned' ? 'bg-slate-100 text-slate-700' :
                        b.status === 'borrowed' || b.status === 'picked_up' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        b.status === 'overdue' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={b.status === 'returned' ? `/librarian/returns/${b.id}` : `/librarian/borrow-requests/${b.id}`}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors inline-block"
                      >
                        View Details
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
      {showEditModal && (
        <BookForm
          initialData={book}
          categories={categories}
          onSave={handleUpdateBook}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteBookModal
          book={book}
          onConfirm={handleDeleteBook}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </motion.div>
  );
}
