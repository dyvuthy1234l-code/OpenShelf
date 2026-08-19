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
        <motion.div
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.12, ease: 'easeOut' }}
          className="min-w-0 flex flex-col justify-center"
        >
          {/* Animated Vivid Brand Name Text */}
          <motion.span
            animate={{
              backgroundPosition: ['0% 50%', '200% 50%', '0% 50%'],
            }}
            transition={{ repeat: Infinity, duration: 4.5, ease: 'linear' }}
            style={{ backgroundSize: '200% auto' }}
            className={`${scale.name} font-black tracking-tight block leading-none text-transparent bg-clip-text ${
              isDark
                ? 'bg-gradient-to-r from-white via-[#FFF5C2] via-[#FFD700] via-[#FFF5C2] to-white drop-shadow-xs'
                : 'bg-gradient-to-r from-[#102A43] via-[#163F6B] via-[#D9A83E] via-[#163F6B] to-[#102A43]'
            }`}
          >
            OpenShelf
          </motion.span>

          {/* Animated Vivid Role Subtitle Labels */}
          {labels.map((label, index) => (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 3 }}
              animate={{
                opacity: [0.85, 1, 0.85],
                filter: isDark ? ['brightness(1)', 'brightness(1.3)', 'brightness(1)'] : ['brightness(1)', 'brightness(1.15)', 'brightness(1)'],
              }}
              transition={{
                opacity: { duration: 0.3, delay: 0.2 + index * 0.06 },
                filter: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' },
              }}
              className={`block ${scale.label} font-black tracking-widest uppercase mt-1 leading-none text-transparent bg-clip-text ${
                isDark
                  ? 'bg-gradient-to-r from-[#FFD700] via-[#FFF2B2] to-[#D9A83E]'
                  : 'bg-gradient-to-r from-[#123A63] via-[#163F6B] to-[#D9A83E]'
              }`}
            >
              {label}
            </motion.span>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
