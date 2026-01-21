import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/ui/lib/supabase";
import type { MaterialType } from "@/ui/types";

// Query keys
const MATERIAL_KEYS = {
  all: ["materials"] as const,
  bySession: (sessionId: string) => [...MATERIAL_KEYS.all, "session", sessionId] as const,
  byStudent: (userId: string) => [...MATERIAL_KEYS.all, "student", userId] as const,
  byTutor: (userId: string) => [...MATERIAL_KEYS.all, "tutor", userId] as const,
};

// Types
export interface SessionMaterial {
  id: string;
  sessionId: string;
  title: string;
  description: string | null;
  type: MaterialType;
  fileUrl: string | null;
  externalUrl: string | null;
  fileSize: number | null;
  thumbnailUrl: string | null;
  downloadCount: number;
  createdAt: string;
  // Session info
  sessionDate: Date;
  subjectName: string;
  tutorName: string;
  tutorAvatar: string | null;
}

export interface StudentSessionWithMaterials {
  sessionId: string;
  sessionDate: Date;
  subjectName: string;
  tutorName: string;
  tutorAvatar: string | null;
  materials: SessionMaterial[];
}

// Fetch materials for a specific session
async function fetchSessionMaterials(sessionId: string): Promise<SessionMaterial[]> {
  const { data, error } = await supabase
    .from("materials")
    .select(`
      id,
      session_id,
      title,
      description,
      type,
      file_url,
      external_url,
      file_size,
      thumbnail_url,
      download_count,
      created_at,
      session:sessions!materials_session_id_fkey(
        scheduled_at,
        subject:subjects(name),
        tutor:profiles!sessions_tutor_id_fkey(full_name, avatar_url)
      )
    `)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((m) => {
    const session = Array.isArray(m.session) ? m.session[0] : m.session;
    const subject = session?.subject
      ? Array.isArray(session.subject) ? session.subject[0] : session.subject
      : null;
    const tutor = session?.tutor
      ? Array.isArray(session.tutor) ? session.tutor[0] : session.tutor
      : null;

    return {
      id: m.id,
      sessionId: m.session_id,
      title: m.title,
      description: m.description,
      type: m.type as MaterialType,
      fileUrl: m.file_url,
      externalUrl: m.external_url,
      fileSize: m.file_size,
      thumbnailUrl: m.thumbnail_url,
      downloadCount: m.download_count,
      createdAt: m.created_at,
      sessionDate: new Date(session?.scheduled_at || Date.now()),
      subjectName: subject?.name || "Sesión",
      tutorName: tutor?.full_name || "Tutor",
      tutorAvatar: tutor?.avatar_url || null,
    };
  });
}

// Hook for materials by session
export function useSessionMaterials(sessionId: string | undefined) {
  return useQuery({
    queryKey: MATERIAL_KEYS.bySession(sessionId || ""),
    queryFn: () => fetchSessionMaterials(sessionId!),
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5,
  });
}

// Fetch all sessions with materials for a student
async function fetchStudentMaterials(userId: string): Promise<StudentSessionWithMaterials[]> {
  // First get all sessions where user is student and has materials
  const { data: sessions, error: sessionsError } = await supabase
    .from("sessions")
    .select(`
      id,
      scheduled_at,
      subject:subjects(name),
      tutor:profiles!sessions_tutor_id_fkey(full_name, avatar_url)
    `)
    .eq("student_id", userId)
    .eq("status", "completed")
    .order("scheduled_at", { ascending: false });

  if (sessionsError) throw sessionsError;
  if (!sessions || sessions.length === 0) return [];

  const sessionIds = sessions.map((s) => s.id);

  // Get materials for those sessions
  const { data: materials, error: materialsError } = await supabase
    .from("materials")
    .select("*")
    .in("session_id", sessionIds)
    .order("created_at", { ascending: false });

  if (materialsError) throw materialsError;

  // Group materials by session
  const materialsBySession = new Map<string, SessionMaterial[]>();
  (materials || []).forEach((m) => {
    const session = sessions.find((s) => s.id === m.session_id);
    if (!session) return;

    const subject = session.subject
      ? Array.isArray(session.subject) ? session.subject[0] : session.subject
      : null;
    const tutor = session.tutor
      ? Array.isArray(session.tutor) ? session.tutor[0] : session.tutor
      : null;

    const material: SessionMaterial = {
      id: m.id,
      sessionId: m.session_id,
      title: m.title,
      description: m.description,
      type: m.type as MaterialType,
      fileUrl: m.file_url,
      externalUrl: m.external_url,
      fileSize: m.file_size,
      thumbnailUrl: m.thumbnail_url,
      downloadCount: m.download_count,
      createdAt: m.created_at,
      sessionDate: new Date(session.scheduled_at),
      subjectName: subject?.name || "Sesión",
      tutorName: tutor?.full_name || "Tutor",
      tutorAvatar: tutor?.avatar_url || null,
    };

    const existing = materialsBySession.get(m.session_id) || [];
    existing.push(material);
    materialsBySession.set(m.session_id, existing);
  });

  // Only return sessions that have materials
  return sessions
    .filter((s) => materialsBySession.has(s.id))
    .map((s) => {
      const subject = s.subject
        ? Array.isArray(s.subject) ? s.subject[0] : s.subject
        : null;
      const tutor = s.tutor
        ? Array.isArray(s.tutor) ? s.tutor[0] : s.tutor
        : null;

      return {
        sessionId: s.id,
        sessionDate: new Date(s.scheduled_at),
        subjectName: subject?.name || "Sesión",
        tutorName: tutor?.full_name || "Tutor",
        tutorAvatar: tutor?.avatar_url || null,
        materials: materialsBySession.get(s.id) || [],
      };
    });
}

