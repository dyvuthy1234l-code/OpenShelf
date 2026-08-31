import { motion } from 'framer-motion';
import OpenShelfBrand from './OpenShelfBrand';

export default function OpenShelfLoader({ message = 'Loading your library...', compact = false, dark = null }) {
  const isExplicitDark = dark === true;
  const isExplicitLight = dark === false;

  return (
    <div
      className={`openshelf-loader flex flex-col items-center justify-center text-center select-none ${
        compact ? 'py-8 gap-3.5' : 'gap-6 p-6'
      }`}
      role="status"
      aria-live="polite"
    >
      {/* Brand Header with theme-adaptive styling */}
      <OpenShelfBrand role="member" size={compact ? 'sm' : 'md'} dark={dark} />

      {/* Sleek Glowing Progress Bar & Status Text */}
      <div className="relative flex flex-col items-center gap-3 mt-1">
        <motion.div
          className={`w-44 h-1.5 rounded-full overflow-hidden border shadow-inner ${
            isExplicitDark
              ? 'bg-slate-800/80 border-slate-700/60'
              : isExplicitLight
              ? 'bg-slate-200 border-slate-300/60'
              : 'bg-slate-200 dark:bg-slate-800/80 border-slate-300/60 dark:border-slate-700/60'
          }`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <motion.div
            className="h-full w-1/2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.7)]"
            animate={{ x: ['-120%', '220%'] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Message Text with smooth breathing pulse */}
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: [0.7, 1, 0.7], y: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className={`text-xs font-semibold tracking-wide ${
            isExplicitDark
              ? 'text-slate-300'
              : isExplicitLight
              ? 'text-slate-600'
              : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}
