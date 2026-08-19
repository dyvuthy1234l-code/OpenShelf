import { useState } from 'react';
import { Power, Clock, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import librarianService from '../../services/librarianService';

export default function LibraryStatusToggle({ library, onStatusChange, compact = false }) {
  const [toggling, setToggling] = useState(false);

  if (!library) return null;

  const isAutoClosed = library.is_auto_closed ?? false;
  const isManuallyClosed = library.status === 'inactive';
  const isOpen = library.status === 'active' && !isAutoClosed;

  const handleToggle = async () => {
    try {
      setToggling(true);
      const targetStatus = isOpen ? 'inactive' : 'active';
      const res = await librarianService.toggleLibraryStatus(targetStatus);
      if (onStatusChange) {
        onStatusChange(res.library || res.data);
      }
    } catch (err) {
      console.error('Failed to toggle library status:', err);
    } finally {
      setToggling(false);
    }
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs ${
            isOpen
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : isAutoClosed
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOpen ? 'bg-emerald-500 animate-pulse' : isAutoClosed ? 'bg-amber-500' : 'bg-rose-500'
            }`}
          />
          <span>
            {isOpen
              ? 'Library Open'
              : isAutoClosed
              ? `Auto-Closed (${library.closing_time_label || 'Schedule'})`
              : 'Library Closed'}
          </span>
        </span>

        <button
          type="button"
          onClick={handleToggle}
          disabled={toggling}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black shadow-2xs transition-all cursor-pointer ${
            isOpen
              ? 'bg-rose-500 hover:bg-rose-600 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {toggling ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Power className="w-3.5 h-3.5" />
          )}
          <span>{isOpen ? 'Close Library' : 'Open Library'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
              isOpen
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : isAutoClosed
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOpen ? 'bg-emerald-500 animate-pulse' : isAutoClosed ? 'bg-amber-500' : 'bg-rose-500'
              }`}
            />
            <span>
              {isOpen
                ? '🟢 Operational (Open)'
                : isAutoClosed
                ? `🔴 Auto-Closed (Past ${library.closing_time_label || 'closing time'})`
                : '🔴 Closed (Manual)'}
            </span>
          </span>

          {library.opening_hours && (
            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <span>{library.opening_hours}</span>
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 font-medium">
          {isOpen
            ? 'Your library is currently OPEN for members to borrow books.'
            : isAutoClosed
            ? `Your library auto-closed at scheduled time (${library.closing_time_label || 'closing hours'}). Click to manually open.`
            : 'Your library is currently CLOSED manually.'}
        </p>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={toggling}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer shrink-0 ${
          isOpen
            ? 'bg-rose-500 hover:bg-rose-600 text-white'
            : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white'
        }`}
      >
        {toggling ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <Power className="w-4 h-4" />
        )}
        <span>{isOpen ? 'Close Library' : 'Open Library'}</span>
      </button>
    </div>
  );
}
