import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, XCircle, Clock, BookOpen, 
  User, AlertCircle, Calendar, ShieldCheck, Building2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PAGE_MOTION_VARIANTS } from '../../constants/motionTokens';
import librarianService from '../../services/librarianService';
import { DetailSkeleton } from '../../components/librarian/common/Skeleton';

import ApproveModal from '../../components/librarian/borrowings/ApproveModal';
import RejectModal from '../../components/librarian/borrowings/RejectModal';

export default function BorrowRequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [borrowing, setBorrowing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchBorrowingDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await librarianService.getBorrowing(id);
      const found = res.data || res.borrowing || null;

      if (!found) {
        setError('Borrowing request not found or you do not have permission to manage this record.');
        return;
      }

      setBorrowing(found);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load borrowing request details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBorrowingDetails();
  }, [fetchBorrowingDetails]);

  const handleApproveConfirm = async (reqId) => {
    await librarianService.approveBorrowing(reqId);
    setShowApproveModal(false);
    setSuccessMessage('Borrowing request approved successfully.');
    await fetchBorrowingDetails();
  };

  const handleRejectConfirm = async (reqId, reason) => {
    await librarianService.rejectBorrowing(reqId, reason);
    setShowRejectModal(false);
    setSuccessMessage('Borrowing request rejected.');
    await fetchBorrowingDetails();
  };

  const handlePickupConfirm = async () => {
    try {
      await librarianService.pickupBorrowing(borrowing.id);
      setSuccessMessage('Book pickup confirmed. Loan period started.');
      await fetchBorrowingDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm pickup.');
    }
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
          to="/librarian/borrow-requests"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Borrow Requests</span>
        </Link>
      </div>
    );
  }

  const isAvailable = (borrowing.book?.available_quantity ?? 0) > 0;

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
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
              Borrowing Details
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Request #{borrowing.id}
            </h1>
          </div>
        </div>

        {/* Status Badge & Primary Action */}
        <div className="flex items-center gap-3">
          {borrowing.status === 'pending' && (
            <>
              <button
                onClick={() => {
                  setSuccessMessage('');
                  setShowApproveModal(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Request</span>
              </button>

              <button
                onClick={() => {
                  setSuccessMessage('');
                  setShowRejectModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </>
          )}

          {borrowing.status === 'approved' && (
            <button
              onClick={handlePickupConfirm}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Pickup</span>
            </button>
          )}
        </div>
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

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Member & Book Overview */}
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
                <span className="inline-block text-[9px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1">
                  Registered Member
                </span>
              </div>
            </div>
          </div>

          {/* Book Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-amber-700">Requested Book</h3>
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
              <span className="text-slate-500 font-medium">Available Inventory</span>
              <span className={`font-extrabold ${isAvailable ? 'text-emerald-700' : 'text-rose-600'}`}>
                {borrowing.book?.available_quantity ?? 0} copies
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Request Details & Timeline */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-amber-700">
                Borrowing Timeline & Status
              </h3>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-300">
                {borrowing.status}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Requested Date</span>
                <span className="font-bold text-slate-900">
                  {borrowing.created_at || borrowing.requested_at ? new Date(borrowing.created_at || borrowing.requested_at).toLocaleString() : 'N/A'}
                </span>
              </div>

              {borrowing.approved_at && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Approval Date</span>
                  <span className="font-bold text-slate-900">{new Date(borrowing.approved_at).toLocaleString()}</span>
                </div>
              )}

              {borrowing.picked_up_at && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Pickup Date</span>
                  <span className="font-bold text-slate-900">{new Date(borrowing.picked_up_at).toLocaleString()}</span>
                </div>
              )}

              {borrowing.due_date && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Due Date</span>
                  <span className="font-extrabold text-slate-900 text-sm">{new Date(borrowing.due_date).toLocaleDateString()}</span>
                </div>
              )}

              {borrowing.returned_at && (
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Return Date</span>
                  <span className="font-bold text-slate-900">{new Date(borrowing.returned_at).toLocaleString()}</span>
                </div>
              )}

              {borrowing.rejection_reason && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-rose-700 tracking-wider">Rejection Reason</span>
                  <p className="text-rose-900 font-medium leading-relaxed">{borrowing.rejection_reason}</p>
                </div>
              )}

              {(borrowing.fine_amount > 0) && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider block">Overdue Fine</span>
                    <span className="font-extrabold text-amber-900 text-base">${borrowing.fine_amount}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 border border-amber-300">
                    {borrowing.fine_status || 'unpaid'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <ApproveModal
          borrowing={borrowing}
          onConfirm={handleApproveConfirm}
          onClose={() => setShowApproveModal(false)}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <RejectModal
          borrowing={borrowing}
          onConfirm={handleRejectConfirm}
          onClose={() => setShowRejectModal(false)}
        />
      )}
    </motion.div>
  );
}