// Hook for student materials (grouped by session)
export function useStudentMaterials(userId: string | undefined) {
  return useQuery({
    queryKey: MATERIAL_KEYS.byStudent(userId || ""),
    queryFn: () => fetchStudentMaterials(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

// Upload material (for tutors)
interface UploadMaterialParams {
  sessionId: string;
  tutorId: string;
  title: string;
  description?: string;
  type: MaterialType;
  file?: File;
  externalUrl?: string;
}

async function uploadMaterial(params: UploadMaterialParams): Promise<void> {
  const { sessionId, tutorId, title, description, type, file, externalUrl } = params;

  let fileUrl: string | null = null;
  let fileSize: number | null = null;

  // If there's a file, upload it to Supabase Storage
  if (file) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${sessionId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("materials")
      .upload(fileName, file);

    if (uploadError) {
      throw new Error("Error al subir el archivo");
    }

    const { data: urlData } = supabase.storage
      .from("materials")
      .getPublicUrl(fileName);

    fileUrl = urlData.publicUrl;
    fileSize = file.size;
  }

  // Insert material record
  const { error: insertError } = await supabase
    .from("materials")
    .insert({
      session_id: sessionId,
      tutor_id: tutorId,
      uploaded_by: tutorId,
      title,
      description: description || null,
      type,
      file_url: fileUrl,
      external_url: externalUrl || null,
      file_size: fileSize,
      is_public: false,
      download_count: 0,
    });

  if (insertError) {
    throw new Error("Error al guardar el material");
  }
}

// Hook for uploading material
export function useUploadMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMaterial,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MATERIAL_KEYS.bySession(variables.sessionId) });
      queryClient.invalidateQueries({ queryKey: MATERIAL_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

// Delete material (for tutors)
async function deleteMaterial(params: { materialId: string; tutorId: string }): Promise<void> {
  const { materialId, tutorId } = params;

  // Verify ownership
  const { data: material, error: fetchError } = await supabase
    .from("materials")
    .select("id, tutor_id, file_url")
    .eq("id", materialId)
    .single();

  if (fetchError || !material) {
    throw new Error("Material no encontrado");
  }

  if (material.tutor_id !== tutorId) {
    throw new Error("No tienes permiso para eliminar este material");
  }

  // Delete file from storage if exists
  if (material.file_url) {
    const path = material.file_url.split("/materials/")[1];
    if (path) {
      await supabase.storage.from("materials").remove([path]);
    }
  }

  // Delete record
  const { error: deleteError } = await supabase
    .from("materials")
    .delete()
    .eq("id", materialId);

  if (deleteError) {
    throw new Error("Error al eliminar el material");
  }
}

// Hook for deleting material
export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIAL_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

// Increment download count
async function incrementDownload(materialId: string): Promise<void> {
  await supabase.rpc("increment_download_count", { material_id: materialId });
}

export function useIncrementDownload() {
  return useMutation({
    mutationFn: incrementDownload,
  });
}
