import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ReportFilters({
  activePreset: parentPreset = 'month',
  onApply,
  isFiltering = false,
}) {
  const [activePreset, setActivePreset] = useState(parentPreset);

  useEffect(() => {
    if (parentPreset) {
      setActivePreset(parentPreset);
    }
  }, [parentPreset]);

  const handlePreset = (preset) => {
    setActivePreset(preset);
    onApply({ preset });
  };

  const presets = [
    { key: 'today', label: 'Today' },
    { key: 'month', label: 'This Month' },
    { key: 'quarter', label: 'Last 3 Months' },
    { key: 'year', label: 'This Year' },
    { key: 'all', label: 'All Time' },
  ];

  return (
    <div className="bg-white border border-[#DCE6F0] rounded-2xl p-2.5 sm:p-3 shadow-xs shrink-0 transition-all duration-200">
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        {/* Quick Filter Presets */}
        <div className="flex items-center gap-1 bg-[#F5F8FC] p-1 rounded-xl border border-[#DCE6F0] shrink-0 flex-wrap">
          {presets.map((p) => {
            const isActive = activePreset === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => handlePreset(p.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#D9A83E] text-[#0B1F3A] font-black shadow-xs scale-[1.02]'
                    : 'text-[#64748B] hover:text-[#102A43] hover:bg-[#DCE6F0]/50'
                }`}
              >
                <span>{p.label}</span>
                {isActive && isFiltering && (
                  <Loader2 className="w-3 h-3 text-[#0B1F3A] animate-spin shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Live Filter Indicator Status Badge */}
        {isFiltering && (
          <div className="flex items-center gap-2 text-xs font-bold text-[#123A63] bg-[#F5F8FC] px-3 py-1 rounded-xl border border-[#DCE6F0] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#D9A83E]" />
            <span>Updating analytics...</span>
          </div>
        )}
      </div>
    </div>
  );
}
