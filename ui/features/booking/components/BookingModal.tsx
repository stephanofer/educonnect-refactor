import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  Loader2,
  CheckCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/ui/components/shadcn/dialog";
import { Button } from "@/ui/components/shadcn/button";
import { Calendar } from "@/ui/components/shadcn/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/components/shadcn/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/shadcn/select";
import { Textarea } from "@/ui/components/shadcn/textarea";
import { Label } from "@/ui/components/shadcn/label";
import { Badge } from "@/ui/components/shadcn/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { Skeleton } from "@/ui/components/shadcn/skeleton";
import { cn } from "@/ui/lib/utils";
import { toast } from "sonner";
import { useAvailableSlots, useCreateBooking, useBookingSubjects } from "../hooks";
import type { TutorDetail, TutorListItem } from "@/ui/features/tutors";

// Duration options in minutes
const DURATION_OPTIONS = [
  { value: 30, label: "30 minutos" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1 hora 30 min" },
  { value: 120, label: "2 horas" },
];

// Form schema
const bookingSchema = z.object({
  date: z.date({ error: "Selecciona una fecha" }),
  time: z.string().min(1, { error: "Selecciona una hora" }),
  duration: z.number().min(30),
  subjectId: z.string().min(1, { error: "Selecciona una materia" }),
  description: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingModalProps {
  tutor: TutorListItem | TutorDetail | null;
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BookingModal({
  tutor,
  studentId,
  isOpen,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { data: subjects, isLoading: subjectsLoading } = useBookingSubjects();
  const createBooking = useCreateBooking();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      duration: 60,
      description: "",
    },
  });

  const selectedDate = form.watch("date");
  const selectedDuration = form.watch("duration");

  // Format date for API
  const dateString = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : undefined;

  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(
    tutor?.id,
    dateString
  );

  // Filter available slots based on duration
  const availableSlots = slots?.filter((slot) => {
    if (!slot.available) return false;

    // Check if there's enough consecutive time for the duration
    const slotIndex = slots.findIndex((s) => s.time === slot.time);
    const slotsNeeded = selectedDuration / 30;

    for (let i = 0; i < slotsNeeded; i++) {
      const checkSlot = slots[slotIndex + i];
      if (!checkSlot || !checkSlot.available) return false;
    }

    return true;
  });

  const handleSubmit = async (data: BookingFormData) => {
    if (!tutor) return;

    // Build scheduled_at timestamp
    const scheduledAt = new Date(`${format(data.date, "yyyy-MM-dd")}T${data.time}:00`);

    try {
      await createBooking.mutateAsync({
        tutorId: tutor.id,
        studentId,
        subjectId: data.subjectId,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes: data.duration,
        description: data.description,
      });

      setStep("success");
      toast.success("¡Sesión reservada con éxito!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al reservar la sesión"
      );
    }
  };

  const handleClose = () => {
    setStep("form");
    form.reset();
    onClose();
    if (step === "success") {
      onSuccess?.();
    }
  };

  // Calculate price
  const price = tutor
    ? (tutor.hourlyRate * selectedDuration) / 60
    : 0;

  if (!tutor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Reservar sesión</DialogTitle>
              <DialogDescription>
                Agenda una sesión con {tutor.fullName}
              </DialogDescription>
            </DialogHeader>

            {/* Tutor summary */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Avatar className="size-12">
                <AvatarImage src={tutor.avatarUrl || undefined} />
                <AvatarFallback>{tutor.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{tutor.fullName}</p>
                <p className="text-sm text-muted-foreground">{tutor.university}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">S/ {price.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedDuration} min
                </p>
              </div>
            </div>

            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Date picker */}
              <div className="space-y-2">
                <Label>Fecha</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {selectedDate
                        ? format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })
                        : "Selecciona una fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        form.setValue("date", date as Date);
                        form.setValue("time", ""); // Reset time when date changes
                        setCalendarOpen(false);
                      }}
                      disabled={(date) =>
                        isBefore(date, startOfDay(new Date())) ||
                        isBefore(addDays(new Date(), 30), date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.date && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.date.message}
                  </p>
                )}
              </div>

              {/* Duration selector */}
              <div className="space-y-2">
                <Label>Duración</Label>
                <Select
                  value={selectedDuration.toString()}
                  onValueChange={(value) => {
                    form.setValue("duration", parseInt(value));
                    form.setValue("time", ""); // Reset time when duration changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time slots */}
              <div className="space-y-2">
                <Label>Hora disponible</Label>
                {!selectedDate ? (
                  <p className="text-sm text-muted-foreground">
                    Primero selecciona una fecha
                  </p>
                ) : slotsLoading ? (
                  <div className="flex gap-2 flex-wrap">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-9 w-16" />
                    ))}
                  </div>
                ) : !availableSlots || availableSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay horarios disponibles para esta fecha y duración
                  </p>
                ) : (
                  <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <Badge
                        key={slot.time}
                        variant={form.watch("time") === slot.time ? "default" : "outline"}
                        className="cursor-pointer px-3 py-1.5"
                        onClick={() => form.setValue("time", slot.time)}
                      >
                        <Clock className="size-3 mr-1" />
                        {slot.time}
                      </Badge>
                    ))}
                  </div>
                )}
                {form.formState.errors.time && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.time.message}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label>Materia</Label>
                {subjectsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={form.watch("subjectId")}
                    onValueChange={(value) => form.setValue("subjectId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {form.formState.errors.subjectId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.subjectId.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>¿En qué necesitas ayuda? (opcional)</Label>
                <Textarea
                  placeholder="Describe brevemente tu duda o el tema que quieres revisar..."
                  {...form.register("description")}
                  rows={3}
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Reservando...
                  </>
                ) : (
                  <>
                    <BookOpen className="size-4 mr-2" />
                    Confirmar reserva - S/ {price.toFixed(2)}
                  </>
                )}
              </Button>
            </form>
          </>
        ) : (
          /* Success step */
          <div className="text-center py-6">
            <div className="size-16 mx-auto rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="mb-2">¡Sesión reservada!</DialogTitle>
            <p className="text-muted-foreground mb-6">
              Tu sesión con {tutor.fullName} ha sido confirmada para el{" "}
              {selectedDate &&
                format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}{" "}
              a las {form.getValues("time")}
            </p>
            <Button onClick={handleClose} className="w-full">
              Entendido
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
