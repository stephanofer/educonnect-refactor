import { Search, Filter, X } from "lucide-react";
import { Input } from "@/ui/components/shadcn/input";
import { Button } from "@/ui/components/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/shadcn/select";
import { Badge } from "@/ui/components/shadcn/badge";
import { MATERIAL_TYPE, MATERIAL_CATEGORY, type MaterialType, type MaterialCategory } from "@/ui/types";
import type { LibraryFilters } from "../hooks";

interface LibraryFiltersProps {
  filters: LibraryFilters;
  onFiltersChange: (filters: LibraryFilters) => void;
  subjects?: Array<{ id: string; name: string }>;
  totalResults?: number;
}

// Labels for UI
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

export function LibraryFiltersComponent({
  filters,
  onFiltersChange,
  subjects = [],
  totalResults,
}: LibraryFiltersProps) {
  const hasActiveFilters =
    filters.search || filters.type || filters.category || filters.subjectId;

  const activeFilterCount = [
    filters.type,
    filters.category,
    filters.subjectId,
  ].filter(Boolean).length;

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value === "all" ? undefined : (value as MaterialType),
    });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({
      ...filters,
      category: value === "all" ? undefined : (value as MaterialCategory),
    });
  };

  const handleSubjectChange = (value: string) => {
    onFiltersChange({
      ...filters,
      subjectId: value === "all" ? undefined : value,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="space-y-4">
      {/* Search and Main Filters Row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar materiales..."
            value={filters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Selects */}
        <div className="flex flex-wrap gap-2">
          {/* Type Filter */}
          <Select
            value={filters.type || "all"}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {Object.entries(MATERIAL_TYPE).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {TYPE_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select
            value={filters.category || "all"}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {Object.entries(MATERIAL_CATEGORY).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {CATEGORY_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Subject Filter */}
          {subjects.length > 0 && (
            <Select
              value={filters.subjectId || "all"}
              onValueChange={handleSubjectChange}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Materia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las materias</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Active Filters & Results Count */}
      {(hasActiveFilters || totalResults !== undefined) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Results count */}
            {totalResults !== undefined && (
              <span className="text-sm text-muted-foreground">
                {totalResults} {totalResults === 1 ? "resultado" : "resultados"}
              </span>
            )}

            {/* Active filter badges */}
            {activeFilterCount > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <div className="flex items-center gap-1">
                  <Filter className="size-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {activeFilterCount} {activeFilterCount === 1 ? "filtro" : "filtros"}
                  </span>
                </div>
              </>
            )}

            {/* Individual filter badges */}
            {filters.type && (
              <Badge variant="secondary" className="gap-1">
                {TYPE_LABELS[filters.type]}
                <button
                  onClick={() => onFiltersChange({ ...filters, type: undefined })}
                  className="ml-1 rounded-full hover:bg-muted"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                {CATEGORY_LABELS[filters.category]}
                <button
                  onClick={() => onFiltersChange({ ...filters, category: undefined })}
                  className="ml-1 rounded-full hover:bg-muted"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}

            {filters.subjectId && subjects.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                {subjects.find((s) => s.id === filters.subjectId)?.name}
                <button
                  onClick={() => onFiltersChange({ ...filters, subjectId: undefined })}
                  className="ml-1 rounded-full hover:bg-muted"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
          </div>

          {/* Clear all button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 px-2 text-xs"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
