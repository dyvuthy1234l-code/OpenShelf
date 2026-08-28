export function SkeletonBlock({ className = '', h = 'h-64' }) {
  return <div className={`os-skeleton rounded-2xl ${h} ${className}`} />;
}

export function SkeletonText({ w = 'w-full', h = 'h-3', className = '' }) {
  return <div className={`os-skeleton-text ${h} ${w} ${className}`} />;
}

export function SkeletonCircle({ size = 'w-10 h-10', className = '' }) {
  return <div className={`os-skeleton-circle ${size} ${className}`} />;
}

export function ListSkeleton({ rows = 5, className = '' }) {
  return (
    <div className={`bg-white border border-slate-200/90 rounded-2xl overflow-hidden mt-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 border-b border-slate-100 last:border-0">
          <SkeletonCircle size="w-8 h-8" />
          <div className="flex-1 space-y-2">
            <SkeletonText w="w-2/5" h="h-3.5" />
            <SkeletonText w="w-1/4" h="h-2.5" />
          </div>
          <SkeletonText w="w-16" h="h-6" className="rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3.5">
        <SkeletonCircle size="w-10 h-10" />
        <div className="space-y-2 flex-1">
          <SkeletonText w="w-32" h="h-6" />
          <SkeletonText w="w-1/3" h="h-3" />
        </div>
      </div>
      <SkeletonBlock h="h-64" />
      <SkeletonBlock h="h-40" />
    </div>
  );
}
