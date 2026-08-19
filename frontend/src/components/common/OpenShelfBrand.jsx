import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const roleLabels = {
  member: ['LIBRARY NETWORK'],
  librarian: ['LIBRARY NETWORK', 'LIBRARIAN WORKSPACE'],
  admin: ['ADMIN WORKSPACE'],
};

const sizes = {
  xs: { mark: 'w-8 h-8 rounded-lg', icon: 'w-4 h-4', name: 'text-base', label: 'text-[8px]' },
  sm: { mark: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5', name: 'text-lg', label: 'text-[9px]' },
  md: { mark: 'w-12 h-12 rounded-xl', icon: 'w-6 h-6', name: 'text-xl', label: 'text-[10px]' },
  lg: { mark: 'w-14 h-14 rounded-2xl', icon: 'w-7 h-7', name: 'text-2xl', label: 'text-[11px]' },
};

export default function OpenShelfBrand({ role = 'member', size = 'sm', showSubtitle = true, dark = false, className = '' }) {
  const scale = sizes[size] || sizes.sm;
  const labels = roleLabels[role] || roleLabels.member;
  const isDark = dark || role !== 'member';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
      className={`openshelf-brand flex items-center gap-3 ${className}`}
      aria-label={`OpenShelf ${labels.join(' ')}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        whileHover={{ y: -1, scale: 1.04 }}
        className={`${scale.mark} bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0 transition-shadow duration-200 hover:shadow-lg`}
      >
        <BookOpen className={`${scale.icon} ${isDark ? 'text-slate-950' : 'text-slate-950'}`} strokeWidth={2.5} />
      </motion.div>
      {showSubtitle && (
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.12, ease: 'easeOut' }}
          className="min-w-0"
        >
          <span className={`${scale.name} font-extrabold ${isDark ? 'text-white' : 'text-slate-900'} tracking-tight block leading-none`}>OpenShelf</span>
          {labels.map((label, index) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.06, ease: 'easeOut' }}
              className={`block ${scale.label} ${isDark ? 'text-amber-400' : 'text-amber-600'} font-bold tracking-widest uppercase mt-1 leading-none`}
            >
              {label}
            </motion.span>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
