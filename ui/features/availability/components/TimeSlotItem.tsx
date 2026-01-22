import { motion } from "motion/react";
import { Clock, Trash2, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/ui/lib/utils";
import { Button } from "@/ui/components/shadcn/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/ui/components/shadcn/tooltip";
import { formatTimeDisplay } from "../schemas";
import type { AvailabilitySlot } from "../hooks";

interface TimeSlotItemProps {
  slot: AvailabilitySlot;
  onEdit: (slot: AvailabilitySlot) => void;
  onDelete: (slotId: string) => void;
  onToggleActive: (slotId: string, isActive: boolean) => void;
  isDeleting?: boolean;
  isTogglingActive?: boolean;
}

export function TimeSlotItem({
  slot,
  onEdit,
  onDelete,
  onToggleActive,
  isDeleting = false,
  isTogglingActive = false,
}: TimeSlotItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group flex items-center justify-between rounded-lg border p-3 transition-colors",
        slot.isActive
          ? "border-primary/20 bg-primary/5 hover:border-primary/40"
          : "border-muted bg-muted/30 opacity-60"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-full",
            slot.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          <Clock className="size-4" />
        </div>
        <div>
          <p
            className={cn(
              "font-medium",
              !slot.isActive && "text-muted-foreground"
            )}
          >
            {formatTimeDisplay(slot.startTime)} - {formatTimeDisplay(slot.endTime)}
          </p>
          {!slot.isActive && (
            <p className="text-xs text-muted-foreground">Desactivado</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onToggleActive(slot.id, !slot.isActive)}
              disabled={isTogglingActive}
            >
              {slot.isActive ? (
                <ToggleRight className="size-4 text-primary" />
              ) : (
                <ToggleLeft className="size-4" />
              )}
              <span className="sr-only">
                {slot.isActive ? "Desactivar" : "Activar"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {slot.isActive ? "Desactivar horario" : "Activar horario"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => onEdit(slot)}
            >
              <Pencil className="size-4" />
              <span className="sr-only">Editar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Editar horario</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(slot.id)}
              disabled={isDeleting}
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Eliminar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Eliminar horario</TooltipContent>
        </Tooltip>
      </div>
    </motion.div>
  );
}

// Empty state for a day with no slots
export function EmptyDaySlot() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 p-3 text-muted-foreground">
      <Clock className="size-4" />
      <span className="text-sm">Sin horarios configurados</span>
    </div>
  );
}
