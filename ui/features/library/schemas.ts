import { z } from "zod";
import { MATERIAL_TYPE, MATERIAL_CATEGORY, type MaterialType, type MaterialCategory } from "@/ui/types";

// Schema for uploading a new material
export const uploadMaterialSchema = z.object({
  title: z.string().min(1, { error: "El título es obligatorio" }).max(200, { error: "Máximo 200 caracteres" }),
  description: z.string().max(1000, { error: "Máximo 1000 caracteres" }).optional(),
  type: z.enum([
    MATERIAL_TYPE.PDF,
    MATERIAL_TYPE.VIDEO,
    MATERIAL_TYPE.LINK,
    MATERIAL_TYPE.DOCUMENT,
    MATERIAL_TYPE.IMAGE,
  ] as [MaterialType, ...MaterialType[]], { error: "Selecciona un tipo de material" }),
  category: z.enum([
    MATERIAL_CATEGORY.MATEMATICAS,
    MATERIAL_CATEGORY.CIENCIAS,
    MATERIAL_CATEGORY.PROGRAMACION,
    MATERIAL_CATEGORY.IDIOMAS,
    MATERIAL_CATEGORY.HUMANIDADES,
    MATERIAL_CATEGORY.NEGOCIOS,
    MATERIAL_CATEGORY.OTROS,
  ] as [MaterialCategory, ...MaterialCategory[]], { error: "Selecciona una categoría" }).optional(),
  subjectId: z.string().uuid().optional().or(z.literal("")),
  externalUrl: z.string().url({ error: "URL inválida" }).optional().or(z.literal("")),
});

export type UploadMaterialFormData = z.infer<typeof uploadMaterialSchema>;

// Additional validation for file (not part of zod schema)
export const ALLOWED_FILE_TYPES = {
  pdf: ["application/pdf"],
  video: ["video/mp4", "video/webm"],
  document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  link: [],
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function validateFile(file: File | null, materialType: MaterialType): string | null {
  if (materialType === "link") {
    return null; // No file needed for links
  }

  if (!file) {
    return "Debes seleccionar un archivo";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "El archivo no puede superar 50MB";
  }

  const allowedTypes = ALLOWED_FILE_TYPES[materialType] || [];
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `Tipo de archivo no permitido para ${materialType}`;
  }

  return null;
}
