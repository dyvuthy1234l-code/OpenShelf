import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { MOTION_DURATIONS, MOTION_EASINGS } from '../../constants/motionTokens';

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
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
