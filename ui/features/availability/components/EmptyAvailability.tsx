import { CalendarClock, Clock, Plus } from "lucide-react";
import { Skeleton } from "@/ui/components/shadcn/skeleton";
import { Card, CardContent, CardHeader } from "@/ui/components/shadcn/card";
import { Button } from "@/ui/components/shadcn/button";

// Empty state when no availability is configured
interface EmptyAvailabilityProps {
  onAddFirst: () => void;
}

export function EmptyAvailability({ onAddFirst }: EmptyAvailabilityProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
        <CalendarClock className="size-8 text-primary" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">
        Sin horarios configurados
      </h3>
      <p className="mb-6 max-w-sm text-muted-foreground">
        Configura tu disponibilidad semanal para que los estudiantes puedan
        reservar sesiones contigo.
      </p>
      <Button onClick={onAddFirst}>
        <Plus className="mr-2 size-4" />
        Agregar primer horario
      </Button>
    </div>
  );
}

// Skeleton loader for the weekly calendar
export function WeeklyCalendarSkeleton() {
  const days = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun

  return (
    <div className="space-y-4">
      {days.map((day) => (
        <Card key={day}>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="size-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pb-4 pt-0">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="flex gap-1">
                <Skeleton className="size-8" />
                <Skeleton className="size-8" />
                <Skeleton className="size-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Error state
interface AvailabilityErrorProps {
  message: string;
  onRetry: () => void;
}

export function AvailabilityError({ message, onRetry }: AvailabilityErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-12 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <Clock className="size-8 text-destructive" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Error al cargar</h3>
      <p className="mb-6 max-w-sm text-muted-foreground">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}
