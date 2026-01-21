import { motion } from "motion/react";
import {
  FileText,
  Video,
  Link2,
  Image,
  File,
  Download,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/ui/components/shadcn/card";
import { Badge } from "@/ui/components/shadcn/badge";
import { Button } from "@/ui/components/shadcn/button";
import { cn } from "@/ui/lib/utils";
import type { SessionMaterial } from "../hooks";

interface MaterialCardProps {
  material: SessionMaterial;
  onDownload?: (material: SessionMaterial) => void;
  onDelete?: (material: SessionMaterial) => void;
  showSessionInfo?: boolean;
  canDelete?: boolean;
  index?: number;
}

// Icon mapping by type
const TYPE_CONFIG = {
  pdf: {
    icon: FileText,
    color: "text-red-500 bg-red-50",
    label: "PDF",
  },
  video: {
    icon: Video,
    color: "text-purple-500 bg-purple-50",
    label: "Video",
  },
  link: {
    icon: Link2,
    color: "text-blue-500 bg-blue-50",
    label: "Enlace",
  },
  image: {
    icon: Image,
    color: "text-green-500 bg-green-50",
    label: "Imagen",
  },
  document: {
    icon: File,
    color: "text-amber-500 bg-amber-50",
    label: "Documento",
  },
};

// Format file size
function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MaterialCard({
  material,
  onDownload,
  onDelete,
  showSessionInfo = false,
  canDelete = false,
  index = 0,
}: MaterialCardProps) {
  const config = TYPE_CONFIG[material.type] || TYPE_CONFIG.document;
  const Icon = config.icon;

  const handleDownload = () => {
    if (material.externalUrl) {
      window.open(material.externalUrl, "_blank", "noopener,noreferrer");
    } else if (material.fileUrl) {
      window.open(material.fileUrl, "_blank", "noopener,noreferrer");
    }
    onDownload?.(material);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className="group hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Icon */}
            <div
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-lg",
                config.color
              )}
            >
              <Icon className="size-6" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium text-foreground truncate">
                    {material.title}
                  </h3>
                  {material.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {material.description}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {config.label}
                </Badge>
              </div>

              {/* Session info */}
              {showSessionInfo && (
                <p className="text-xs text-muted-foreground mt-2">
                  {material.subjectName} •{" "}
                  {material.sessionDate.toLocaleDateString("es", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}

              {/* Meta and actions */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {material.fileSize && (
                    <span>{formatFileSize(material.fileSize)}</span>
                  )}
                  {material.downloadCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Download className="size-3" />
                      {material.downloadCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {canDelete && onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(material)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    {material.externalUrl ? (
                      <>
                        <ExternalLink className="size-4 mr-1.5" />
                        Abrir
                      </>
                    ) : (
                      <>
                        <Download className="size-4 mr-1.5" />
                        Descargar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
