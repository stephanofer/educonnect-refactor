import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/ui/components/shadcn/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/shadcn/select";
import { Label } from "@/ui/components/shadcn/label";
import {
  availabilitySlotSchema,
  type AvailabilitySlotFormData,
  generateTimeOptions,
  DAY_NAMES,
  type DayOfWeek,
} from "../schemas";
import { useCreateAvailabilitySlot, useUpdateAvailabilitySlot, type AvailabilitySlot } from "../hooks";

const TIME_OPTIONS = generateTimeOptions();

interface TimeSlotEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorProfileId: string;
  defaultDay?: DayOfWeek;
  editingSlot?: AvailabilitySlot | null;
}

export function TimeSlotEditor({
  open,
  onOpenChange,
  tutorProfileId,
  defaultDay = 1,
  editingSlot = null,
}: TimeSlotEditorProps) {
  const isEditing = !!editingSlot;
  const createMutation = useCreateAvailabilitySlot();
  const updateMutation = useUpdateAvailabilitySlot();

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<AvailabilitySlotFormData>({
    resolver: zodResolver(availabilitySlotSchema),
    defaultValues: {
      dayOfWeek: editingSlot?.dayOfWeek ?? defaultDay,
      startTime: editingSlot?.startTime ?? "09:00",
      endTime: editingSlot?.endTime ?? "10:00",
    },
  });

  const watchedDay = watch("dayOfWeek");
  const watchedStartTime = watch("startTime");
  const watchedEndTime = watch("endTime");

  // Reset form when slot changes
  useState(() => {
    if (editingSlot) {
      reset({
        dayOfWeek: editingSlot.dayOfWeek,
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
      });
    } else {
      reset({
        dayOfWeek: defaultDay,
        startTime: "09:00",
        endTime: "10:00",
      });
    }
  });

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const onSubmit = async (data: AvailabilitySlotFormData) => {
    try {
      if (isEditing && editingSlot) {
        await updateMutation.mutateAsync({
          slotId: editingSlot.id,
          tutorProfileId,
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
        });
      } else {
        await createMutation.mutateAsync({
          tutorProfileId,
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
        });
      }
      handleClose();
    } catch {
      // Error is handled by the mutation
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  // Filter end times to only show times after start time
  const filteredEndTimeOptions = TIME_OPTIONS.filter(
    (opt) => opt.value > watchedStartTime
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar horario" : "Agregar horario"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica el horario de disponibilidad"
              : "Selecciona el día y el rango de horas en que estarás disponible"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Day selector */}
          <div className="space-y-2">
            <Label>Día de la semana</Label>
            <Select
              value={String(watchedDay)}
              onValueChange={(val) => setValue("dayOfWeek", Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un día" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DAY_NAMES).map(([day, name]) => (
                  <SelectItem key={day} value={day}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.dayOfWeek && (
              <p className="text-sm text-destructive">{errors.dayOfWeek.message}</p>
            )}
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hora de inicio</Label>
              <Select
                value={watchedStartTime}
                onValueChange={(val) => {
                  setValue("startTime", val);
                  // Auto-adjust end time if needed
                  if (val >= watchedEndTime) {
                    const nextOption = TIME_OPTIONS.find((opt) => opt.value > val);
                    if (nextOption) {
                      setValue("endTime", nextOption.value);
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OPTIONS.slice(0, -1).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Hora de fin</Label>
              <Select
                value={watchedEndTime}
                onValueChange={(val) => setValue("endTime", val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filteredEndTimeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Agregar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Floating action button for adding slots
interface AddSlotButtonProps {
  onClick: () => void;
}

export function AddSlotButton({ onClick }: AddSlotButtonProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8"
    >
      <Button
        size="lg"
        onClick={onClick}
        className="size-14 rounded-full shadow-lg"
      >
        <Plus className="size-6" />
        <span className="sr-only">Agregar horario</span>
      </Button>
    </motion.div>
  );
}
