import { motion } from 'framer-motion';
import { CARD_MOTION_PROPS } from '../../constants/motionTokens';

export default function LibrarySkeleton() {
  return (
    <motion.div
      {...CARD_MOTION_PROPS}
      className="bg-white border border-slate-200/70 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full select-none"
    >
      {/* Cover Banner Skeleton */}
      <div className="relative h-36 sm:h-40 bg-slate-200 animate-pulse shrink-0" />

      {/* Overlapping Logo & Content */}
      <div className="p-5 pt-0 flex flex-col flex-grow relative">
        {/* Logo Avatar Skeleton */}
        <div className="flex items-end justify-between -mt-9 sm:-mt-10 mb-3 z-20">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 border-2 border-white shadow-md shrink-0">
            <div className="w-full h-full bg-slate-200 animate-pulse rounded-xl" />
          </div>
        </div>

        {/* Title & Stats */}
        <div className="space-y-3 mb-3">
          <div className="h-5 bg-slate-200 rounded-md w-3/4 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded-md w-1/2 animate-pulse" />
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-3 bg-slate-100 rounded-md w-full animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-3 bg-slate-100 rounded-md w-2/3 animate-pulse" />
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="h-8 bg-slate-200 rounded-xl w-full animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
