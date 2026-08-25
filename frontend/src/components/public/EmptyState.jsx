import { BookX, SearchX } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState({ 
  title = 'No results found', 
  description = 'We couldn\'t find anything matching your search. Try adjusting your filters or keywords.',
  action = null
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="os-panel py-20 px-6 flex flex-col items-center justify-center text-center shadow-sm"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gold-200/40 blur-xl rounded-full scale-150" />
        <div className="relative w-20 h-20 bg-white border border-brand-border rounded-3xl shadow-md flex items-center justify-center text-slate-400 rotate-3 hover:rotate-0 transition-transform duration-500">
          <SearchX className="w-10 h-10 text-gold-500" />
        </div>
      </div>
      <h3 className="text-xl font-extrabold text-navy-800 mb-2 tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </motion.div>
  );
}
