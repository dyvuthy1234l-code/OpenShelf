import { useState } from 'react';
import { Calendar, Building2 } from 'lucide-react';
import LibraryStatusToggle from './LibraryStatusToggle';

export default function DashboardHeader({ user, library, dateRange, onDateRangeChange, onLibraryStatusChange }) {
  const [activePreset, setActivePreset] = useState(dateRange?.preset || 'all');

  const handlePresetSelect = (preset) => {
    setActivePreset(preset);
    let startDate = '';
    let endDate = '';

    const today = new Date();
    if (preset === 'today') {
      startDate = today.toISOString().split('T')[0];
      endDate = startDate;
    } else if (preset === 'week') {
      endDate = today.toISOString().split('T')[0];
      const d = new Date(today);
      d.setDate(d.getDate() - 7);
      startDate = d.toISOString().split('T')[0];
    } else if (preset === 'month') {
      endDate = today.toISOString().split('T')[0];
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = d.toISOString().split('T')[0];
    } else if (preset === 'year') {
      endDate = today.toISOString().split('T')[0];
      const d = new Date(today.getFullYear(), 0, 1);
      startDate = d.toISOString().split('T')[0];
    }

    onDateRangeChange({ startDate, endDate, preset });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200/80 shrink-0 min-h-[75px]">
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-amber-700 block">
            EXECUTIVE ANALYTICS DASHBOARD
          </span>
          {library?.name && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/80 truncate">
              <Building2 className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="truncate max-w-[160px]">{library.name}</span>
            </span>
          )}
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
          Welcome back, {user?.name || 'Librarian'}
        </h1>
        <p className="text-xs text-slate-500 font-medium truncate">
          Overview of your library performance, circulation, and member activity.
        </p>
      </div>

      {/* Status Toggle & Date Range Selector */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {library && (
          <LibraryStatusToggle
            library={library}
            onStatusChange={onLibraryStatusChange}
            compact={true}
          />
        )}

        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-2xs shrink-0 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5 hidden sm:inline" />
          {[
            { key: 'all', label: 'All Time' },
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' },
            { key: 'year', label: 'This Year' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handlePresetSelect(item.key)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                activePreset === item.key
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
