import { useState } from "react";
import {
  Search,
  Filter,
  X,
  ChevronsUpDown,
  Check,
  FileText,
  Video,
  Link as LinkIcon,
  Image,
  File,
  Layers,
  BookOpen,
} from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/components/shadcn/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/components/shadcn/command";
import { MATERIAL_TYPE, MATERIAL_CATEGORY, type MaterialType, type MaterialCategory } from "@/ui/types";
import type { LibraryFilters } from "../hooks";
import { cn } from "@/ui/lib/utils";

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

const TYPE_ICONS: Record<MaterialType, typeof FileText> = {
  pdf: FileText,
  video: Video,
  link: LinkIcon,
  document: File,
  image: Image,
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
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);

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

  const handleCategoryChange = (value: MaterialCategory | undefined) => {
    onFiltersChange({ ...filters, category: value });
    setCategoryOpen(false);
  };

  const handleSubjectChange = (value: string | undefined) => {
    onFiltersChange({ ...filters, subjectId: value });
    setSubjectOpen(false);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="space-y-4">
      {/* Search bar - full width, prominent */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          placeholder="Buscar por título, descripción o materia..."
          value={filters.search || ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-12 rounded-xl pl-12 pr-4 text-[15px] bg-muted/40 border-border/40 focus-visible:bg-background focus-visible:border-primary/40 transition-colors"
        />
        {filters.search && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-muted text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        {/* Type Filter - Select */}
        <Select
          value={filters.type || "all"}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="h-9 w-full sm:w-[155px] rounded-lg text-[13px]">
            <div className="flex items-center gap-2">
              <Layers className="size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Tipo de recurso" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {Object.entries(MATERIAL_TYPE).map(([key, value]) => {
              const Icon = TYPE_ICONS[value];
              return (
                <SelectItem key={key} value={value}>
                  <div className="flex items-center gap-2">
                    <Icon className="size-3.5" />
                    {TYPE_LABELS[value]}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Category Filter - Combobox */}
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={categoryOpen}
              className="h-9 w-full sm:w-[185px] justify-between rounded-lg text-[13px] font-normal"
            >
              <div className="flex items-center gap-2 truncate">
                <Filter className="size-3.5 text-muted-foreground flex-shrink-0" />
                <span className="truncate">
                  {filters.category
                    ? CATEGORY_LABELS[filters.category]
                    : "Todas las categorías"}
                </span>
              </div>
              <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar categoría..." />
              <CommandList>
                <CommandEmpty>No se encontró categoría.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all-categories"
                    onSelect={() => handleCategoryChange(undefined)}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        !filters.category ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Todas las categorías
                  </CommandItem>
                  {Object.entries(MATERIAL_CATEGORY).map(([key, value]) => (
                    <CommandItem
                      key={key}
                      value={CATEGORY_LABELS[value]}
                      onSelect={() =>
                        handleCategoryChange(
                          filters.category === value ? undefined : value
                        )
                      }
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          filters.category === value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {CATEGORY_LABELS[value]}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Subject Filter - Combobox */}
        {subjects.length > 0 && (
          <Popover open={subjectOpen} onOpenChange={setSubjectOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={subjectOpen}
                className="h-9 w-full sm:w-[200px] justify-between rounded-lg text-[13px] font-normal"
              >
                <div className="flex items-center gap-2 truncate">
                  <BookOpen className="size-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">
                    {filters.subjectId
                      ? subjects.find((s) => s.id === filters.subjectId)?.name || "Materia"
                      : "Todas las materias"}
                  </span>
                </div>
                <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar materia..." />
                <CommandList>
                  <CommandEmpty>No se encontró materia.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all-subjects"
                      onSelect={() => handleSubjectChange(undefined)}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          !filters.subjectId ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Todas las materias
                    </CommandItem>
                    {subjects.map((subject) => (
                      <CommandItem
                        key={subject.id}
                        value={subject.name}
                        onSelect={() =>
                          handleSubjectChange(
                            filters.subjectId === subject.id ? undefined : subject.id
                          )
                        }
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            filters.subjectId === subject.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {subject.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Results count + Clear */}
        <div className="flex items-center gap-3">
          {totalResults !== undefined && (
            <span className="text-[13px] text-muted-foreground tabular-nums">
              <span className="font-semibold text-foreground">{totalResults}</span>{" "}
              {totalResults === 1 ? "recurso" : "recursos"}
            </span>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 gap-1.5 rounded-lg px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.type && (
            <Badge
              variant="secondary"
              className="gap-1.5 rounded-lg pl-2.5 pr-1.5 py-1 text-xs font-medium"
            >
              {(() => {
                const Icon = TYPE_ICONS[filters.type];
                return <Icon className="size-3" />;
              })()}
              {TYPE_LABELS[filters.type]}
              <button
                onClick={() => onFiltersChange({ ...filters, type: undefined })}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          {filters.category && (
            <Badge
              variant="secondary"
              className="gap-1.5 rounded-lg pl-2.5 pr-1.5 py-1 text-xs font-medium"
            >
              {CATEGORY_LABELS[filters.category]}
              <button
                onClick={() => onFiltersChange({ ...filters, category: undefined })}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}

          {filters.subjectId && subjects.length > 0 && (
            <Badge
              variant="secondary"
              className="gap-1.5 rounded-lg pl-2.5 pr-1.5 py-1 text-xs font-medium"
            >
              {subjects.find((s) => s.id === filters.subjectId)?.name}
              <button
                onClick={() => onFiltersChange({ ...filters, subjectId: undefined })}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
              >
                <X className="size-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
