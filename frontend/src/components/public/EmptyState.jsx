import { BookX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState({ 
  title = 'No items found', 
  description = 'Try adjusting your search criteria or filters.',
  action = null
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="py-16 px-4 flex flex-col items-center justify-center text-center bg-white border border-slate-200/80 rounded-2xl shadow-xs"
    >
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
        <BookX className="w-7 h-7 text-slate-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 text-xs sm:text-sm max-w-md mb-6">{description}</p>
      {action}
    </motion.div>
  );
}
