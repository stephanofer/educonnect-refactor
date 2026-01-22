import { z } from "zod";

// Days of week constant
const DAY_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

export type DayOfWeek = (typeof DAY_OF_WEEK)[keyof typeof DAY_OF_WEEK];
export { DAY_OF_WEEK };

// Day names in Spanish
export const DAY_NAMES: Record<DayOfWeek, string> = {
  [DAY_OF_WEEK.SUNDAY]: "Domingo",
  [DAY_OF_WEEK.MONDAY]: "Lunes",
  [DAY_OF_WEEK.TUESDAY]: "Martes",
  [DAY_OF_WEEK.WEDNESDAY]: "Miércoles",
  [DAY_OF_WEEK.THURSDAY]: "Jueves",
  [DAY_OF_WEEK.FRIDAY]: "Viernes",
  [DAY_OF_WEEK.SATURDAY]: "Sábado",
};

// Short day names
export const DAY_NAMES_SHORT: Record<DayOfWeek, string> = {
  [DAY_OF_WEEK.SUNDAY]: "Dom",
  [DAY_OF_WEEK.MONDAY]: "Lun",
  [DAY_OF_WEEK.TUESDAY]: "Mar",
  [DAY_OF_WEEK.WEDNESDAY]: "Mié",
  [DAY_OF_WEEK.THURSDAY]: "Jue",
  [DAY_OF_WEEK.FRIDAY]: "Vie",
  [DAY_OF_WEEK.SATURDAY]: "Sáb",
};

// Time validation regex (HH:mm format)
const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Schema for creating/updating an availability slot
export const availabilitySlotSchema = z
  .object({
    dayOfWeek: z
      .number()
      .int()
      .min(0, { error: "Día inválido" })
      .max(6, { error: "Día inválido" }),
    startTime: z
      .string()
      .regex(TIME_REGEX, { error: "Formato de hora inválido (HH:mm)" }),
    endTime: z
      .string()
      .regex(TIME_REGEX, { error: "Formato de hora inválido (HH:mm)" }),
  })
  .refine(
    (data) => {
      const start = timeToMinutes(data.startTime);
      const end = timeToMinutes(data.endTime);
      return end > start;
    },
    {
      message: "La hora de fin debe ser posterior a la hora de inicio",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      const start = timeToMinutes(data.startTime);
      const end = timeToMinutes(data.endTime);
      return end - start >= 30;
    },
    {
      message: "El slot debe ser de al menos 30 minutos",
      path: ["endTime"],
    }
  );

export type AvailabilitySlotFormData = z.infer<typeof availabilitySlotSchema>;

// Helper function to convert time string to minutes
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Helper function to convert minutes to time string
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

// Helper function to format time for display (e.g., "09:00" -> "9:00 AM")
export function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Generate time options for dropdowns (every 30 minutes)
export function generateTimeOptions(): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = [];
  for (let hour = 6; hour <= 22; hour++) {
    for (const min of [0, 30]) {
      if (hour === 22 && min === 30) continue; // Stop at 22:00
      const time = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
      options.push({
        value: time,
        label: formatTimeDisplay(time),
      });
    }
  }
  return options;
}

// Check if two time slots overlap
export function slotsOverlap(
  slot1: { startTime: string; endTime: string },
  slot2: { startTime: string; endTime: string }
): boolean {
  const start1 = timeToMinutes(slot1.startTime);
  const end1 = timeToMinutes(slot1.endTime);
  const start2 = timeToMinutes(slot2.startTime);
  const end2 = timeToMinutes(slot2.endTime);

  return start1 < end2 && start2 < end1;
}
