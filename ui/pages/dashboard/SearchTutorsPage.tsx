import { useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import {
  TutorCard,
  TutorCardSkeleton,
  TutorFiltersComponent,
  EmptyTutors,
  useMockTutors,
  useToggleFavorite,
  useSubjects,
  useUniversities,
  type TutorFilters,
} from "@/ui/features/tutors";
import { toast } from "sonner";

export default function SearchTutorsPage() {
  const [filters, setFilters] = useState<TutorFilters>({});

  const { data: tutors, isLoading } = useMockTutors(filters);
  const { data: subjects } = useSubjects();
  const { data: universities } = useUniversities();
  const toggleFavorite = useToggleFavorite();

  const handleToggleFavorite = (tutorId: string, isFavorite: boolean) => {
    toggleFavorite.mutate(
      { tutorId, isFavorite },
      {
        onSuccess: () => {
          toast.success(
            isFavorite ? "Eliminado de favoritos" : "Agregado a favoritos"
          );
        },
      }
    );
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.subjectId ||
      filters.university ||
      filters.minRating ||
      filters.availableDate
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="rounded-lg bg-primary/10 p-2">
          <Search className="size-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buscar Tutores</h1>
          <p className="text-muted-foreground">
            Encuentra al tutor perfecto para ti
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <TutorFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          subjects={subjects}
          universities={universities}
          totalResults={tutors?.length}
        />
      </motion.div>

      {/* Tutors Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TutorCardSkeleton count={6} />
        </div>
      ) : tutors && tutors.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {tutors.map((tutor, index) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              onToggleFavorite={handleToggleFavorite}
              index={index}
              isTogglingFavorite={toggleFavorite.isPending}
              availableDate={filters.availableDate}
            />
          ))}
        </motion.div>
      ) : (
        <EmptyTutors hasFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
      )}
    </div>
  );
}
