import { motion } from "motion/react";
import {
  FileText,
  Video,
  Link as LinkIcon,
  Image,
  File,
  ExternalLink,
  ArrowDownToLine,
} from "lucide-react";
import { Badge } from "@/ui/components/shadcn/badge";
import { Button } from "@/ui/components/shadcn/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/components/shadcn/tooltip";
import type { MaterialType } from "@/ui/types";
import type { LibraryMaterial } from "../hooks";
import { cn } from "@/ui/lib/utils";

interface MaterialCardProps {
  material: LibraryMaterial;
  onDownload?: (material: LibraryMaterial) => void;
  index?: number;
}

// Icon and color mapping for material types
const MATERIAL_TYPE_CONFIG: Record<
  MaterialType,
  { icon: typeof FileText; color: string; bgColor: string; badgeBg: string; label: string }
> = {
  pdf: {
    icon: FileText,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    badgeBg: "bg-red-500/90 text-white hover:bg-red-500",
    label: "PDF",
  },
  video: {
    icon: Video,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    badgeBg: "bg-purple-500/90 text-white hover:bg-purple-500",
    label: "Video",
  },
  link: {
    icon: LinkIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    badgeBg: "bg-blue-500/90 text-white hover:bg-blue-500",
    label: "Enlace",
  },
  document: {
    icon: File,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    badgeBg: "bg-green-500/90 text-white hover:bg-green-500",
    label: "Documento",
  },
  image: {
    icon: Image,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    badgeBg: "bg-orange-500/90 text-white hover:bg-orange-500",
    label: "Imagen",
  },
};

// Category labels in Spanish
const CATEGORY_LABELS: Record<string, string> = {
  matematicas: "Matemáticas",
  ciencias: "Ciencias",
  programacion: "Programación",
  idiomas: "Idiomas",
  humanidades: "Humanidades",
  negocios: "Negocios",
  otros: "Otros",
};

// Format file size
function formatFileSize(bytes?: number): string {
  if (!bytes) return "";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MaterialCard({ material, onDownload, index = 0 }: MaterialCardProps) {
  const typeConfig = MATERIAL_TYPE_CONFIG[material.type] || MATERIAL_TYPE_CONFIG.document;
  const TypeIcon = typeConfig.icon;

  const isExternalLink = material.type === "link" || (!!material.external_url && !material.file_url);

  const handleAction = () => {
    if (isExternalLink && material.external_url) {
      window.open(material.external_url, "_blank", "noopener,noreferrer");
    } else {
      // All file downloads go to /recurso0001.pdf
      const link = document.createElement("a");
      link.href = "/recurso0001.pdf";
      link.download = `${material.title.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, "").trim().replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    onDownload?.(material);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="h-full"
    >
      <div className="group relative h-full flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1">
        {/* Thumbnail Area */}
        <div className="relative h-44 overflow-hidden">
          {material.thumbnail_url ? (
            <>
              <img
                src={material.thumbnail_url}
                alt={material.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </>
          ) : (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center",
                typeConfig.bgColor
              )}
            >
              <TypeIcon className={cn("size-14 opacity-60", typeConfig.color)} />
            </div>
          )}

          {/* Type Badge - top left */}
          <Badge className={cn("absolute left-3 top-3 text-[11px] font-semibold border-0 shadow-sm", typeConfig.badgeBg)}>
            <TypeIcon className="size-3 mr-1" />
            {typeConfig.label}
          </Badge>

          {/* Subject tag on thumbnail - bottom left */}
          {material.subject && material.thumbnail_url && (
            <span className="absolute bottom-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm">
              {material.subject.name}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          {/* Category */}
          {material.category && (
            <span className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary/70">
              {CATEGORY_LABELS[material.category] || material.category}
            </span>
          )}

          {/* Title */}
          <h3 className="mb-1.5 line-clamp-2 text-[15px] font-bold leading-snug text-foreground group-hover:text-primary transition-colors duration-200">
            {material.title}
          </h3>

          {/* Description */}
          {material.description && (
            <p className="mb-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
              {material.description}
            </p>
          )}

          {/* Subject Tag (when no thumbnail) */}
          {material.subject && !material.thumbnail_url && (
            <Badge variant="outline" className="text-xs w-fit mb-3">
              {material.subject.name}
            </Badge>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer: Meta + Action */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1">
                    {formatDate(material.created_at)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>Fecha de publicación</TooltipContent>
              </Tooltip>

              {material.file_size ? (
                <>
                  <span className="text-border">·</span>
                  <span>{formatFileSize(material.file_size)}</span>
                </>
              ) : null}
            </div>

            {/* Download/Open Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={isExternalLink ? "outline" : "default"}
                  className={cn(
                    "gap-1.5 h-8 rounded-lg text-xs font-semibold transition-all duration-200",
                    !isExternalLink &&
                      "bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-none"
                  )}
                  onClick={handleAction}
                >
                  {isExternalLink ? (
                    <>
                      <ExternalLink className="size-3.5" />
                      <span className="hidden sm:inline">Abrir</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownToLine className="size-3.5 transition-transform duration-200 group-hover:translate-y-0.5" />
                      <span className="hidden sm:inline">Descargar</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isExternalLink ? "Abrir enlace externo" : "Descargar recurso"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
