import { motion } from "motion/react";
import {
  FileText,
  Video,
  Link as LinkIcon,
  Image,
  File,
  Download,
  ExternalLink,
  Calendar,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/ui/components/shadcn/card";
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
  { icon: typeof FileText; color: string; bgColor: string; label: string }
> = {
  pdf: {
    icon: FileText,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "PDF",
  },
  video: {
    icon: Video,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    label: "Video",
  },
  link: {
    icon: LinkIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Enlace",
  },
  document: {
    icon: File,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "Documento",
  },
  image: {
    icon: Image,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
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

  const handleAction = async () => {
    if (material.external_url) {
      window.open(material.external_url, "_blank", "noopener,noreferrer");
    } else if (material.file_url) {
      // For files, open in new tab (browser will handle download/preview)
      window.open(material.file_url, "_blank", "noopener,noreferrer");
    }
    
    onDownload?.(material);
  };

  const isExternalLink = material.type === "link" || !!material.external_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="group h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
        {/* Thumbnail / Icon Header */}
        <div
          className={cn(
            "relative flex h-32 items-center justify-center",
            typeConfig.bgColor
          )}
        >
          {material.thumbnail_url ? (
            <img
              src={material.thumbnail_url}
              alt={material.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <TypeIcon className={cn("size-12", typeConfig.color)} />
          )}
          
          {/* Type Badge */}
          <Badge
            variant="secondary"
            className="absolute right-2 top-2 text-xs"
          >
            {typeConfig.label}
          </Badge>
        </div>

        <CardContent className="p-4">
          {/* Category */}
          {material.category && (
            <span className="mb-2 inline-block text-xs font-medium text-muted-foreground">
              {CATEGORY_LABELS[material.category] || material.category}
            </span>
          )}

          {/* Title */}
          <h3 className="mb-2 line-clamp-2 font-semibold leading-tight group-hover:text-primary transition-colors">
            {material.title}
          </h3>

          {/* Description */}
          {material.description && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {material.description}
            </p>
          )}

          {/* Subject Tag */}
          {material.subject && (
            <Badge variant="outline" className="text-xs">
              {material.subject.name}
            </Badge>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t px-4 py-3">
          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {formatDate(material.created_at)}
                </span>
              </TooltipTrigger>
              <TooltipContent>Fecha de publicación</TooltipContent>
            </Tooltip>

            {material.download_count > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1">
                    <Eye className="size-3" />
                    {material.download_count}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {material.download_count} descargas
                </TooltipContent>
              </Tooltip>
            )}

            {material.file_size && (
              <span>{formatFileSize(material.file_size)}</span>
            )}
          </div>

          {/* Action Button */}
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5"
            onClick={handleAction}
          >
            {isExternalLink ? (
              <>
                <ExternalLink className="size-3.5" />
                <span className="sr-only md:not-sr-only">Abrir</span>
              </>
            ) : (
              <>
                <Download className="size-3.5" />
                <span className="sr-only md:not-sr-only">Descargar</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
