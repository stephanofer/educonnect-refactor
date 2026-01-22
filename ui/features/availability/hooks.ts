import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/ui/lib/supabase";
import type { TutorAvailability } from "@/ui/types";
import { slotsOverlap } from "./schemas";

// Query keys
const AVAILABILITY_KEYS = {
  all: ["tutor-availability"] as const,
  byTutor: (tutorProfileId: string) =>
    [...AVAILABILITY_KEYS.all, tutorProfileId] as const,
};

export { AVAILABILITY_KEYS };

// Transformed type for UI
export interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

// Group slots by day
export interface AvailabilityByDay {
  [day: number]: AvailabilitySlot[];
}

// Transform DB data to UI format
function transformAvailability(data: TutorAvailability[]): AvailabilitySlot[] {
  return data.map((slot) => ({
    id: slot.id,
    dayOfWeek: slot.day_of_week,
    startTime: slot.start_time.slice(0, 5), // Remove seconds if present
    endTime: slot.end_time.slice(0, 5),
    isActive: slot.is_active,
  }));
}

// Group slots by day of week
export function groupSlotsByDay(slots: AvailabilitySlot[]): AvailabilityByDay {
  const grouped: AvailabilityByDay = {};
  for (let i = 0; i < 7; i++) {
    grouped[i] = [];
  }
  slots.forEach((slot) => {
    grouped[slot.dayOfWeek].push(slot);
  });
  // Sort each day's slots by start time
  Object.values(grouped).forEach((daySlots) => {
    daySlots.sort((a: AvailabilitySlot, b: AvailabilitySlot) =>
      a.startTime.localeCompare(b.startTime)
    );
  });
  return grouped;
}

// Fetch tutor's availability
async function fetchTutorAvailability(
  tutorProfileId: string
): Promise<AvailabilitySlot[]> {
  const { data, error } = await supabase
    .from("tutor_availability")
    .select("*")
    .eq("tutor_id", tutorProfileId)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw error;
  return transformAvailability(data || []);
}

// Hook to get tutor availability
export function useTutorAvailability(tutorProfileId: string | undefined) {
  return useQuery({
    queryKey: AVAILABILITY_KEYS.byTutor(tutorProfileId || ""),
    queryFn: () => fetchTutorAvailability(tutorProfileId!),
    enabled: !!tutorProfileId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Create availability slot
interface CreateSlotParams {
  tutorProfileId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

async function createAvailabilitySlot(
  params: CreateSlotParams
): Promise<AvailabilitySlot> {
  // First check for overlapping slots
  const { data: existingSlots } = await supabase
    .from("tutor_availability")
    .select("start_time, end_time")
    .eq("tutor_id", params.tutorProfileId)
    .eq("day_of_week", params.dayOfWeek)
    .eq("is_active", true);

  const newSlot = { startTime: params.startTime, endTime: params.endTime };
  const hasOverlap = (existingSlots || []).some((existing) =>
    slotsOverlap(newSlot, {
      startTime: existing.start_time.slice(0, 5),
      endTime: existing.end_time.slice(0, 5),
    })
  );

  if (hasOverlap) {
    throw new Error("Este horario se superpone con otro slot existente");
  }

  const { data, error } = await supabase
    .from("tutor_availability")
    .insert({
      tutor_id: params.tutorProfileId,
      day_of_week: params.dayOfWeek,
      start_time: params.startTime,
      end_time: params.endTime,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error("Error al crear el slot de disponibilidad");
  return transformAvailability([data])[0];
}

export function useCreateAvailabilitySlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAvailabilitySlot,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: AVAILABILITY_KEYS.byTutor(variables.tutorProfileId),
      });
    },
  });
}

// Update availability slot
interface UpdateSlotParams {
  slotId: string;
  tutorProfileId: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  isActive?: boolean;
}

