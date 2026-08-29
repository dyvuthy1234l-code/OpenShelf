import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, RotateCcw, 
  BookOpen, User, Calendar, DollarSign 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PAGE_MOTION_VARIANTS } from '../../constants/motionTokens';
import librarianService from '../../services/librarianService';
import { DetailSkeleton } from '../../components/librarian/common/Skeleton';

import ConfirmReturnModal from '../../components/librarian/returns/ConfirmReturnModal';

export default function ReturnDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [borrowing, setBorrowing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchReturnDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await librarianService.getBorrowing(id);
      const found = res.data || res.borrowing || null;

      if (!found) {
        setError('Return record not found or you do not have permission to manage this record.');
        return;
      }

      setBorrowing(found);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load return details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReturnDetails();
  }, [fetchReturnDetails]);

  const handleConfirmReturnSubmit = async (reqId, data) => {
    await librarianService.returnBook(reqId, data);
    setShowConfirmModal(false);
    setSuccessMessage('Book return confirmed successfully. Library inventory stock updated.');
    await fetchReturnDetails();
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !borrowing) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Access Denied</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">{error}</p>
        </div>
        <Link
          to="/librarian/returns"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Return Management</span>
        </Link>
      </div>
    );
  }

  const isReturned = borrowing.status === 'returned';

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="w-full space-y-6 pb-12 overflow-y-auto">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-700 block">
              Return Record
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Return #{borrowing.id}
            </h1>
          </div>
        </div>

        {!isReturned && (
          <button
            onClick={() => {
              setSuccessMessage('');
              setShowConfirmModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Physical Return</span>
          </button>
        )}
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold text-xs">Dismiss</button>
        </div>
      )}

      {/* 2-Column Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Member & Book Summary */}
        <div className="md:col-span-5 space-y-6">
          {/* Member Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-700">Member Identity</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-bold text-lg flex items-center justify-center shrink-0 overflow-hidden border border-white shadow-2xs">
                {borrowing.user?.avatar_url || borrowing.user?.avatar ? (
                  <img src={borrowing.user.avatar_url || borrowing.user.avatar} alt={borrowing.user?.name} className="w-full h-full object-cover" />
                ) : (
                  borrowing.user?.name ? borrowing.user.name[0].toUpperCase() : 'M'
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-slate-900 text-sm truncate">{borrowing.user?.name || 'Member'}</h4>
                <p className="text-xs text-slate-500 truncate">{borrowing.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Book Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-700">Returned Volume</h3>
            <div className="flex items-start gap-3">
              <div className="w-14 h-20 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                {borrowing.book?.cover_image_url ? (
                  <img src={borrowing.book.cover_image_url} alt={borrowing.book.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-6 h-6 text-amber-600/60" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h4 className="font-extrabold text-slate-900 text-sm line-clamp-2 leading-tight">{borrowing.book?.title || 'Book Title'}</h4>
                <p className="text-xs text-slate-500">By {borrowing.book?.author || 'Unknown'}</p>
                {borrowing.book?.isbn && <p className="text-[10px] text-slate-400 font-mono">ISBN: {borrowing.book.isbn}</p>}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Available Copies</span>
              <span className="font-extrabold text-slate-900">{borrowing.book?.available_quantity ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Return Audit & Timeline */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-amber-700">
                Return Audit & Status
              </h3>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase border ${
                isReturned
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                {borrowing.status}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Borrowed / Picked Up</span>
                <span className="font-bold text-slate-900">
                  {borrowing.borrowed_at || borrowing.picked_up_at ? new Date(borrowing.borrowed_at || borrowing.picked_up_at).toLocaleString() : 'N/A'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Due Date</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {borrowing.due_date ? new Date(borrowing.due_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              {borrowing.returned_at && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Confirmed Returned Date</span>
                  <span className="font-bold text-emerald-700">{new Date(borrowing.returned_at).toLocaleString()}</span>
                </div>
              )}

              {/* Fine Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Overdue Fine</span>
                  <span className="text-base font-extrabold text-slate-900">
                    ${borrowing.fine_amount ? parseFloat(borrowing.fine_amount).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Fine Payment Status</span>
                  <span className="font-bold uppercase text-slate-700">
                    {borrowing.fine_status || 'none'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Return Modal */}
      {showConfirmModal && (
        <ConfirmReturnModal
          borrowing={borrowing}
          onConfirm={handleConfirmReturnSubmit}
          onClose={() => setShowConfirmModal(false)}
        />
      )}
    </motion.div>
  );
}
