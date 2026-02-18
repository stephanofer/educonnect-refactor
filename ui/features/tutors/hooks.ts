import { useState } from "react";
import { MOCK_TUTORS, MOCK_SUBJECTS, type MockTutor, type MockTutorCredential, type MockTutorReview, type MockTutorAvailability } from "./mock-data";

// Re-export mock types
export type { MockTutorCredential, MockTutorReview, MockTutorAvailability };

// Types
export interface TutorFilters {
  search?: string;
  subjectId?: string;
  university?: string;
  minRating?: number;
  availableDate?: string; // yyyy-MM-dd
}

export type TutorListItem = MockTutor;
export type TutorDetail = MockTutor;

export interface TutorAvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface TutorReview {
  id: string;
  studentName: string;
  studentAvatar: string | null;
  rating: number;
  comment: string | null;
  tags: string[];
  createdAt: string;
}

// Get the day of week (0=Sun...6=Sat) for a date string
function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr + "T00:00:00").getDay();
}

// Get available time ranges for a tutor on a specific date
export function getTutorSlotsForDate(
  tutor: MockTutor,
  dateStr: string
): { startTime: string; endTime: string }[] {
  const dayOfWeek = getDayOfWeek(dateStr);
  return tutor.availability
    .filter((a) => a.dayOfWeek === dayOfWeek && a.isActive)
    .map((a) => ({
      startTime: a.startTime.slice(0, 5),
      endTime: a.endTime.slice(0, 5),
    }));
}

// Local filtering of mock tutors
function filterTutors(filters: TutorFilters): TutorListItem[] {
  let results = [...MOCK_TUTORS];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (t) =>
        t.fullName.toLowerCase().includes(q) ||
        t.specialties.some((s) => s.toLowerCase().includes(q)) ||
        t.university.toLowerCase().includes(q) ||
        (t.bio && t.bio.toLowerCase().includes(q))
    );
  }

  if (filters.subjectId) {
    results = results.filter((t) =>
      t.subjects.some((s) => s.id === filters.subjectId)
    );
  }

  if (filters.university) {
    results = results.filter((t) => t.university === filters.university);
  }

  if (filters.minRating) {
    results = results.filter((t) => t.rating >= filters.minRating!);
  }

  // Filter by availability on a specific date
  if (filters.availableDate) {
    const dayOfWeek = getDayOfWeek(filters.availableDate);
    results = results.filter((t) =>
      t.availability.some((a) => a.dayOfWeek === dayOfWeek && a.isActive)
    );
  }

  // Sort by rating desc
  results.sort((a, b) => b.rating - a.rating);

  return results;
}

// Hook to get filtered tutors (synchronous, no DB)
export function useMockTutors(filters: TutorFilters = {}) {
  const tutors = filterTutors(filters);
  return { data: tutors, isLoading: false };
}

// Hook to get a single tutor detail by ID
export const useTutorDetail = useMockTutorDetail;
export function useMockTutorDetail(tutorId: string | undefined, _userId?: string) {
  if (!tutorId) return { data: null, isLoading: false };
  const tutor = MOCK_TUTORS.find((t) => t.id === tutorId) || null;
  return { data: tutor, isLoading: false };
}

// Hook to toggle favorite (local state)
export function useToggleFavorite() {
  const [pending, setPending] = useState(false);

  const mutate = (
    params: { tutorId: string; isFavorite: boolean },
    callbacks?: { onSuccess?: () => void; onError?: () => void }
  ) => {
    setPending(true);
    const tutor = MOCK_TUTORS.find((t) => t.id === params.tutorId);
    if (tutor) {
      tutor.isFavorite = !params.isFavorite;
    }
    setPending(false);
    callbacks?.onSuccess?.();
  };

  return { mutate, isPending: pending };
}

// Hook to get universities from mock data
export function useUniversities() {
  const universities = [...new Set(MOCK_TUTORS.map((t) => t.university))].sort();
  return { data: universities };
}

// Hook to get subjects from mock data
export function useSubjects() {
  return { data: MOCK_SUBJECTS };
}

// Generate mock time slots for a given date
export function getMockAvailableSlots(tutorId: string, date: string) {
  const tutor = MOCK_TUTORS.find((t) => t.id === tutorId);
  if (!tutor) return [];

  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();

  const daySlots = tutor.availability.filter((a) => a.dayOfWeek === dayOfWeek && a.isActive);
  if (daySlots.length === 0) return [];

  const slots: { time: string; available: boolean }[] = [];

  daySlots.forEach((avail) => {
    const [startH, startM] = avail.startTime.split(":").map(Number);
    const [endH, endM] = avail.endTime.split(":").map(Number);
    let currentMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    while (currentMin < endMin) {
      const h = Math.floor(currentMin / 60);
      const m = currentMin % 60;
      const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      // Simulate some slots as taken (every 3rd slot)
      const slotIndex = slots.length;
      slots.push({ time: timeStr, available: slotIndex % 5 !== 3 });
      currentMin += 30;
    }
  });

  return slots;
}
