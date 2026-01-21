import { Calendar, Search, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/ui/components/shadcn/empty";
import type { SessionTab } from "../hooks";

interface EmptySessionsProps {
  tab: SessionTab;
  viewAs: "student" | "tutor";
  onSearchTutors?: () => void;
}

const emptyConfig = {
  student: {
    upcoming: {
      icon: Calendar,
      title: "Sin sesiones programadas",
      description:
        "Todavía no tienes sesiones agendadas. Busca un tutor y reserva tu primera sesión.",
      action: "Buscar tutores",
    },
    completed: {
      icon: CheckCircle2,
      title: "Sin sesiones completadas",
      description:
        "Aquí aparecerán las sesiones que hayas completado con tus tutores.",
      action: null,
    },
    cancelled: {
      icon: XCircle,
      title: "Sin sesiones canceladas",
      description:
        "No tienes sesiones canceladas. ¡Eso es bueno!",
      action: null,
    },
  },
  tutor: {
    upcoming: {
      icon: Calendar,
      title: "Sin sesiones programadas",
      description:
        "Todavía no tienes sesiones agendadas. Asegúrate de tener tu disponibilidad actualizada.",
      action: null,
    },
    completed: {
      icon: CheckCircle2,
      title: "Sin sesiones completadas",
      description:
        "Aquí aparecerán las sesiones que hayas completado con tus estudiantes.",
      action: null,
    },
    cancelled: {
      icon: XCircle,
      title: "Sin sesiones canceladas",
      description:
        "No tienes sesiones canceladas. ¡Excelente!",
      action: null,
    },
  },
};

export function EmptySessions({ tab, viewAs, onSearchTutors }: EmptySessionsProps) {
  const config = emptyConfig[viewAs][tab];
  const Icon = config.icon;

  return (
    <Empty className="py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon className="size-5" />
        </EmptyMedia>
        <EmptyTitle>{config.title}</EmptyTitle>
        <EmptyDescription>{config.description}</EmptyDescription>
      </EmptyHeader>

      {config.action && onSearchTutors && (
        <EmptyContent>
          <Button onClick={onSearchTutors}>
            <Search className="size-4 mr-2" />
            {config.action}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
