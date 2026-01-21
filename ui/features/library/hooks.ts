import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/ui/lib/supabase";
import type { MaterialType, MaterialCategory, Subject } from "@/ui/types";

// Query keys
const LIBRARY_KEYS = {
  all: ["library"] as const,
  materials: () => [...LIBRARY_KEYS.all, "materials"] as const,
  material: (id: string) => [...LIBRARY_KEYS.materials(), id] as const,
};

// Library Material type (specific for library_materials table)
export interface LibraryMaterial {
  id: string;
  uploaded_by: string;
  subject_id?: string;
  title: string;
  description?: string;
  type: MaterialType;
  category?: MaterialCategory;
  file_url?: string;
  file_size?: number;
  external_url?: string;
  thumbnail_url?: string;
  download_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

// Filters interface
export interface LibraryFilters {
  search?: string;
  type?: MaterialType;
  category?: MaterialCategory;
  subjectId?: string;
}

// Fetch library materials
async function fetchLibraryMaterials(
  filters: LibraryFilters
): Promise<LibraryMaterial[]> {
  let query = supabase
    .from("library_materials")
    .select(
      `
      id,
      uploaded_by,
      subject_id,
      title,
      description,
      type,
      category,
      file_url,
      file_size,
      external_url,
      thumbnail_url,
      download_count,
      is_active,
      created_at,
      updated_at,
      subject:subjects(id, name, category, icon)
    `
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  if (filters.type) {
    query = query.eq("type", filters.type);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.subjectId) {
    query = query.eq("subject_id", filters.subjectId);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform the response - subject comes as array from relation
  return (data || []).map((item) => {
    const rawItem = item as Record<string, unknown>;
    const subjectData = rawItem.subject;
    const subject = Array.isArray(subjectData) ? subjectData[0] : subjectData;

    return {
      id: rawItem.id as string,
      uploaded_by: rawItem.uploaded_by as string,
      subject_id: rawItem.subject_id as string | undefined,
      title: rawItem.title as string,
      description: rawItem.description as string | undefined,
      type: rawItem.type as MaterialType,
      category: rawItem.category as MaterialCategory | undefined,
      file_url: rawItem.file_url as string | undefined,
      file_size: rawItem.file_size as number | undefined,
      external_url: rawItem.external_url as string | undefined,
      thumbnail_url: rawItem.thumbnail_url as string | undefined,
      download_count: rawItem.download_count as number,
      is_active: rawItem.is_active as boolean,
      created_at: rawItem.created_at as string,
      updated_at: rawItem.updated_at as string,
      subject: subject as Subject | undefined,
    };
  });
}

// Hook to fetch library materials
export function useLibraryMaterials(filters: LibraryFilters = {}) {
  return useQuery({
    queryKey: [...LIBRARY_KEYS.materials(), filters],
    queryFn: () => fetchLibraryMaterials(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Increment download count
async function incrementDownloadCount(materialId: string): Promise<void> {
  // Get current count and increment
  const { data: material } = await supabase
    .from("library_materials")
    .select("download_count")
    .eq("id", materialId)
    .single();

  if (material) {
    await supabase
      .from("library_materials")
      .update({ download_count: (material.download_count || 0) + 1 })
      .eq("id", materialId);
  }
}

// Hook to track downloads
export function useTrackDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: incrementDownloadCount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.materials() });
    },
  });
}

// Upload material (admin only)
interface UploadMaterialParams {
  title: string;
  description?: string;
  type: MaterialType;
  category?: MaterialCategory;
  subjectId?: string;
  file?: File;
  externalUrl?: string;
  uploadedBy: string;
}

async function uploadMaterial(params: UploadMaterialParams): Promise<void> {
  let fileUrl: string | undefined;
  let fileSize: number | undefined;

  // Upload file if provided
  if (params.file) {
    const fileExt = params.file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("library")
      .upload(fileName, params.file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("library")
      .getPublicUrl(fileName);

    fileUrl = urlData.publicUrl;
    fileSize = params.file.size;
  }

  // Insert material record
  const { error } = await supabase.from("library_materials").insert({
    title: params.title,
    description: params.description,
    type: params.type,
    category: params.category,
    subject_id: params.subjectId || null,
    file_url: fileUrl,
    file_size: fileSize,
    external_url: params.externalUrl,
    uploaded_by: params.uploadedBy,
    download_count: 0,
    is_active: true,
  });

  if (error) throw error;
}

// Hook to upload materials
export function useUploadMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.materials() });
    },
  });
}

// Delete material (admin only)
async function deleteMaterial(materialId: string): Promise<void> {
  // Get material to find file path
  const { data: material } = await supabase
    .from("library_materials")
    .select("file_url")
    .eq("id", materialId)
    .single();

  // Delete file from storage if exists
  if (material?.file_url) {
    try {
      const url = new URL(material.file_url);
      const pathParts = url.pathname.split("/");
      const fileName = pathParts[pathParts.length - 1]; // Get just the filename
      await supabase.storage.from("library").remove([fileName]);
    } catch {
      // Ignore storage deletion errors
    }
  }

  // Delete record
  const { error } = await supabase
    .from("library_materials")
    .delete()
    .eq("id", materialId);

  if (error) throw error;
}

// Hook to delete materials
export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.materials() });
    },
  });
}

// Fetch all subjects for filter dropdown
async function fetchSubjects() {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, category, icon")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data || [];
}

export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: fetchSubjects,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
