import React from 'react';

export default function BookSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs animate-pulse space-y-4"
        >
          {/* Book Cover Placeholder */}
          <div className="w-full h-56 bg-gray-200/80 rounded-xl" />

          {/* Title & Author Lines */}
          <div className="space-y-2 pt-1">
            <div className="h-4 bg-gray-200/90 rounded-md w-3/4" />
            <div className="h-3 bg-gray-200/70 rounded-md w-1/2" />
          </div>

          {/* Tag & Action Button */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="h-5 bg-gray-200/60 rounded-full w-20" />
            <div className="h-8 bg-gray-200/80 rounded-lg w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
