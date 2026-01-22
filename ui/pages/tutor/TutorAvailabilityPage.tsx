import { useState } from "react";
import { motion } from "motion/react";
import { CalendarClock, Info } from "lucide-react";
import { useAuthStore } from "@/ui/stores/auth.store";
import { Alert, AlertDescription } from "@/ui/components/shadcn/alert";
import { TooltipProvider } from "@/ui/components/shadcn/tooltip";
import {
  useTutorAvailability,
  useTutorProfileId,
  WeeklyCalendar,
  WeeklyCalendarSkeleton,
  EmptyAvailability,
  AvailabilityError,
  AddSlotButton,
  TimeSlotEditor,
  DAY_OF_WEEK,
} from "@/ui/features/availability";

export default function TutorAvailabilityPage() {
  const { user } = useAuthStore();
  const [editorOpen, setEditorOpen] = useState(false);

  // Get tutor profile ID
  const {
    data: tutorProfileId,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useTutorProfileId(user?.id);

  // Get availability slots
  const {
    data: slots,
    isLoading: isLoadingSlots,
    error: slotsError,
    refetch,
  } = useTutorAvailability(tutorProfileId);

  const isLoading = isLoadingProfile || isLoadingSlots;
  const error = profileError || slotsError;

  const handleAddFirst = () => {
    setEditorOpen(true);
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarClock className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Disponibilidad</h1>
              <p className="text-sm text-muted-foreground">
                Configura los horarios en que estarás disponible para dar clases
              </p>
            </div>
          </div>
        </div>

        {/* Info alert */}
        <Alert>
          <Info className="size-4" />
          <AlertDescription>
            Los estudiantes podrán reservar sesiones contigo solo en los
            horarios que configures aquí. Puedes desactivar temporalmente un
            horario sin eliminarlo.
          </AlertDescription>
        </Alert>

        {/* Main content */}
        {isLoading ? (
          <WeeklyCalendarSkeleton />
        ) : error ? (
          <AvailabilityError
            message="No pudimos cargar tu disponibilidad. Por favor, intenta de nuevo."
            onRetry={() => refetch()}
          />
        ) : !slots || slots.length === 0 ? (
          <EmptyAvailability onAddFirst={handleAddFirst} />
        ) : (
          tutorProfileId && (
            <WeeklyCalendar slots={slots} tutorProfileId={tutorProfileId} />
          )
        )}

        {/* Floating add button - only show when we have slots already */}
        {slots && slots.length > 0 && (
          <AddSlotButton onClick={() => setEditorOpen(true)} />
        )}

        {/* Editor dialog for the floating button */}
        {tutorProfileId && (
          <TimeSlotEditor
            open={editorOpen}
            onOpenChange={setEditorOpen}
            tutorProfileId={tutorProfileId}
            defaultDay={DAY_OF_WEEK.MONDAY}
          />
        )}
      </motion.div>
    </TooltipProvider>
  );
}
