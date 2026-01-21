import { Search } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";

interface EmptyTutorsProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyTutors({ hasFilters, onClearFilters }: EmptyTutorsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="size-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {hasFilters ? "No se encontraron tutores" : "No hay tutores disponibles"}
      </h3>
      <p className="text-muted-foreground max-w-md mb-4">
        {hasFilters
          ? "Intenta ajustar los filtros de búsqueda para encontrar más tutores"
          : "Por el momento no hay tutores registrados en la plataforma"}
      </p>
      {hasFilters && (
        <Button variant="outline" onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}