async function updateAvailabilitySlot(
  params: UpdateSlotParams
): Promise<AvailabilitySlot> {
  const updateData: Record<string, unknown> = {};

  if (params.dayOfWeek !== undefined) updateData.day_of_week = params.dayOfWeek;
  if (params.startTime !== undefined) updateData.start_time = params.startTime;
  if (params.endTime !== undefined) updateData.end_time = params.endTime;
  if (params.isActive !== undefined) updateData.is_active = params.isActive;

  // If updating times, check for overlaps
  if (params.startTime || params.endTime) {
    // Get the current slot data
    const { data: currentSlot } = await supabase
      .from("tutor_availability")
      .select("*")
      .eq("id", params.slotId)
      .single();

    if (!currentSlot) throw new Error("Slot no encontrado");

    const dayToCheck = params.dayOfWeek ?? currentSlot.day_of_week;
    const startToCheck = params.startTime ?? currentSlot.start_time.slice(0, 5);
    const endToCheck = params.endTime ?? currentSlot.end_time.slice(0, 5);

    // Check for overlapping slots (excluding current slot)
    const { data: existingSlots } = await supabase
      .from("tutor_availability")
      .select("id, start_time, end_time")
      .eq("tutor_id", params.tutorProfileId)
      .eq("day_of_week", dayToCheck)
      .eq("is_active", true)
      .neq("id", params.slotId);

    const newSlot = { startTime: startToCheck, endTime: endToCheck };
    const hasOverlap = (existingSlots || []).some((existing) =>
      slotsOverlap(newSlot, {
        startTime: existing.start_time.slice(0, 5),
        endTime: existing.end_time.slice(0, 5),
      })
    );

    if (hasOverlap) {
      throw new Error("Este horario se superpone con otro slot existente");
    }
  }

  const { data, error } = await supabase
    .from("tutor_availability")
    .update(updateData)
    .eq("id", params.slotId)
    .select()
    .single();

  if (error) throw new Error("Error al actualizar el slot");
  return transformAvailability([data])[0];
}

export function useUpdateAvailabilitySlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAvailabilitySlot,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: AVAILABILITY_KEYS.byTutor(variables.tutorProfileId),
      });
    },
  });
}

// Delete availability slot
interface DeleteSlotParams {
  slotId: string;
  tutorProfileId: string;
}

async function deleteAvailabilitySlot(params: DeleteSlotParams): Promise<void> {
  const { error } = await supabase
    .from("tutor_availability")
    .delete()
    .eq("id", params.slotId);

  if (error) throw new Error("Error al eliminar el slot");
}

export function useDeleteAvailabilitySlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAvailabilitySlot,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: AVAILABILITY_KEYS.byTutor(variables.tutorProfileId),
      });
    },
  });
}

// Toggle slot active status
export function useToggleSlotActive() {
  const updateMutation = useUpdateAvailabilitySlot();

  return {
    ...updateMutation,
    mutate: (params: { slotId: string; tutorProfileId: string; isActive: boolean }) =>
      updateMutation.mutate({
        slotId: params.slotId,
        tutorProfileId: params.tutorProfileId,
        isActive: params.isActive,
      }),
  };
}

// Copy day's availability to other days
interface CopyDayParams {
  tutorProfileId: string;
  sourceDay: number;
  targetDays: number[];
}

async function copyDayAvailability(params: CopyDayParams): Promise<void> {
  // Get source day's slots
  const { data: sourceSlots, error: fetchError } = await supabase
    .from("tutor_availability")
    .select("start_time, end_time")
    .eq("tutor_id", params.tutorProfileId)
    .eq("day_of_week", params.sourceDay)
    .eq("is_active", true);

  if (fetchError) throw new Error("Error al obtener los slots del día origen");
  if (!sourceSlots || sourceSlots.length === 0) {
    throw new Error("No hay slots para copiar en el día seleccionado");
  }

  // Delete existing slots on target days
  for (const targetDay of params.targetDays) {
    await supabase
      .from("tutor_availability")
      .delete()
      .eq("tutor_id", params.tutorProfileId)
      .eq("day_of_week", targetDay);
  }

  // Create new slots on target days
  const newSlots = params.targetDays.flatMap((targetDay) =>
    sourceSlots.map((slot) => ({
      tutor_id: params.tutorProfileId,
      day_of_week: targetDay,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_active: true,
    }))
  );

  const { error: insertError } = await supabase
    .from("tutor_availability")
    .insert(newSlots);

  if (insertError) throw new Error("Error al copiar los slots");
}

export function useCopyDayAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: copyDayAvailability,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: AVAILABILITY_KEYS.byTutor(variables.tutorProfileId),
      });
    },
  });
}

// Get tutor profile ID from user ID
export function useTutorProfileId(userId: string | undefined) {
  return useQuery({
    queryKey: ["tutor-profile-id", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tutor_profiles")
        .select("id")
        .eq("user_id", userId!)
        .single();

      if (error) throw error;
      return data.id as string;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
