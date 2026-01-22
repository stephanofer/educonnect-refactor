import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { Button } from "@/ui/components/shadcn/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/shadcn/card";
import { Checkbox } from "@/ui/components/shadcn/checkbox";
import { Label } from "@/ui/components/shadcn/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/components/shadcn/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/components/shadcn/alert-dialog";
import {
  DAY_NAMES,
  DAY_NAMES_SHORT,
  DAY_OF_WEEK,
  type DayOfWeek,
} from "../schemas";
import {
  groupSlotsByDay,
  useDeleteAvailabilitySlot,
  useUpdateAvailabilitySlot,
  useCopyDayAvailability,
  type AvailabilitySlot,
} from "../hooks";
import { TimeSlotItem, EmptyDaySlot } from "./TimeSlotItem";
import { TimeSlotEditor } from "./TimeSlotEditor";

interface WeeklyCalendarProps {
  slots: AvailabilitySlot[];
  tutorProfileId: string;
  isLoading?: boolean;
}

export function WeeklyCalendar({
  slots,
  tutorProfileId,
}: WeeklyCalendarProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(
    new Set([1, 2, 3, 4, 5]) // Weekdays expanded by default
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(DAY_OF_WEEK.MONDAY);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [copyFromDay, setCopyFromDay] = useState<number | null>(null);
  const [copyTargetDays, setCopyTargetDays] = useState<Set<number>>(new Set());

  const deleteMutation = useDeleteAvailabilitySlot();
  const updateMutation = useUpdateAvailabilitySlot();
  const copyMutation = useCopyDayAvailability();

  const slotsByDay = groupSlotsByDay(slots);

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  const handleAddSlot = (day: DayOfWeek) => {
    setSelectedDay(day);
    setEditingSlot(null);
    setEditorOpen(true);
  };

  const handleEditSlot = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setSelectedDay(slot.dayOfWeek as DayOfWeek);
    setEditorOpen(true);
  };

  const handleDeleteSlot = async () => {
    if (!deleteConfirmId) return;
    await deleteMutation.mutateAsync({
      slotId: deleteConfirmId,
      tutorProfileId,
    });
    setDeleteConfirmId(null);
  };

  const handleToggleActive = async (slotId: string, isActive: boolean) => {
    await updateMutation.mutateAsync({
      slotId,
      tutorProfileId,
      isActive,
    });
  };

  const handleCopyDay = async () => {
    if (copyFromDay === null || copyTargetDays.size === 0) return;
    await copyMutation.mutateAsync({
      tutorProfileId,
      sourceDay: copyFromDay,
      targetDays: Array.from(copyTargetDays),
    });
    setCopyFromDay(null);
    setCopyTargetDays(new Set());
  };

  // Determine which days are weekdays for sorting
  const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun

  return (
    <>
      <div className="space-y-4">
        {dayOrder.map((day) => {
          const daySlots = slotsByDay[day] || [];
          const isExpanded = expandedDays.has(day);
          const hasSlots = daySlots.length > 0;
          const activeSlots = daySlots.filter((s) => s.isActive).length;

          return (
            <Card key={day} className={cn(!hasSlots && "border-dashed")}>
              <CardHeader
                className="cursor-pointer select-none p-4"
                onClick={() => toggleDay(day)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base font-medium">
                      {DAY_NAMES[day as DayOfWeek]}
                    </CardTitle>
                    {hasSlots && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {activeSlots} horario{activeSlots !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Copy button - only show if day has slots */}
                    {hasSlots && (
                      <Popover
                        open={copyFromDay === day}
                        onOpenChange={(open) => {
                          if (open) {
                            setCopyFromDay(day);
                            setCopyTargetDays(new Set());
                          } else {
                            setCopyFromDay(null);
                          }
                        }}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Copy className="mr-1.5 size-3.5" />
                            Copiar
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-56"
                          align="end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="space-y-4">
                            <div className="text-sm font-medium">
                              Copiar a otros días
                            </div>
                            <div className="space-y-2">
                              {dayOrder
                                .filter((d) => d !== day)
                                .map((d) => (
                                  <div
                                    key={d}
                                    className="flex items-center gap-2"
                                  >
                                    <Checkbox
                                      id={`copy-to-${d}`}
                                      checked={copyTargetDays.has(d)}
                                      onCheckedChange={(checked) => {
                                        setCopyTargetDays((prev) => {
                                          const next = new Set(prev);
                                          if (checked) {
                                            next.add(d);
                                          } else {
                                            next.delete(d);
                                          }
                                          return next;
                                        });
                                      }}
                                    />
                                    <Label
                                      htmlFor={`copy-to-${d}`}
                                      className="text-sm font-normal"
                                    >
                                      {DAY_NAMES[d as DayOfWeek]}
                                    </Label>
                                  </div>
                                ))}
                            </div>
                            <Button
                              size="sm"
                              className="w-full"
                              disabled={
                                copyTargetDays.size === 0 ||
                                copyMutation.isPending
                              }
                              onClick={handleCopyDay}
                            >
                              {copyMutation.isPending
                                ? "Copiando..."
                                : `Copiar a ${copyTargetDays.size} día${copyTargetDays.size !== 1 ? "s" : ""}`}
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddSlot(day as DayOfWeek);
                      }}
                    >
                      Agregar
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent className="space-y-2 pb-4 pt-0">
                      {hasSlots ? (
                        <AnimatePresence mode="popLayout">
                          {daySlots.map((slot) => (
                            <TimeSlotItem
                              key={slot.id}
                              slot={slot}
                              onEdit={handleEditSlot}
                              onDelete={(id) => setDeleteConfirmId(id)}
                              onToggleActive={handleToggleActive}
                              isDeleting={
                                deleteMutation.isPending &&
                                deleteConfirmId === slot.id
                              }
                              isTogglingActive={updateMutation.isPending}
                            />
                          ))}
                        </AnimatePresence>
                      ) : (
                        <EmptyDaySlot />
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      {/* Time Slot Editor Dialog */}
      <TimeSlotEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        tutorProfileId={tutorProfileId}
        defaultDay={selectedDay}
        editingSlot={editingSlot}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este horario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los estudiantes ya no podrán
              reservar sesiones en este horario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSlot}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Mobile-friendly day selector tabs
interface DayTabsProps {
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  slotCounts: Record<number, number>;
}

export function DayTabs({ selectedDay, onSelectDay, slotCounts }: DayTabsProps) {
  const dayOrder = [1, 2, 3, 4, 5, 6, 0]; // Mon-Sun

  return (
    <div className="flex gap-1 overflow-x-auto pb-2 md:hidden">
      {dayOrder.map((day) => {
        const count = slotCounts[day] || 0;
        const isSelected = selectedDay === day;

        return (
          <button
            key={day}
            onClick={() => onSelectDay(day as DayOfWeek)}
            className={cn(
              "relative flex min-w-[48px] flex-col items-center rounded-lg px-3 py-2 text-sm transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            <span className="font-medium">{DAY_NAMES_SHORT[day as DayOfWeek]}</span>
            {count > 0 && (
              <span
                className={cn(
                  "mt-0.5 text-xs",
                  isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
