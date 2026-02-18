import { Skeleton } from "@/ui/components/shadcn/skeleton";

interface MaterialCardSkeletonProps {
  count?: number;
}

export function MaterialCardSkeleton({ count = 1 }: MaterialCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-full flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card"
        >
          {/* Thumbnail Skeleton */}
          <Skeleton className="h-44 w-full rounded-none" />

          <div className="flex flex-1 flex-col p-4">
            {/* Category */}
            <Skeleton className="mb-2 h-3 w-20" />

            {/* Title */}
            <Skeleton className="mb-1.5 h-5 w-full" />
            <Skeleton className="mb-3 h-5 w-3/4" />

            {/* Description */}
            <Skeleton className="mb-1 h-3.5 w-full" />
            <Skeleton className="mb-4 h-3.5 w-5/6" />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
