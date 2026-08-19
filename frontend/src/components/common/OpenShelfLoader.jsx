import { motion } from 'framer-motion';
import OpenShelfBrand from './OpenShelfBrand';

export default function OpenShelfLoader({ message = 'Loading your library...', compact = false }) {
  return (
    <div className={`openshelf-loader flex flex-col items-center justify-center text-center ${compact ? 'py-8 gap-3' : 'min-h-screen gap-5'}`} role="status" aria-live="polite">
      <OpenShelfBrand role="member" size={compact ? 'sm' : 'md'} />
      <motion.div
        className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <motion.div
          className="h-full w-2/5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
          animate={{ x: ['-120%', '280%'] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
      <span className="text-xs text-slate-500 font-medium">{message}</span>
    </div>
  );
}
