import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import memberService from '../../services/memberService';
import { PAGE_MOTION_VARIANTS, LIST_STAGGER, LIST_ITEM } from '../../constants/motionTokens';
import BorrowingCard from '../../components/member/BorrowingCard';
import LoadingState from '../../components/public/LoadingState';
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

  const stats = borrowings.reduce(
    (acc, b) => {
      const now = Date.now();
      const due = b.due_date ? new Date(b.due_date).getTime() : null;
      const isActive = ['approved', 'borrowed', 'picked_up'].includes(b.status);

      if (b.status === 'overdue' || (due && due < now)) {
        acc.overdue += 1;
      } else {
        if (isActive) acc.active += 1;
        if (isActive && due && due - now <= 3 * 24 * 60 * 60 * 1000) acc.dueSoon += 1;
      }
      return acc;
    },
    { active: 0, dueSoon: 0, overdue: 0 }
  );

  const statChips = [
    { label: 'Active Loans', value: stats.active, icon: BookOpen },
    { label: 'Due Soon', value: stats.dueSoon, icon: Clock, accent: 'text-gold-600' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, accent: 'text-rose-600' },
  ];

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 text-gold-600 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Reading Records</span>
          </div>
          <h1 className="os-section-title">My Borrowings</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Track physical book loans, status, and due dates
            {!loading && meta.total > 0 && (
              <> · <strong className="font-bold tabular-nums text-navy-800">{meta.total}</strong> record{meta.total === 1 ? '' : 's'}</>
            )}
          </p>
        </div>

        <Link to="/books" className="os-btn-gold shrink-0">
          <BookOpen className="w-4 h-4" />
          <span>Browse Catalogue</span>
        </Link>
      </div>

      {/* Summary Stat Strip */}
      {!loading && !error && activeTab === 'All' && borrowings.length > 0 && (
        <motion.div variants={LIST_STAGGER} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statChips.map(({ label, value, icon: Icon, accent }) => (
            <motion.div key={label} variants={LIST_ITEM} className="os-panel p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className={`text-2xl font-extrabold tabular-nums leading-none ${accent || 'text-navy-900'}`}>{value}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">{label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

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
        <div className="os-panel py-16 px-6 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-navy-50 rounded-2xl flex items-center justify-center text-navy-700 mb-4">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-extrabold text-navy-800 mb-1">
            No {activeTab === 'All' ? '' : activeTab} borrowings
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
            Your requested and active physical book loans will appear here.
          </p>
          <Link to="/books" className="os-btn-gold">
            <span>Browse Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
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
