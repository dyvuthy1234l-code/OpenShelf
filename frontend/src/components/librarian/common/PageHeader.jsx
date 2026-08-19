import React from 'react';

export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200/80 shrink-0">
      <div className="space-y-0.5 min-w-0">
        {eyebrow && (
          <span className="text-[9px] uppercase font-extrabold tracking-widest text-amber-700 block">
            {eyebrow}
          </span>
        )}
        <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
          {title}
        </h1>
        {description && (
          <p className="text-slate-500 text-xs truncate max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
