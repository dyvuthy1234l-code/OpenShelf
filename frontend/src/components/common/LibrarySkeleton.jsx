import { motion } from 'framer-motion';
import { CARD_MOTION_PROPS } from '../../constants/motionTokens';

export default function LibrarySkeleton() {
  return (
    <motion.div
      {...CARD_MOTION_PROPS}
      className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col h-full select-none"
    >
      {/* Cover Banner Skeleton */}
      <div className="relative h-36 sm:h-40 bg-slate-200 animate-pulse shrink-0">
        <div className="absolute top-3 left-3 w-24 h-5 bg-slate-300 rounded-full animate-pulse" />
        <div className="absolute top-3 right-3 w-16 h-5 bg-slate-300 rounded-full animate-pulse" />
        <div className="absolute bottom-3 right-3 w-20 h-6 bg-slate-300/80 rounded-xl animate-pulse" />
      </div>

      {/* Overlapping Logo & Content */}
      <div className="p-5 pt-0 flex flex-col flex-grow relative">
        {/* Logo Avatar Skeleton */}
        <div className="flex items-end justify-between -mt-9 sm:-mt-10 mb-3 z-20">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 border-2 border-white shadow-md shrink-0">
            <div className="w-full h-full bg-slate-200 animate-pulse rounded-xl" />
          </div>
        </div>

        {/* Title & Location Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-5 bg-slate-200 rounded-md w-3/4 animate-pulse" />
          <div className="h-4 bg-slate-150 rounded-md w-1/2 animate-pulse" />
        </div>

        {/* Details Skeleton */}
        <div className="space-y-2.5 mb-5 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-200 animate-pulse shrink-0" />
            <div className="h-3.5 bg-slate-100 rounded-md w-full animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-200 animate-pulse shrink-0" />
            <div className="h-3.5 bg-slate-100 rounded-md w-2/3 animate-pulse" />
          </div>
        </div>

        {/* Footer Button Skeleton */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded-md w-24 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded-md w-16 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
