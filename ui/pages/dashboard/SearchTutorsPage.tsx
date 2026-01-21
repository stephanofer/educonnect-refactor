import { useState } from "react";
import { motion } from "motion/react";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { useAuthStore } from "@/ui/stores/auth.store";
import {
  TutorCard,
  TutorCardSkeleton,
  TutorFiltersComponent,
  TutorProfileDialog,
  EmptyTutors,
  useTutors,
  useToggleFavorite,
  useSubjects,
  useUniversities,
  type TutorFilters,
  type TutorListItem,
  type TutorDetail,
} from "@/ui/features/tutors";
import { BookingModal } from "@/ui/features/booking";
import { toast } from "sonner";

export default function SearchTutorsPage() {
  const { user } = useAuthStore();
  const [filters, setFilters] = useState<TutorFilters>({});
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [bookingTutor, setBookingTutor] = useState<TutorListItem | TutorDetail | null>(null);

  // Queries
  const {
    data: tutors,
    isLoading,
    refetch,
    isRefetching,
  } = useTutors(filters, user?.id);
  const { data: subjects } = useSubjects();
  const { data: universities } = useUniversities();
  const toggleFavorite = useToggleFavorite();

  // Handlers
  const handleSelectTutor = (tutor: TutorListItem) => {
    setSelectedTutorId(tutor.id);
  };

  const handleCloseTutorProfile = () => {
    setSelectedTutorId(null);
  };

  const handleBookFromProfile = (tutor: TutorDetail) => {
    setSelectedTutorId(null);
    setBookingTutor(tutor);
  };

  const handleToggleFavorite = (tutorId: string, isFavorite: boolean) => {
    if (!user?.id) {
      toast.error("Inicia sesión para guardar favoritos");
      return;
    }

    toggleFavorite.mutate(
      { tutorId, studentId: user.id, isFavorite },
      {
        onSuccess: () => {
          toast.success(
            isFavorite ? "Eliminado de favoritos" : "Agregado a favoritos"
          );
        },
        onError: () => {
          toast.error("Error al actualizar favoritos");
        },
      }
    );
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleBookingSuccess = () => {
    setBookingTutor(null);
    refetch();
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.subjectId ||
      filters.university ||
      filters.minRating ||
      filters.maxPrice
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Search className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Buscar Tutores</h1>
              <p className="text-muted-foreground">
                Encuentra al tutor perfecto para ti
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`size-4 ${isRefetching ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
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
                onSelect={handleSelectTutor}
                onToggleFavorite={handleToggleFavorite}
                index={index}
                isTogglingFavorite={toggleFavorite.isPending}
              />
            ))}
          </motion.div>
        ) : (
          <EmptyTutors hasFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
        )}
      </div>

      {/* Tutor Profile Dialog */}
      <TutorProfileDialog
        tutorId={selectedTutorId}
        userId={user?.id}
        isOpen={!!selectedTutorId}
        onClose={handleCloseTutorProfile}
        onBook={handleBookFromProfile}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Booking Modal */}
      <BookingModal
        tutor={bookingTutor}
        studentId={user?.id || ""}
        isOpen={!!bookingTutor}
        onClose={() => setBookingTutor(null)}
        onSuccess={handleBookingSuccess}
      />
    </>
  );
}
