import { useState, useRef } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Library,
  Plus,
  Upload,
  Trash2,
  FileText,
  Video,
  Link as LinkIcon,
  File,
  Image,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { Input } from "@/ui/components/shadcn/input";
import { Textarea } from "@/ui/components/shadcn/textarea";
import { Label } from "@/ui/components/shadcn/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/ui/components/shadcn/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/shadcn/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/components/shadcn/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/components/shadcn/alert-dialog";
import { Badge } from "@/ui/components/shadcn/badge";
import { Skeleton } from "@/ui/components/shadcn/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/shadcn/card";
import { useAuthStore } from "@/ui/stores/auth.store";
import {
  useLibraryMaterials,
  useUploadMaterial,
  useDeleteMaterial,
  useSubjects,
} from "@/ui/features/library/hooks";
import {
  uploadMaterialSchema,
  validateFile,
  type UploadMaterialFormData,
} from "@/ui/features/library/schemas";
import { MATERIAL_TYPE, MATERIAL_CATEGORY, type MaterialType, type MaterialCategory } from "@/ui/types";
import { cn } from "@/ui/lib/utils";

// Type icons
const TYPE_ICONS: Record<MaterialType, typeof FileText> = {
  pdf: FileText,
  video: Video,
  link: LinkIcon,
  document: File,
  image: Image,
};

// Labels
const TYPE_LABELS: Record<MaterialType, string> = {
  pdf: "PDF",
  video: "Video",
  link: "Enlace",
  document: "Documento",
  image: "Imagen",
};

const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  matematicas: "Matemáticas",
  ciencias: "Ciencias",
  programacion: "Programación",
  idiomas: "Idiomas",
  humanidades: "Humanidades",
  negocios: "Negocios",
  otros: "Otros",
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminLibraryPage() {
  const { user } = useAuthStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: materials, isLoading: materialsLoading } = useLibraryMaterials({});
  const { data: subjects } = useSubjects();
  const uploadMaterial = useUploadMaterial();
  const deleteMaterial = useDeleteMaterial();

  // Form
  const form = useForm<UploadMaterialFormData>({
    resolver: zodResolver(uploadMaterialSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "pdf",
      category: undefined,
      subjectId: "",
      externalUrl: "",
    },
  });

  const watchType = form.watch("type");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file) {
      const error = validateFile(file, watchType);
      setFileError(error);
    } else {
      setFileError(null);
    }
  };

  const resetForm = () => {
    form.reset();
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: UploadMaterialFormData) => {
    // Validate file for non-link types
    if (data.type !== "link") {
      const error = validateFile(selectedFile, data.type);
      if (error) {
        setFileError(error);
        return;
      }
    }

    // Validate external URL for link type
    if (data.type === "link" && !data.externalUrl) {
      form.setError("externalUrl", { message: "La URL es obligatoria para enlaces" });
      return;
    }

    try {
      await uploadMaterial.mutateAsync({
        title: data.title,
        description: data.description || undefined,
        type: data.type,
        category: data.category || undefined,
        subjectId: data.subjectId || undefined,
        file: selectedFile || undefined,
        externalUrl: data.externalUrl || undefined,
        uploadedBy: user!.id,
      });

      toast.success("Material subido exitosamente");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Error al subir el material");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMaterial.mutateAsync(deleteId);
      toast.success("Material eliminado");
      setDeleteId(null);
    } catch (error) {
      toast.error("Error al eliminar el material");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Library className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Administrar Biblioteca
            </h1>
            <p className="text-muted-foreground">
              Sube y gestiona el material de estudio
            </p>
          </div>
        </div>

        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="size-4" />
          Subir Material
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Materiales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {materialsLoading ? <Skeleton className="h-8 w-12" /> : materials?.length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              PDFs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {materialsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                materials?.filter((m) => m.type === "pdf").length || 0
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {materialsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                materials?.filter((m) => m.type === "video").length || 0
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Descargas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {materialsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                materials?.reduce((sum, m) => sum + (m.download_count || 0), 0) || 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Materials Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Material</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="hidden md:table-cell">Categoría</TableHead>
                  <TableHead className="hidden lg:table-cell">Tamaño</TableHead>
                  <TableHead className="hidden sm:table-cell">Descargas</TableHead>
                  <TableHead className="hidden md:table-cell">Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-8" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : materials && materials.length > 0 ? (
                  materials.map((material) => {
                    const Icon = TYPE_ICONS[material.type] || File;
                    return (
                      <TableRow key={material.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                              <Icon className="size-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{material.title}</p>
                              {material.description && (
                                <p className="truncate text-xs text-muted-foreground max-w-[200px]">
                                  {material.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{TYPE_LABELS[material.type]}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {material.category ? CATEGORY_LABELS[material.category] : "-"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {formatFileSize(material.file_size)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {material.download_count || 0}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {formatDate(material.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(material.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Library className="size-8" />
                        <p>No hay materiales en la biblioteca</p>
                        <Button
                          variant="link"
                          onClick={() => setIsDialogOpen(true)}
                        >
                          Subir el primero
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Subir Material</DialogTitle>
            <DialogDescription>
              Agrega un nuevo material a la biblioteca virtual.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Ej: Guía de Cálculo Diferencial"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Breve descripción del material..."
                rows={3}
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Type and Category Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Type */}
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(value) => {
                    form.setValue("type", value as MaterialType);
                    // Clear file when type changes
                    setSelectedFile(null);
                    setFileError(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MATERIAL_TYPE).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {TYPE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={form.watch("category") || ""}
                  onValueChange={(value) => 
                    form.setValue("category", value as MaterialCategory || undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MATERIAL_CATEGORY).map(([key, value]) => (
                      <SelectItem key={key} value={value}>
                        {CATEGORY_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subject */}
            {subjects && subjects.length > 0 && (
              <div className="space-y-2">
                <Label>Materia (opcional)</Label>
                <Select
                  value={form.watch("subjectId") || ""}
                  onValueChange={(value) => form.setValue("subjectId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar materia..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* File Upload or URL */}
            {watchType === "link" ? (
              <div className="space-y-2">
                <Label htmlFor="externalUrl">URL del enlace *</Label>
                <Input
                  id="externalUrl"
                  type="url"
                  placeholder="https://..."
                  {...form.register("externalUrl")}
                />
                {form.formState.errors.externalUrl && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.externalUrl.message}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Archivo *</Label>
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
                    selectedFile
                      ? "border-primary/50 bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50",
                    fileError && "border-destructive/50 bg-destructive/5"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    accept={
                      watchType === "pdf"
                        ? ".pdf"
                        : watchType === "video"
                        ? ".mp4,.webm"
                        : watchType === "image"
                        ? ".jpg,.jpeg,.png,.webp,.gif"
                        : undefined
                    }
                  />
                  
                  {selectedFile ? (
                    <div className="flex items-center gap-3">
                      <File className="size-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setFileError(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mb-2 size-8 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Arrastra o haz clic para subir
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Máximo 50MB
                      </p>
                    </>
                  )}
                </div>
                {fileError && (
                  <p className="text-sm text-destructive">{fileError}</p>
                )}
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={uploadMaterial.isPending}
                className="gap-2"
              >
                {uploadMaterial.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Subir Material
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar material?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El material será eliminado permanentemente 
              de la biblioteca y del almacenamiento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMaterial.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
