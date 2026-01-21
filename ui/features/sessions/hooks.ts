import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/ui/lib/supabase";
import { TEST_SESSION } from "@/ui/lib/daily";
import type { SessionStatus } from "@/ui/types";

// Query keys
const SESSION_KEYS = {
  all: ["sessions"] as const,
  student: (userId: string, status?: string) =>
    [...SESSION_KEYS.all, "student", userId, status] as const,
  tutor: (userId: string, status?: string) =>
    [...SESSION_KEYS.all, "tutor", userId, status] as const,
  detail: (id: string) => [...SESSION_KEYS.all, "detail", id] as const,
};

// Types
const SESSION_TAB = {
  UPCOMING: "upcoming",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type SessionTab = (typeof SESSION_TAB)[keyof typeof SESSION_TAB];
export { SESSION_TAB };

export interface SessionListItem {
  id: string;
  status: SessionStatus;
  scheduledAt: Date;
  durationMinutes: number;
  description: string | null;
  subjectName: string;
  // For student view
  tutorId?: string;
  tutorName?: string;
  tutorAvatar?: string | null;
  // For tutor view
  studentId?: string;
  studentName?: string;
  studentAvatar?: string | null;
  // Extras
  hasMaterials: boolean;
  materialsCount: number;
}

export interface SessionDetail extends SessionListItem {
  meetingUrl: string | null;
  notes: string | null;
  price: number | null;
  cancelledBy: string | null;
  cancelReason: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

// Fetch sessions for student
async function fetchStudentSessions(
  userId: string,
  tab: SessionTab
): Promise<SessionListItem[]> {
  let query = supabase
    .from("sessions")
    .select(`
      id,
      status,
      scheduled_at,
      duration_minutes,
      description,
      tutor_id,
      subject:subjects(name),
      tutor:profiles!sessions_tutor_id_fkey(id, full_name, avatar_url)
    `)
    .eq("student_id", userId);

  // Filter by tab
  if (tab === SESSION_TAB.UPCOMING) {
    query = query
      .in("status", ["pending", "confirmed", "in_progress"])
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true });
  } else if (tab === SESSION_TAB.COMPLETED) {
    query = query
      .eq("status", "completed")
      .order("scheduled_at", { ascending: false });
  } else if (tab === SESSION_TAB.CANCELLED) {
    query = query
      .eq("status", "cancelled")
      .order("scheduled_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  // Get materials count for each session
  const sessionIds = (data || []).map((s) => s.id);
  const { data: materialsData } = await supabase
    .from("materials")
    .select("session_id")
    .in("session_id", sessionIds);

  const materialsCounts = new Map<string, number>();
  (materialsData || []).forEach((m) => {
    const count = materialsCounts.get(m.session_id) || 0;
    materialsCounts.set(m.session_id, count + 1);
  });

  const sessions = (data || []).map((session) => {
    const subject = Array.isArray(session.subject) ? session.subject[0] : session.subject;
    const tutor = Array.isArray(session.tutor) ? session.tutor[0] : session.tutor;
    const materialsCount = materialsCounts.get(session.id) || 0;

    return {
      id: session.id,
      status: session.status as SessionStatus,
      scheduledAt: new Date(session.scheduled_at),
      durationMinutes: session.duration_minutes,
      description: session.description,
      subjectName: subject?.name || "Sesión",
      tutorId: session.tutor_id,
      tutorName: tutor?.full_name || "Tutor",
      tutorAvatar: tutor?.avatar_url || null,
      hasMaterials: materialsCount > 0,
      materialsCount,
    };
  });

  // Add test session for development (only in upcoming tab)
  if (tab === SESSION_TAB.UPCOMING) {
    const testSession: SessionListItem = {
      id: TEST_SESSION.id,
      status: TEST_SESSION.status,
      scheduledAt: TEST_SESSION.scheduledAt,
      durationMinutes: TEST_SESSION.durationMinutes,
      description: TEST_SESSION.description,
      subjectName: TEST_SESSION.subjectName,
      tutorId: TEST_SESSION.tutorId,
      tutorName: TEST_SESSION.tutorName,
      tutorAvatar: TEST_SESSION.tutorAvatar,
      hasMaterials: TEST_SESSION.hasMaterials,
      materialsCount: TEST_SESSION.materialsCount,
    };
    return [testSession, ...sessions];
  }

  return sessions;
}

// Hook for student sessions
export function useStudentSessions(userId: string | undefined, tab: SessionTab) {
  return useQuery({
    queryKey: SESSION_KEYS.student(userId || "", tab),
    queryFn: () => fetchStudentSessions(userId!, tab),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

// Fetch sessions for tutor
async function fetchTutorSessions(
  userId: string,
  tab: SessionTab
): Promise<SessionListItem[]> {
  let query = supabase
    .from("sessions")
    .select(`
      id,
      status,
      scheduled_at,
      duration_minutes,
      description,
      student_id,
      subject:subjects(name),
      student:profiles!sessions_student_id_fkey(id, full_name, avatar_url)
    `)
    .eq("tutor_id", userId);

  // Filter by tab
  if (tab === SESSION_TAB.UPCOMING) {
    query = query
      .in("status", ["pending", "confirmed", "in_progress"])
      .gte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true });
  } else if (tab === SESSION_TAB.COMPLETED) {
    query = query
      .eq("status", "completed")
      .order("scheduled_at", { ascending: false });
  } else if (tab === SESSION_TAB.CANCELLED) {
    query = query
      .eq("status", "cancelled")
      .order("scheduled_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  // Get materials count for each session
  const sessionIds = (data || []).map((s) => s.id);
  const { data: materialsData } = await supabase
    .from("materials")
    .select("session_id")
    .in("session_id", sessionIds);

  const materialsCounts = new Map<string, number>();
  (materialsData || []).forEach((m) => {
    const count = materialsCounts.get(m.session_id) || 0;
    materialsCounts.set(m.session_id, count + 1);
  });

  const sessions = (data || []).map((session) => {
    const subject = Array.isArray(session.subject) ? session.subject[0] : session.subject;
    const student = Array.isArray(session.student) ? session.student[0] : session.student;
    const materialsCount = materialsCounts.get(session.id) || 0;

    return {
      id: session.id,
      status: session.status as SessionStatus,
      scheduledAt: new Date(session.scheduled_at),
      durationMinutes: session.duration_minutes,
      description: session.description,
      subjectName: subject?.name || "Sesión",
      studentId: session.student_id,
      studentName: student?.full_name || "Estudiante",
      studentAvatar: student?.avatar_url || null,
      hasMaterials: materialsCount > 0,
      materialsCount,
    };
  });

  // Add test session for development (only in upcoming tab)
  if (tab === SESSION_TAB.UPCOMING) {
    const testSession: SessionListItem = {
      id: TEST_SESSION.id,
      status: TEST_SESSION.status,
      scheduledAt: TEST_SESSION.scheduledAt,
      durationMinutes: TEST_SESSION.durationMinutes,
      description: TEST_SESSION.description,
      subjectName: TEST_SESSION.subjectName,
      studentId: TEST_SESSION.studentId,
      studentName: TEST_SESSION.studentName,
      studentAvatar: TEST_SESSION.studentAvatar,
      hasMaterials: TEST_SESSION.hasMaterials,
      materialsCount: TEST_SESSION.materialsCount,
    };
    return [testSession, ...sessions];
  }

  return sessions;
}

// Hook for tutor sessions
export function useTutorSessions(userId: string | undefined, tab: SessionTab) {
  return useQuery({
    queryKey: SESSION_KEYS.tutor(userId || "", tab),
    queryFn: () => fetchTutorSessions(userId!, tab),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

// Cancel session
async function cancelSession(params: {
  sessionId: string;
  userId: string;
  reason?: string;
}): Promise<void> {
  const { sessionId, userId, reason } = params;

  // Get session to check if it can be cancelled
  const { data: session, error: fetchError } = await supabase
    .from("sessions")
    .select("id, status, scheduled_at, student_id, tutor_id, subscription_id")
    .eq("id", sessionId)
    .single();

  if (fetchError || !session) {
    throw new Error("Sesión no encontrada");
  }

  if (session.status === "cancelled") {
    throw new Error("Esta sesión ya fue cancelada");
  }

  if (session.status === "completed") {
    throw new Error("No puedes cancelar una sesión completada");
  }

  // Update session status
  const { error: updateError } = await supabase
    .from("sessions")
    .update({
      status: "cancelled",
      cancelled_by: userId,
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason,
    })
    .eq("id", sessionId);

  if (updateError) {
    throw new Error("Error al cancelar la sesión");
  }

  // If student cancelled, return session to subscription
  if (session.student_id === userId && session.subscription_id) {
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("sessions_remaining")
      .eq("id", session.subscription_id)
      .single();

    if (subscription) {
      await supabase
        .from("subscriptions")
        .update({ sessions_remaining: subscription.sessions_remaining + 1 })
        .eq("id", session.subscription_id);
    }
  }

  // Notify the other party
  const otherUserId =
    userId === session.student_id ? session.tutor_id : session.student_id;

  await supabase.from("notifications").insert({
    user_id: otherUserId,
    type: "session_cancelled",
    title: "Sesión cancelada",
    message: `La sesión programada para ${new Date(session.scheduled_at).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })} ha sido cancelada`,
    data: { session_id: sessionId },
  });
}

// Hook for cancel session
export function useCancelSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["student-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["tutor-dashboard"] });
    },
  });
}

// Get session detail
async function fetchSessionDetail(sessionId: string): Promise<SessionDetail | null> {
  const { data, error } = await supabase
    .from("sessions")
    .select(`
      id,
      status,
      scheduled_at,
      duration_minutes,
      description,
      notes,
      meeting_url,
      price,
      cancelled_by,
      cancel_reason,
      started_at,
      ended_at,
      created_at,
      student_id,
      tutor_id,
      subject:subjects(name),
      student:profiles!sessions_student_id_fkey(id, full_name, avatar_url),
      tutor:profiles!sessions_tutor_id_fkey(id, full_name, avatar_url)
    `)
    .eq("id", sessionId)
    .single();

  if (error || !data) return null;

  // Get materials count
  const { data: materialsData } = await supabase
    .from("materials")
    .select("id")
    .eq("session_id", sessionId);

  const materialsCount = materialsData?.length || 0;

  const subject = Array.isArray(data.subject) ? data.subject[0] : data.subject;
  const student = Array.isArray(data.student) ? data.student[0] : data.student;
  const tutor = Array.isArray(data.tutor) ? data.tutor[0] : data.tutor;

  return {
    id: data.id,
    status: data.status as SessionStatus,
    scheduledAt: new Date(data.scheduled_at),
    durationMinutes: data.duration_minutes,
    description: data.description,
    subjectName: subject?.name || "Sesión",
    studentId: data.student_id,
    studentName: student?.full_name || "Estudiante",
    studentAvatar: student?.avatar_url || null,
    tutorId: data.tutor_id,
    tutorName: tutor?.full_name || "Tutor",
    tutorAvatar: tutor?.avatar_url || null,
    hasMaterials: materialsCount > 0,
    materialsCount,
    meetingUrl: data.meeting_url,
    notes: data.notes,
    price: data.price,
    cancelledBy: data.cancelled_by,
    cancelReason: data.cancel_reason,
    startedAt: data.started_at,
    endedAt: data.ended_at,
    createdAt: data.created_at,
  };
}

// Hook for session detail
export function useSessionDetail(sessionId: string | undefined) {
  return useQuery({
    queryKey: SESSION_KEYS.detail(sessionId || ""),
    queryFn: () => fetchSessionDetail(sessionId!),
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 2,
  });
}
