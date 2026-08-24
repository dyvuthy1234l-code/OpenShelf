import React from 'react';

export default function BookSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs flex flex-col h-full animate-pulse"
        >
          {/* Cover Image Placeholder */}
          <div className="relative aspect-[3/4] w-full bg-slate-200/80 shrink-0" />

          {/* Book Info */}
          <div className="p-4 sm:p-5 flex flex-col flex-grow bg-white space-y-3">
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded w-5/6" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>

            <div className="flex items-center justify-between pt-2 mt-auto">
              <div className="h-3 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
