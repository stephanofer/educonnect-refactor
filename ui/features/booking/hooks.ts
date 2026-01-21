import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/ui/lib/supabase";
import type { Subject } from "@/ui/types";

// Query keys
const BOOKING_KEYS = {
  availability: (tutorId: string, date: string) =>
    ["booking", "availability", tutorId, date] as const,
  slots: (tutorId: string, date: string) =>
    ["booking", "slots", tutorId, date] as const,
};

// Types
export interface TimeSlot {
  time: string; // HH:mm format
  available: boolean;
}

export interface BookingData {
  tutorId: string;
  studentId: string;
  subjectId: string;
  scheduledAt: string; // ISO date string
  durationMinutes: number;
  description?: string;
}

// Fetch available time slots for a tutor on a specific date
async function fetchAvailableSlots(
  tutorId: string,
  date: string // YYYY-MM-DD format
): Promise<TimeSlot[]> {
  // Get day of week (0-6)
  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  // Get tutor's availability for this day
  const { data: tutorProfile } = await supabase
    .from("tutor_profiles")
    .select("id")
    .eq("user_id", tutorId)
    .single();

  if (!tutorProfile) return [];

  const { data: availability } = await supabase
    .from("tutor_availability")
    .select("start_time, end_time")
    .eq("tutor_id", tutorProfile.id)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true);

  if (!availability || availability.length === 0) return [];

  // Get existing sessions for this tutor on this date
  const startOfDay = new Date(date + "T00:00:00").toISOString();
  const endOfDay = new Date(date + "T23:59:59").toISOString();

  const { data: existingSessions } = await supabase
    .from("sessions")
    .select("scheduled_at, duration_minutes")
    .eq("tutor_id", tutorId)
    .gte("scheduled_at", startOfDay)
    .lte("scheduled_at", endOfDay)
    .in("status", ["pending", "confirmed", "in_progress"]);

  // Build set of occupied slots
  const occupiedSlots = new Set<string>();
  (existingSessions || []).forEach((session) => {
    const start = new Date(session.scheduled_at);
    const durationSlots = Math.ceil(session.duration_minutes / 30);

    for (let i = 0; i < durationSlots; i++) {
      const slotTime = new Date(start.getTime() + i * 30 * 60 * 1000);
      const slotKey = slotTime.toTimeString().slice(0, 5);
      occupiedSlots.add(slotKey);
    }
  });

  // Generate all possible 30-minute slots from availability
  const slots: TimeSlot[] = [];
  const now = new Date();
  const isToday = date === now.toISOString().split("T")[0];

  availability.forEach((avail) => {
    const [startHour, startMin] = avail.start_time.split(":").map(Number);
    const [endHour, endMin] = avail.end_time.split(":").map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes < endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const min = currentMinutes % 60;
      const timeStr = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;

      // Check if slot is in the past (for today)
      let isInPast = false;
      if (isToday) {
        const slotDateTime = new Date(date + "T" + timeStr + ":00");
        isInPast = slotDateTime <= now;
      }

      slots.push({
        time: timeStr,
        available: !occupiedSlots.has(timeStr) && !isInPast,
      });

      currentMinutes += 30;
    }
  });

  // Sort by time
  slots.sort((a, b) => a.time.localeCompare(b.time));

  return slots;
}

// Hook to fetch available slots
export function useAvailableSlots(tutorId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: BOOKING_KEYS.slots(tutorId || "", date || ""),
    queryFn: () => fetchAvailableSlots(tutorId!, date!),
    enabled: !!tutorId && !!date,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Create a booking
async function createBooking(data: BookingData): Promise<{ id: string }> {
  // First verify student has sessions remaining
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .select("id, sessions_remaining")
    .eq("user_id", data.studentId)
    .eq("status", "active")
    .single();

  if (subError || !subscription) {
    throw new Error("No tienes un plan activo. Adquiere un plan para reservar sesiones.");
  }

  if (subscription.sessions_remaining <= 0) {
    throw new Error("No te quedan sesiones disponibles en tu plan.");
  }

  // Get tutor's hourly rate for price calculation
  const { data: tutorProfile } = await supabase
    .from("tutor_profiles")
    .select("hourly_rate")
    .eq("user_id", data.tutorId)
    .single();

  const hourlyRate = tutorProfile?.hourly_rate || 25;
  const price = (hourlyRate * data.durationMinutes) / 60;

  // Create the session
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      student_id: data.studentId,
      tutor_id: data.tutorId,
      subject_id: data.subjectId,
      subscription_id: subscription.id,
      scheduled_at: data.scheduledAt,
      duration_minutes: data.durationMinutes,
      description: data.description,
      status: "confirmed",
      price,
    })
    .select("id")
    .single();

  if (sessionError) {
    throw new Error("Error al crear la sesión. Intenta de nuevo.");
  }

  // Decrement sessions remaining
  const { error: updateError } = await supabase
    .from("subscriptions")
    .update({ sessions_remaining: subscription.sessions_remaining - 1 })
    .eq("id", subscription.id);

  if (updateError) {
    // Rollback session creation
    await supabase.from("sessions").delete().eq("id", session.id);
    throw new Error("Error al actualizar tu plan. Intenta de nuevo.");
  }

  // Create notification for tutor
  await supabase.from("notifications").insert({
    user_id: data.tutorId,
    type: "session_confirmed",
    title: "Nueva sesión reservada",
    message: `Tienes una nueva sesión programada para ${new Date(data.scheduledAt).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}`,
    data: { session_id: session.id },
  });

  return { id: session.id };
}

// Hook to create booking
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["tutor-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] });
    },
  });
}

// Fetch subjects for booking dropdown
export function useBookingSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async (): Promise<Subject[]> => {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, category, icon")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 30,
  });
}
