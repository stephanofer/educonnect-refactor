import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Link2, FileText, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/ui/components/shadcn/dialog";
import { Button } from "@/ui/components/shadcn/button";
import { Input } from "@/ui/components/shadcn/input";
import { Textarea } from "@/ui/components/shadcn/textarea";
import { Label } from "@/ui/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/shadcn/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/components/shadcn/tabs";
import { cn } from "@/ui/lib/utils";
import { useUploadMaterial } from "../hooks";
import type { MaterialType } from "@/ui/types";
import { MATERIAL_TYPE } from "@/ui/types";

// Zod 4 schema
const uploadSchema = z.object({
  title: z.string().min(1, { error: "El título es requerido" }).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(["pdf", "video", "link", "document", "image"]),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface UploadMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  tutorId: string;
  sessionInfo?: {
    subjectName: string;
    studentName: string;
    date: Date;
  };
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_TYPES: Record<MaterialType, string[]> = {
  pdf: ["application/pdf"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  document: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ],
  link: [],
};

export function UploadMaterialModal({
  open,
  onOpenChange,
  sessionId,
  tutorId,
  sessionInfo,
}: UploadMaterialModalProps) {
  const [uploadMode, setUploadMode] = useState<"file" | "link">("file");
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = useUploadMaterial();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "pdf",
    },
  });

  const selectedType = watch("type");

  const handleClose = () => {
    reset();
    setFile(null);
    setExternalUrl("");
    setUploadMode("file");
    onOpenChange(false);
  };

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("Archivo muy grande", {
        description: "El archivo no puede superar los 50MB.",
      });
      return;
    }

    // Auto-detect type
    const mimeType = selectedFile.type;
    let detectedType: MaterialType = "document";

    for (const [type, mimes] of Object.entries(ALLOWED_TYPES)) {
      if (mimes.includes(mimeType)) {
        detectedType = type as MaterialType;
        break;
      }
    }

    setFile(selectedFile);
    setValue("type", detectedType);

    // Auto-fill title if empty
    const currentTitle = watch("title");
    if (!currentTitle) {
      setValue("title", selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onSubmit = (data: UploadFormData) => {
    if (uploadMode === "file" && !file) {
      toast.error("Selecciona un archivo");
      return;
    }

    if (uploadMode === "link" && !externalUrl) {
      toast.error("Ingresa una URL");
      return;
    }

    uploadMutation.mutate(
      {
        sessionId,
        tutorId,
        title: data.title,
        description: data.description,
        type: uploadMode === "link" ? MATERIAL_TYPE.LINK : (data.type as MaterialType),
        file: uploadMode === "file" ? file ?? undefined : undefined,
        externalUrl: uploadMode === "link" ? externalUrl : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Material subido", {
            description: "El material ha sido compartido con el estudiante.",
          });
          handleClose();
        },
        onError: (error) => {
          toast.error("Error al subir", {
            description: error.message || "Intenta de nuevo más tarde.",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Subir material de estudio</DialogTitle>
          <DialogDescription>
            {sessionInfo ? (
              <>
                Para la sesión de <strong>{sessionInfo.subjectName}</strong> con{" "}
                {sessionInfo.studentName}
              </>
            ) : (
              "Comparte recursos de estudio con tu estudiante"
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Upload mode tabs */}
          <Tabs value={uploadMode} onValueChange={(v) => setUploadMode(v as "file" | "link")}>
            <TabsList className="w-full">
              <TabsTrigger value="file" className="flex-1 gap-1.5">
                <Upload className="size-4" />
                Subir archivo
              </TabsTrigger>
              <TabsTrigger value="link" className="flex-1 gap-1.5">
                <Link2 className="size-4" />
                Enlace externo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="mt-4">
              {/* Drop zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={cn(
                  "relative rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50",
                  file && "border-primary bg-primary/5"
                )}
              >
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.mp4,.webm,.jpg,.jpeg,.png,.webp,.gif"
                />

                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="size-8 text-primary" />
                    <div className="text-left">
                      <p className="font-medium text-sm truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Arrastra un archivo o{" "}
                      <span className="text-primary font-medium">haz clic para seleccionar</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, documentos, videos, imágenes (máx. 50MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Type selector (only for files) */}
              <div className="mt-4">
                <Label>Tipo de material</Label>
                <Select value={selectedType} onValueChange={(v) => setValue("type", v as MaterialType)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="document">Documento</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Imagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="link" className="mt-4">
              <div>
                <Label htmlFor="external-url">URL del recurso</Label>
                <Input
                  id="external-url"
                  type="url"
                  placeholder="https://ejemplo.com/recurso"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  YouTube, Google Drive, Notion, o cualquier enlace público
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Title */}
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Ej: Guía de ejercicios - Capítulo 3"
              className="mt-1.5"
            />
            {errors.title && (
              <p className="text-xs text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Breve descripción del contenido..."
              rows={2}
              className="mt-1.5"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? "Subiendo..." : "Subir material"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
