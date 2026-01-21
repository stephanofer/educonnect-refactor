import { BookOpen, Search } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/ui/components/shadcn/empty";

interface EmptyMaterialsProps {
  onSearchTutors?: () => void;
}

export function EmptyMaterials({ onSearchTutors }: EmptyMaterialsProps) {
  return (
    <Empty className="py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookOpen className="size-5" />
        </EmptyMedia>
        <EmptyTitle>Sin materiales de estudio</EmptyTitle>
        <EmptyDescription>
          Los materiales que tus tutores compartan después de cada sesión aparecerán aquí.
          Reserva tu primera sesión para empezar a recibir recursos de estudio.
        </EmptyDescription>
      </EmptyHeader>

      {onSearchTutors && (
        <EmptyContent>
          <Button onClick={onSearchTutors}>
            <Search className="size-4 mr-2" />
            Buscar tutores
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
