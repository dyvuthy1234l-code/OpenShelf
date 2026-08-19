import { LayoutDashboard, Clock } from 'lucide-react';

export default function LibrarianPlaceholder({ title = 'Dashboard' }) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
          <LayoutDashboard className="w-4 h-4" />
          <span>Librarian Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">{title}</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">OpenShelf Library Management Workspace</p>
      </div>

      {/* Step 1 Shell Placeholder */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center space-y-4 shadow-xs">
        <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
          <Clock className="w-7 h-7" />
        </div>

        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Step 1 authentication, authorization, routing, and layout shell are active. Full management functionality for {title} will be implemented in subsequent steps.
          </p>
        </div>

        <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-extrabold rounded-full uppercase tracking-wider">
          Coming in the next step
        </div>
      </div>
    </div>
  );
}
