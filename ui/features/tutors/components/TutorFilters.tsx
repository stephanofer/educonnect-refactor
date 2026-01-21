import { useState } from "react";
import { Search, X, SlidersHorizontal, Star } from "lucide-react";
import { Input } from "@/ui/components/shadcn/input";
import { Button } from "@/ui/components/shadcn/button";
import { Badge } from "@/ui/components/shadcn/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/components/shadcn/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/components/shadcn/popover";
import { Slider } from "@/ui/components/shadcn/slider";
import { Label } from "@/ui/components/shadcn/label";
import { Separator } from "@/ui/components/shadcn/separator";
import type { TutorFilters } from "../hooks";
import type { Subject } from "@/ui/types";

interface TutorFiltersProps {
  filters: TutorFilters;
  onFiltersChange: (filters: TutorFilters) => void;
  subjects?: Subject[];
  universities?: string[];
  totalResults?: number;
}

export function TutorFiltersComponent({
  filters,
  onFiltersChange,
  subjects = [],
  universities = [],
  totalResults,
}: TutorFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchInput || undefined });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    onFiltersChange({ ...filters, search: undefined });
  };

  const handleSubjectChange = (value: string) => {
    onFiltersChange({
      ...filters,
      subjectId: value === "all" ? undefined : value,
    });
  };

  const handleUniversityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      university: value === "all" ? undefined : value,
    });
  };

  const handleRatingChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      minRating: value[0] > 0 ? value[0] : undefined,
    });
  };

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      maxPrice: value[0] < 200 ? value[0] : undefined,
    });
  };

  const handleClearAllFilters = () => {
    setSearchInput("");
    onFiltersChange({});
  };

  // Count active filters
  const activeFiltersCount = [
    filters.search,
    filters.subjectId,
    filters.university,
    filters.minRating,
    filters.maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search and main filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre o especialidad..."
              className="pl-10 pr-10"
            />
            {searchInput && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
                onClick={handleClearSearch}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </form>

        {/* Subject filter */}
        <Select
          value={filters.subjectId || "all"}
          onValueChange={handleSubjectChange}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
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

        {/* Advanced filters */}
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="size-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 size-5 p-0 justify-center">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="font-medium">Filtros avanzados</div>
              <Separator />

              {/* University */}
              <div className="space-y-2">
                <Label>Universidad</Label>
                <Select
                  value={filters.university || "all"}
                  onValueChange={handleUniversityChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {universities.map((uni) => (
                      <SelectItem key={uni} value={uni}>
                        {uni}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Min rating */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Rating mínimo</Label>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="size-3.5 text-amber-500 fill-amber-500" />
                    <span>{filters.minRating || 0}</span>
                  </div>
                </div>
                <Slider
                  value={[filters.minRating || 0]}
                  onValueChange={handleRatingChange}
                  max={5}
                  step={0.5}
                />
              </div>

              {/* Max price */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Precio máximo</Label>
                  <span className="text-sm">
                    S/ {filters.maxPrice || 200}
                  </span>
                </div>
                <Slider
                  value={[filters.maxPrice || 200]}
                  onValueChange={handlePriceChange}
                  min={10}
                  max={200}
                  step={10}
                />
              </div>

              <Separator />

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  handleClearAllFilters();
                  setIsFiltersOpen(false);
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Results count and active filters */}
      <div className="flex flex-wrap items-center gap-2">
        {totalResults !== undefined && (
          <span className="text-sm text-muted-foreground">
            {totalResults} {totalResults === 1 ? "tutor encontrado" : "tutores encontrados"}
          </span>
        )}

        {/* Active filter badges */}
        {activeFiltersCount > 0 && (
          <>
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  Búsqueda: "{filters.search}"
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() => {
                      setSearchInput("");
                      onFiltersChange({ ...filters, search: undefined });
                    }}
                  />
                </Badge>
              )}
              {filters.subjectId && (
                <Badge variant="secondary" className="gap-1">
                  {subjects.find((s) => s.id === filters.subjectId)?.name}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() => onFiltersChange({ ...filters, subjectId: undefined })}
                  />
                </Badge>
              )}
              {filters.university && (
                <Badge variant="secondary" className="gap-1">
                  {filters.university}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() => onFiltersChange({ ...filters, university: undefined })}
                  />
                </Badge>
              )}
              {filters.minRating && (
                <Badge variant="secondary" className="gap-1">
                  ≥ {filters.minRating}★
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() => onFiltersChange({ ...filters, minRating: undefined })}
                  />
                </Badge>
              )}
              {filters.maxPrice && (
                <Badge variant="secondary" className="gap-1">
                  ≤ S/ {filters.maxPrice}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() => onFiltersChange({ ...filters, maxPrice: undefined })}
                  />
                </Badge>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
