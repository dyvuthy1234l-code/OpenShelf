import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Building2, Clock, AlertTriangle, RefreshCw, 
  DollarSign, CheckCircle2, ArrowRightLeft, X 
} from 'lucide-react';
import memberService from '../../services/memberService';
import StatusBadge from '../common/StatusBadge';

export default function BorrowingCard({ borrowing, onActionSuccess }) {
  const [extending, setExtending] = useState(false);
  const [paying, setPaying] = useState(false);
  const [requestingReturn, setRequestingReturn] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [imageErr, setImageErr] = useState(false);

  const book = borrowing.book || {};
  const library = borrowing.library || {};
  const status = borrowing.status || 'pending';

  // Compute countdown / overdue
  const now = new Date();
  const dueDate = borrowing.due_date ? new Date(borrowing.due_date) : null;

  let countdownText = '';
  let isOverdue = status === 'overdue';

  if (dueDate) {
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      isOverdue = true;
      countdownText = `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      countdownText = 'Due today';
    } else if (diffDays === 1) {
      countdownText = 'Due tomorrow';
    } else {
      countdownText = `${diffDays} days left`;
    }
  }

  const isActiveLoan = ['approved', 'borrowed', 'picked_up'].includes(status);
  const isDueSoon = !isOverdue && dueDate && dueDate - now <= 3 * 24 * 60 * 60 * 1000 && (status === 'borrowed' || status === 'picked_up' || status === 'approved');
  const isEligibleForReturn = (status === 'borrowed' || status === 'picked_up' || isOverdue) && status !== 'return_requested' && status !== 'returned';

  const handleRequestReturnSubmit = async () => {
    try {
      setRequestingReturn(true);
      setActionMessage('');
      setActionError('');
      await memberService.requestReturn(borrowing.id);
      setActionMessage('Return request submitted successfully.');
      setShowReturnModal(false);
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to submit return request.');
      setShowReturnModal(false);
    } finally {
      setRequestingReturn(false);
    }
  };

  const handleExtend = async () => {
    if (!window.confirm('Are you sure you want to request a loan extension?')) return;
    try {
      setExtending(true);
      setActionMessage('');
      setActionError('');
      await memberService.extendBorrowing(borrowing.id);
      setActionMessage('Loan extension requested successfully!');
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to extend loan.');
    } finally {
      setExtending(false);
    }
  };

  const handlePayFine = async () => {
    const amountStr = Number(borrowing.fine_amount).toFixed(2);
    if (!window.confirm(`Are you sure you want to pay the fine of $${amountStr}?`)) return;
    try {
      setPaying(true);
      setActionMessage('');
      setActionError('');
      await memberService.payFine(borrowing.id);
      setActionMessage('Fine payment processed!');
      if (onActionSuccess) onActionSuccess();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to process payment.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <div className="os-panel p-5 hover:shadow-md transition-shadow space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          {/* Book + Library Info */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-16 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
              {book.cover_image_url && !imageErr ? (
                <img 
                  src={book.cover_image_url} 
                  alt={book.title} 
                  className="w-full h-full object-cover" 
                  onError={() => setImageErr(true)}
                />
              ) : (
                <BookOpen className="w-6 h-6 text-slate-400" />
              )}
            </div>

            <div className="min-w-0 space-y-1">
              <h3 className="text-base font-bold text-navy-900 truncate">{book.title || 'Untitled Book'}</h3>
              {book.author && <p className="text-xs text-slate-500 truncate">By {book.author}</p>}
              {library.name && (
                <div className="flex items-center gap-1 text-xs text-gold-600 font-semibold truncate">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{library.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Pill & Countdown */}
          <div className="shrink-0 flex sm:flex-col items-start sm:items-end justify-between w-full sm:w-auto gap-2">
            <StatusBadge status={isOverdue ? 'overdue' : status} />

            {dueDate && (status === 'borrowed' || status === 'picked_up' || status === 'approved' || isOverdue) && status !== 'return_requested' && (
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border tabular-nums ${
                isOverdue 
                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                  : 'bg-gold-100 text-gold-600 border-gold-200'
              }`}>
                {isOverdue ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>{countdownText}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs text-slate-600 pt-1">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Requested</span>
            <span className="font-bold text-slate-800 tabular-nums">
              {borrowing.created_at ? new Date(borrowing.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          {(borrowing.picked_up_at || borrowing.pickup_date) && (
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Picked Up</span>
              <span className="font-bold text-slate-800 tabular-nums">
                {new Date(borrowing.picked_up_at || borrowing.pickup_date).toLocaleDateString()}
              </span>
            </div>
          )}

          {borrowing.due_date && (
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Due Date</span>
              <span className={`font-bold tabular-nums ${isOverdue ? 'text-rose-600' : isDueSoon ? 'text-gold-600' : 'text-slate-800'}`}>
                {new Date(borrowing.due_date).toLocaleDateString()}
              </span>
            </div>
          )}

          {(borrowing.returned_at || borrowing.return_date) && (
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Returned</span>
              <span className="font-bold text-emerald-700 tabular-nums">
                {new Date(borrowing.returned_at || borrowing.return_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Return Requested Status Notice */}
        {status === 'return_requested' && (
          <div className="bg-gold-100/60 border border-gold-200 rounded-xl p-3 text-xs text-navy-800 flex items-start gap-2.5 font-medium">
            <Clock className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Return Requested</strong>
              <span>Waiting for the librarian to confirm the physical return.</span>
            </div>
          </div>
        )}

        {/* Fine Status (if any) */}
        {borrowing.fine_amount > 0 && (
          <div className="flex items-center justify-between bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-rose-800 font-semibold">
              <DollarSign className="w-4 h-4 text-rose-600" />
              <span>
                Fine: <strong>${Number(borrowing.fine_amount).toFixed(2)}</strong> ({borrowing.fine_status || 'unpaid'})
              </span>
            </div>

            {borrowing.fine_status === 'unpaid' && (
              <button
                onClick={handlePayFine}
                disabled={paying}
                className="min-h-11 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer"
              >
                {paying ? 'Processing...' : 'Pay Fine'}
              </button>
            )}
          </div>
        )}

        {/* Action Messages */}
        {actionMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
        )}

        {actionError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs font-semibold">
            {actionError}
          </div>
        )}

        {/* Action Buttons: Request Return & Extend Loan */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
          {(status === 'borrowed' || status === 'picked_up') && !isOverdue && status !== 'return_requested' && (
            <button
              onClick={handleExtend}
              disabled={extending}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${extending ? 'animate-spin' : ''}`} />
              <span>{extending ? 'Extending...' : 'Extend Loan'}</span>
            </button>
          )}

          {isEligibleForReturn && (
            <button
              onClick={() => setShowReturnModal(true)}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Request Return</span>
            </button>
          )}
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      <AnimatePresence>
        {showReturnModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="return-request-title"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
                  <ArrowRightLeft className="w-5 h-5 text-gold-600" />
                  <h3 id="return-request-title">Request Book Return</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  aria-label="Close return request"
                  className="flex h-11 w-11 items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-600">
                Are you sure you want to request the return of this book?
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Book</span>
                  <span className="font-extrabold text-slate-900 text-sm block truncate">{book.title || 'Untitled'}</span>
                  {book.author && <span className="text-slate-500 block truncate">By {book.author}</span>}
                </div>

                {library.name && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Library</span>
                    <span className="font-bold text-gold-600 truncate block">{library.name}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-gold-100/60 border border-gold-200 rounded-xl text-xs text-navy-800 leading-relaxed font-medium">
                The librarian will confirm the physical return after you hand the book back.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  disabled={requestingReturn}
                  className="min-h-11 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRequestReturnSubmit}
                  disabled={requestingReturn}
                  className="inline-flex min-h-11 items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {requestingReturn ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Requesting...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>Request Return</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
