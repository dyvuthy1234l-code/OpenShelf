import { Building2, MapPin, Edit3, ShieldCheck } from 'lucide-react';

export default function LibraryHeader({ library, onEdit }) {
  if (!library) return null;

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs space-y-6">
      {/* Top Cover Image Banner */}
      <div className="relative h-48 sm:h-64 bg-slate-950 overflow-hidden">
        {library.cover_image_url ? (
          <img
            src={library.cover_image_url}
            alt={library.name}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-950 via-navy-950 to-slate-900 flex items-center justify-center">
            <Building2 className="w-16 h-16 text-amber-500/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
      </div>

      {/* Hero Body Content */}
      <div className="px-6 sm:px-8 pb-6 -mt-16 sm:-mt-20 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        {/* Logo Avatar + Info */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 min-w-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white p-1.5 shadow-xl border border-slate-200 shrink-0">
            <div className="w-full h-full rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center overflow-hidden font-extrabold text-3xl">
              {library.image_url ? (
                <img src={library.image_url} alt={library.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10 text-amber-600" />
              )}
            </div>
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 truncate tracking-tight">
                {library.name}
              </h1>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-0.5 rounded-full border capitalize shrink-0 ${
                (library.status || 'active') === 'active'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  (library.status || 'active') === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`} />
                {library.status || 'active'}
              </span>
            </div>

            {library.address && (
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">{library.address}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Library Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
