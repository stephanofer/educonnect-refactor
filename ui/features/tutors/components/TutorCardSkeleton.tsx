import { Skeleton } from "@/ui/components/shadcn/skeleton";
import { Card, CardContent } from "@/ui/components/shadcn/card";

interface TutorCardSkeletonProps {
  count?: number;
}

export function TutorCardSkeleton({ count = 1 }: TutorCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="size-16 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full mt-4" />
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
