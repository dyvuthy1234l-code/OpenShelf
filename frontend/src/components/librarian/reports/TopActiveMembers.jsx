import { useMemo } from 'react';
import { Users, User } from 'lucide-react';

export default function TopActiveMembers({ reportData = null, borrowings = [] }) {
  const topMembers = useMemo(() => {
    // 1. Check if backend provided top_members array
    if (reportData?.top_members && Array.isArray(reportData.top_members) && reportData.top_members.length > 0) {
      return reportData.top_members.slice(0, 4);
    }

    // 2. Compute from borrowings prop / reportData.borrowing_history
    const history = borrowings.length > 0 ? borrowings : (reportData?.borrowing_history || []);
    if (!history || !history.length) return [];

    const map = {};
    history.forEach((b) => {
      if (!b.user || !b.user.id) return;
      const uid = b.user.id;
      if (!map[uid]) {
        map[uid] = {
          user: b.user,
          borrowings_count: 0,
          returned_count: 0,
        };
      }
      map[uid].borrowings_count += 1;
      if (b.status === 'returned') {
        map[uid].returned_count += 1;
      }
    });

    return Object.values(map)
      .sort((a, b) => b.borrowings_count - a.borrowings_count)
      .slice(0, 4);
  }, [reportData, borrowings]);

  // Rank badge styling helper
  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'bg-blue-600 text-white border-blue-700 shadow-xs font-black';
    if (rank === 2) return 'bg-slate-300 text-slate-800 border-slate-400 font-extrabold';
    if (rank === 3) return 'bg-amber-700/80 text-white border-amber-800 font-extrabold';
    return 'bg-slate-100 text-slate-600 border-slate-200/80 font-bold';
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 lg:p-5 shadow-2xs h-[250px] min-h-[250px] flex flex-col justify-between">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-1 shrink-0">
        <div>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight leading-tight uppercase flex items-center gap-2">
            TOP ACTIVE MEMBERS
          </h3>
          <p className="text-[10.5px] font-medium text-slate-400 mt-0.5">
            Members with highest borrowing activity.
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
          <Users className="w-4 h-4" />
        </div>
      </div>

      {/* Main List Content (Top 4 Items) */}
      {topMembers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-xs text-slate-400 font-medium italic bg-slate-50 rounded-xl border border-dashed border-slate-200 my-1">
          No active member activity recorded for this period.
        </div>
      ) : (
        <div className="space-y-1.5 flex-1 min-h-0 flex flex-col justify-center">
          {topMembers.map((item, idx) => {
            const userObj = item.user || {};
            const totalBorrowings = item.borrowings_count ?? item.total_borrowings ?? 1;
            const rank = idx + 1;

            return (
              <div
                key={userObj.id || idx}
                className="flex items-center justify-between gap-3 text-xs p-2 rounded-xl hover:bg-slate-50/90 transition-all border border-transparent hover:border-slate-200/70"
              >
                {/* Left: Rank + Avatar + Member Name */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Rank Badge */}
                  <span className={`w-5 h-5 rounded-md border text-[10px] flex items-center justify-center shrink-0 leading-none ${getRankBadgeClass(rank)}`}>
                    #{rank}
                  </span>

                  {/* Avatar */}
                  <div className="w-6 h-6 rounded-full bg-blue-600 border border-white text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                    {userObj.avatar_url || userObj.avatar ? (
                      <img src={userObj.avatar_url || userObj.avatar} alt={userObj.name} className="w-full h-full object-cover" />
                    ) : (
                      userObj.name ? userObj.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {/* Name */}
                  <span className="font-bold text-slate-900 truncate text-xs" title={userObj.name}>
                    {userObj.name || 'Member'}
                  </span>
                </div>

                {/* Right: Borrow Count Pill */}
                <div className="shrink-0">
                  <span className="inline-flex items-center text-[10.5px] font-extrabold text-slate-700 bg-slate-100/90 border border-slate-200/70 px-2.5 py-1 rounded-lg">
                    {totalBorrowings} {totalBorrowings === 1 ? 'borrow' : 'borrows'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
