import { useState } from 'react';
import { RotateCcw, Calendar } from 'lucide-react';

export default function ReportFilters({
  startDate,
  endDate,
  onApply,
  onReset,
}) {
  const [localStart, setLocalStart] = useState(startDate || '');
  const [localEnd, setLocalEnd] = useState(endDate || '');
  const [activePreset, setActivePreset] = useState('month');
  const [error, setError] = useState('');

  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleApply = (e) => {
    e.preventDefault();
    if (localStart && localEnd && new Date(localStart) > new Date(localEnd)) {
      setError('Start date must be before or equal to end date.');
      return;
    }
    setError('');
    setActivePreset('custom');
    onApply({ startDate: localStart, endDate: localEnd, preset: 'custom' });
  };

  const handlePreset = (preset) => {
    setError('');
    setActivePreset(preset);
    let start = '';
    let end = '';

    const today = new Date();
    const todayStr = formatDateLocal(today);

    if (preset === 'today') {
      start = todayStr;
      end = todayStr;
    } else if (preset === 'month') {
      end = todayStr;
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      start = formatDateLocal(firstDay);
    } else if (preset === 'quarter') {
      end = todayStr;
      const qStart = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      start = formatDateLocal(qStart);
    } else if (preset === 'year') {
      end = todayStr;
      const yStart = new Date(today.getFullYear(), 0, 1);
      start = formatDateLocal(yStart);
    } else if (preset === 'all') {
      start = '';
      end = '';
    }

    setLocalStart(start);
    setLocalEnd(end);
    onApply({ startDate: start, endDate: end, preset });
  };

  const handleResetClick = () => {
    setLocalStart('');
    setLocalEnd('');
    setActivePreset('all');
    setError('');
    onReset();
  };

  const presets = [
    { key: 'today', label: 'Today' },
    { key: 'month', label: 'This Month' },
    { key: 'quarter', label: 'Last 3 Months' },
    { key: 'year', label: 'This Year' },
    { key: 'all', label: 'All Time' },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 shadow-2xs space-y-1.5 shrink-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        {/* Quick Filter Presets */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shrink-0 flex-wrap">
          {presets.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => handlePreset(p.key)}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activePreset === p.key
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers & Action Buttons */}
        <form onSubmit={handleApply} className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              value={localStart}
              onChange={(e) => setLocalStart(e.target.value)}
              className="bg-transparent focus:outline-hidden text-xs font-bold text-slate-900 cursor-pointer"
              title="Start Date"
            />
            <span className="text-slate-400 font-extrabold">→</span>
            <input
              type="date"
              value={localEnd}
              onChange={(e) => setLocalEnd(e.target.value)}
              className="bg-transparent focus:outline-hidden text-xs font-bold text-slate-900 cursor-pointer"
              title="End Date"
            />
          </div>

          <button
            type="submit"
            className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            Apply Filter
          </button>

          <button
            type="button"
            onClick={handleResetClick}
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </form>
      </div>

      {error && <p className="text-xs font-bold text-rose-600 px-1">{error}</p>}
    </div>
  );
}
