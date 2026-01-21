import { Card, CardContent, CardFooter } from "@/ui/components/shadcn/card";
import { Skeleton } from "@/ui/components/shadcn/skeleton";

interface MaterialCardSkeletonProps {
  count?: number;
}

export function MaterialCardSkeleton({ count = 1 }: MaterialCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="h-full overflow-hidden">
          {/* Thumbnail Skeleton */}
          <Skeleton className="h-32 w-full rounded-none" />

          <CardContent className="p-4">
            {/* Category */}
            <Skeleton className="mb-2 h-3 w-16" />
            
            {/* Title */}
            <Skeleton className="mb-2 h-5 w-full" />
            <Skeleton className="mb-3 h-5 w-3/4" />
            
            {/* Description */}
            <Skeleton className="mb-3 h-4 w-full" />
            
            {/* Tag */}
            <Skeleton className="h-5 w-20 rounded-full" />
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t px-4 py-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-8 w-20" />
          </CardFooter>
        </Card>
      ))}
    </>
  );
}
