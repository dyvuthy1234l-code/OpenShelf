import { useState, useEffect, useCallback } from 'react';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import memberService from '../../services/memberService';
import { PAGE_MOTION_VARIANTS, LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';
import BorrowingCard from '../../components/member/BorrowingCard';
import LoadingState from '../../components/public/LoadingState';
import EmptyState from '../../components/public/EmptyState';
import ErrorState from '../../components/public/ErrorState';
import Pagination from '../../components/public/Pagination';

export default function MemberBorrowings() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const ITEMS_PER_PAGE = 5;

  const tabs = ['All', 'Pending', 'Active', 'Returned', 'Overdue'];

  const getStatusParam = (tab) => {
    const map = {
      'All': undefined,
      'Pending': 'pending',
      'Active': 'approved,borrowed,picked_up,return_requested',
      'Returned': 'returned',
      'Overdue': 'overdue',
    };
    return map[tab];
  };

  const loadBorrowings = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError(null);
      const statusParam = getStatusParam(activeTab);
      const params = {
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      };
      if (statusParam) params.status = statusParam;

      const res = await memberService.getBorrowings(params);
      setBorrowings(res.data || []);
      if (res.meta) {
        setMeta(res.meta);
      } else {
        setMeta({ current_page: 1, last_page: 1, total: (res.data || []).length });
      }
    } catch {
      if (!isSilent) setError('Failed to load borrowing history. Please try again.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [currentPage, activeTab]);

  useEffect(() => {
    loadBorrowings(false);

    // Auto-refresh interval every 10 seconds for real-time status updates
    const interval = setInterval(() => {
      loadBorrowings(true);
    }, 10000);

    const handleFocus = () => loadBorrowings(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadBorrowings]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const totalPages = meta.last_page || 1;
  const paginatedBorrowings = borrowings;

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 pb-16">
      {/* Header */}
      <div className="pb-4 border-b border-brand-border">
        <div className="flex items-center gap-2 text-gold-600 text-xs font-bold uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Reading Records</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900">My Borrowings</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Track physical book loans, status, and due dates</p>
      </div>

      {/* Filter Tabs */}
      <div role="tablist" aria-label="Borrowing status" className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-brand-border">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              role="tab"
              aria-selected={isActive}
              className={`min-h-11 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-navy-800 text-white shadow-xs'
                  : 'os-btn-secondary'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading your borrowing records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadBorrowings} />
      ) : borrowings.length === 0 ? (
        <EmptyState
          title={`No ${activeTab === 'All' ? '' : activeTab} borrowings`}
          description="Your requested and active physical book loans will appear here."
        />
      ) : (
        <div className="space-y-5">
          <motion.div variants={LIST_STAGGER} initial="initial" animate="animate" className="grid grid-cols-1 gap-4">
          {paginatedBorrowings.map((b) => (
            <motion.div key={b.id} variants={LIST_ITEM}>
              <BorrowingCard borrowing={b} onActionSuccess={loadBorrowings} />
            </motion.div>
          ))}
          </motion.div>
          <Pagination
            currentPage={currentPage}
            lastPage={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </motion.div>
  );
}
