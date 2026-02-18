import { useState, useEffect } from "react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Search, X, SlidersHorizontal, Star, Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/components/shadcn/command";
import { Calendar } from "@/ui/components/shadcn/calendar";
import { Slider } from "@/ui/components/shadcn/slider";
import { Label } from "@/ui/components/shadcn/label";
import { Separator } from "@/ui/components/shadcn/separator";
import { cn } from "@/ui/lib/utils";
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
  const [subjectComboOpen, setSubjectComboOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Debounced instant search
  useEffect(() => {
    const timeout = setTimeout(() => {
      const newSearch = searchInput.trim() || undefined;
      if (newSearch !== filters.search) {
        onFiltersChange({ ...filters, search: newSearch });
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleClearSearch = () => {
    setSearchInput("");
    onFiltersChange({ ...filters, search: undefined });
  };

  const handleSubjectSelect = (subjectId: string) => {
    onFiltersChange({
      ...filters,
      subjectId: filters.subjectId === subjectId ? undefined : subjectId,
    });
    setSubjectComboOpen(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      availableDate: date ? format(date, "yyyy-MM-dd") : undefined,
    });
    setDatePickerOpen(false);
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
    filters.availableDate,
  ].filter(Boolean).length;

  const selectedSubject = subjects.find((s) => s.id === filters.subjectId);
  const selectedDate = filters.availableDate
    ? new Date(filters.availableDate + "T00:00:00")
    : undefined;

  return (
    <div className="space-y-4">
      {/* Search and main filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Instant search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nombre, especialidad o universidad..."
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

        {/* Subject combobox */}
        <Popover open={subjectComboOpen} onOpenChange={setSubjectComboOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={subjectComboOpen}
              className="w-full sm:w-[220px] justify-between font-normal"
            >
              {selectedSubject ? selectedSubject.name : "Materia..."}
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar materia..." />
              <CommandList>
                <CommandEmpty>No se encontraron materias.</CommandEmpty>
                <CommandGroup>
                  {subjects.map((subject) => (
                    <CommandItem
                      key={subject.id}
                      value={subject.name}
                      onSelect={() => handleSubjectSelect(subject.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          filters.subjectId === subject.id ? "opacity-100" : "opacity-0"
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

        {/* Date availability picker */}
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[200px] justify-start gap-2 font-normal",
                selectedDate && "text-foreground"
              )}
            >
              <CalendarIcon className="size-4 shrink-0" />
              {selectedDate
                ? format(selectedDate, "d MMM yyyy", { locale: es })
                : "Disponibilidad..."}
              {selectedDate && (
                <X
                  className="size-3.5 ml-auto shrink-0 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFiltersChange({ ...filters, availableDate: undefined });
                  }}
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 pb-1">
              <p className="text-sm font-medium">¿Cuándo necesitas la sesión?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Solo se mostrarán tutores disponibles ese día
              </p>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) =>
                isBefore(date, startOfDay(new Date())) ||
                isBefore(addDays(new Date(), 30), date)
              }
            />
          </PopoverContent>
        </Popover>

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
                  Búsqueda: &quot;{filters.search}&quot;
                  <X
                    className="size-3 cursor-pointer"
                    onClick={handleClearSearch}
                  />
                </Badge>
              )}
              {filters.subjectId && (
                <Badge variant="secondary" className="gap-1">
                  {selectedSubject?.name}
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
              {filters.availableDate && selectedDate && (
                <Badge variant="secondary" className="gap-1">
                  {format(selectedDate, "d MMM yyyy", { locale: es })}
                  <X
                    className="size-3 cursor-pointer"
                    onClick={() => onFiltersChange({ ...filters, availableDate: undefined })}
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
