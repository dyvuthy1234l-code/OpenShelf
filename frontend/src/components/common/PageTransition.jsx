import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import { MOTION_DURATIONS, MOTION_EASINGS } from '../../constants/motionTokens';

const Fallback = () => (
  <div className="flex-1 flex items-center justify-center p-12 min-h-[50vh]">
    <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function PageTransition({ children, className = '' }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: MOTION_DURATIONS.NORMAL, ease: MOTION_EASINGS.EASE_OUT }}
        className={`min-h-0 ${className}`}
      >
        <Suspense fallback={<Fallback />}>
          {children}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
