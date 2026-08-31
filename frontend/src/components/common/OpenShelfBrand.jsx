import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';

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

export default function OpenShelfBrand({ role = 'member', size = 'sm', showSubtitle = true, dark = null, className = '' }) {
  const scale = sizes[size] || sizes.sm;
  const labels = roleLabels[role] || roleLabels.member;
  const isExplicitDark = dark === true;
  const isExplicitLight = dark === false;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ scale: 1.02 }}
      className={`openshelf-brand flex items-center gap-3 ${className}`}
      aria-label={`OpenShelf ${labels.join(' ')}`}
    >
      {/* Animated Glowing Logo Mark Container */}
      <div className="relative shrink-0 flex items-center justify-center select-none">
        {/* Continuous Breathing Glow Background */}
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.95, 1.1, 0.95] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className={`${scale.mark} absolute rounded-xl bg-gradient-to-r from-[#FFD700] via-[#FBBF24] to-[#D9A83E] blur-sm pointer-events-none`}
        />

        {/* Main Logo Badge with Vivid Bright Gold Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          whileHover={{ y: -1, scale: 1.05 }}
          className={`${scale.mark} relative bg-gradient-to-br from-[#FFF099] via-[#F5B82E] to-[#C98A0C] border border-[#FFF5C2]/90 flex items-center justify-center shadow-lg shadow-[#D9A83E]/35 overflow-hidden shrink-0 transition-shadow duration-200 hover:shadow-xl`}
        >
          {/* Continuous Auto-Shimmer Light Sheen streak */}
          <motion.div
            animate={{ x: ['-150%', '150%'] }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              ease: [0.4, 0, 0.2, 1],
              repeatDelay: 1.3,
            }}
            className="absolute inset-0 w-3/4 h-full bg-gradient-to-r from-transparent via-white/90 to-transparent -skew-x-20 pointer-events-none z-10"
          />

          {/* Book Open Icon with sharp contrast */}
          <BookOpen className={`${scale.icon} text-[#0B1F3A] relative z-0 filter drop-shadow-xs`} strokeWidth={2.6} />

          {/* Tiny Sparkle Indicator */}
          <motion.div
            animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute top-0.5 right-0.5 pointer-events-none z-10"
          >
            <Sparkles className="w-2.5 h-2.5 text-white fill-white drop-shadow-xs" />
          </motion.div>
        </motion.div>
      </div>

      {showSubtitle && (
        <div className="min-w-0 flex flex-col justify-center">
          <span
            className={`${scale.name} font-black tracking-tight block leading-none ${
              isExplicitDark
                ? 'text-white'
                : isExplicitLight
                ? 'text-slate-900'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            Open<span className="text-amber-500">Shelf</span>
          </span>

          {labels.map((label) => (
            <span
              key={label}
              className={`block ${scale.label} font-extrabold tracking-widest uppercase mt-1 leading-none ${
                isExplicitDark
                  ? 'text-amber-400/90'
                  : isExplicitLight
                  ? 'text-amber-700'
                  : 'text-amber-700 dark:text-amber-400/90'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
