import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorState({ 
  message = 'Failed to load data. Please try again.',
  onRetry = null
}) {
  return (
    <div className="py-10 px-6 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col items-center text-center">
      <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
      <p className="text-rose-800 font-semibold text-xs sm:text-sm mb-4 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
