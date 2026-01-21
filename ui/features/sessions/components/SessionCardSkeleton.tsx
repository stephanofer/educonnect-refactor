import { Card, CardContent } from "@/ui/components/shadcn/card";
import { Skeleton } from "@/ui/components/shadcn/skeleton";

export function SessionCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left side */}
          <div className="flex gap-3 flex-1">
            <Skeleton className="size-12 rounded-full shrink-0" />

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-3 mt-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-24 mt-2" />
            </div>
          </div>

          {/* Right side */}
          <div className="flex flex-col items-end gap-3">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
