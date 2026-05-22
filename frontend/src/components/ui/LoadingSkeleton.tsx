import { cn } from '../../lib/classNames';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading"
      className={cn('skeleton rounded', className)}
    />
  );
}

/** 4 skeleton charger cards */
export function ChargerCardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" aria-busy="true">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-brand-800 rounded-card p-5 space-y-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-full mt-2" />
        </div>
      ))}
    </div>
  );
}

/** 3 skeleton booking cards */
export function BookingCardSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-brand-800 rounded-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

/** 3 skeleton notification items */
export function NotificationSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-brand-800 rounded-card p-4 space-y-2">
          <div className="flex gap-3">
            <Skeleton className="h-5 w-5 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** 3 KPI skeleton tiles */
export function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-busy="true">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-brand-800 rounded-card p-6 space-y-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

/** Table row skeletons */
export function TableRowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 bg-brand-800 rounded">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}
