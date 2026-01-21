import { Library, SearchX } from "lucide-react";

interface EmptyLibraryProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function EmptyLibrary({ hasFilters, onClearFilters }: EmptyLibraryProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">
          <SearchX className="size-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">No se encontraron materiales</h3>
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          No hay materiales que coincidan con tus filtros de búsqueda. 
          Intenta con otros términos o elimina algunos filtros.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm font-medium text-primary hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Library className="size-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold">Biblioteca vacía</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Aún no hay materiales disponibles en la biblioteca. 
        Vuelve pronto, estamos agregando contenido constantemente.
      </p>
    </div>
  );
}
