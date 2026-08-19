import { Link } from 'react-router-dom';
import { Building2, MapPin, BookOpen, Users, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LibrarySummary({ library, booksCount = 0, membersCount = 0 }) {
  if (!library) {
    return (
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Library Setup Required</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Your library has not been configured yet</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
            Configure your physical library profile, location, address, and operating hours so community members can browse your books and request loans.
          </p>
        </div>

        <Link
          to="/librarian/library"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all shrink-0"
        >
          <span>Configure My Library</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-2xl overflow-hidden shrink-0 shadow-xs">
            {library.image_url ? (
              <img src={library.image_url} alt={library.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-7 h-7 text-amber-600" />
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-slate-900 truncate">{library.name}</h3>
              <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border capitalize shrink-0 ${
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
              <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">{library.address}</span>
              </p>
            )}
          </div>
        </div>

        <Link
          to="/librarian/library"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all shrink-0"
        >
          <span>Manage Library</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Library Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Books</span>
          <span className="text-lg font-extrabold text-slate-900">{booksCount}</span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Registered Members</span>
          <span className="text-lg font-extrabold text-slate-900">{membersCount}</span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Borrow Period</span>
          <span className="text-lg font-extrabold text-slate-900">{library.borrowing_period_days || 7} Days</span>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Overdue Fine</span>
          <span className="text-lg font-extrabold text-slate-900">${library.fine_per_day || '0.50'} / day</span>
        </div>
      </div>
    </div>
  );
}
