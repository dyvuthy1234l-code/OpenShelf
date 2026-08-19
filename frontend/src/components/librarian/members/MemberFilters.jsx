import { Search, X, Filter, RotateCcw } from 'lucide-react';

export default function MemberFilters({
  search,
  onSearchChange,
  filterStatus,
  onFilterChange,
  onClearFilters,
}) {
  const hasActiveFilters = Boolean(search || (filterStatus && filterStatus !== 'all'));

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search members by name, email, or phone..."
          className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Status Dropdown & Clear Button */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <select
            value={filterStatus || 'all'}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
          >
            <option value="all">All Library Members</option>
            <option value="active">Active Borrowers</option>
            <option value="overdue">Overdue Members</option>
            <option value="returned">Clear / Returned</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
            title="Clear all filters"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
