import { Phone, Mail, Clock, MapPin, Globe, FileText, ExternalLink } from 'lucide-react';

export default function LibraryInfo({ library }) {
  if (!library) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Description & Borrowing Rules */}
      <div className="lg:col-span-8 space-y-6">
        {/* Description */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-amber-700">
            About the Library
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {library.description || 'No library description provided yet. Click "Edit Library Profile" to add details about your physical library.'}
          </p>
        </div>

        {/* Borrowing Rules */}
        {library.borrowing_rules && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-amber-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Borrowing Rules & Guidelines</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {library.borrowing_rules}
            </p>
          </div>
        )}
      </div>

      {/* Right Column: Contact & Operating Details Card */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-amber-700 border-b border-slate-100 pb-3">
            Contact & Location
          </h3>

          <div className="space-y-4 text-xs">
            {library.address && (
              <div className="flex items-start gap-3 text-slate-700">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Address</span>
                  <span className="font-medium leading-relaxed">{library.address}</span>
                </div>
              </div>
            )}

            {library.phone && (
              <div className="flex items-start gap-3 text-slate-700">
                <Phone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Phone</span>
                  <span className="font-medium">{library.phone}</span>
                </div>
              </div>
            )}

            {library.email && (
              <div className="flex items-start gap-3 text-slate-700">
                <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Email</span>
                  <span className="font-medium">{library.email}</span>
                </div>
              </div>
            )}

            {library.opening_hours && (
              <div className="flex items-start gap-3 text-slate-700">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Opening Hours</span>
                  <span className="font-medium">{library.opening_hours}</span>
                </div>
              </div>
            )}
          </div>

          {library.google_maps_url && (
            <div className="pt-3 border-t border-slate-100">
              <a
                href={library.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all"
              >
                <span>View on Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
