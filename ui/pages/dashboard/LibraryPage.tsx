import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Library, RefreshCw } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { TooltipProvider } from "@/ui/components/shadcn/tooltip";
import { useAuthStore } from "@/ui/stores/auth.store";
import { useSubscriptionStore } from "@/ui/stores/subscription.store";
import {
  NoPlanAccess,
  MaterialCard,
  MaterialCardSkeleton,
  LibraryFiltersComponent,
  EmptyLibrary,
} from "@/ui/features/library";
import {
  useTrackDownload,
  type LibraryFilters,
  type LibraryMaterial,
} from "@/ui/features/library/hooks";
import {
  MOCK_LIBRARY_MATERIALS,
  MOCK_SUBJECTS,
} from "@/ui/features/library/mock-data";

export default function LibraryPage() {
  const { user } = useAuthStore();
  const {
    subscription,
    fetchSubscription,
    isLoading: subscriptionLoading,
  } = useSubscriptionStore();

  const [filters, setFilters] = useState<LibraryFilters>({});

  // Fetch subscription on mount
  useEffect(() => {
    if (user?.id) {
      fetchSubscription(user.id);
    }
  }, [user?.id, fetchSubscription]);

  const trackDownload = useTrackDownload();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if user has active subscription
  const hasActivePlan = subscription?.status === "active";

  // Use mock subjects for filter dropdowns
  const subjects = MOCK_SUBJECTS;

  // Client-side filtering for mock data
  const materials = useMemo(() => {
    let result: LibraryMaterial[] = MOCK_LIBRARY_MATERIALS;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.subject?.name.toLowerCase().includes(q)
      );
    }
    if (filters.type) {
      result = result.filter((m) => m.type === filters.type);
    }
    if (filters.category) {
      result = result.filter((m) => m.category === filters.category);
    }
    if (filters.subjectId) {
      result = result.filter((m) => m.subject_id === filters.subjectId);
    }

    return result;
  }, [filters]);

  // Handle download tracking
  const handleDownload = (material: LibraryMaterial) => {
    if (!material.id.startsWith("mock-")) {
      trackDownload.mutate(material.id);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({});
  };

  // Check if there are active filters
  const hasActiveFilters = Boolean(
    filters.search || filters.type || filters.category || filters.subjectId
  );

  // Show loading state while checking subscription
  if (subscriptionLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5">
            <Library className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Biblioteca Virtual
            </h1>
            <p className="text-muted-foreground">Verificando acceso...</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <MaterialCardSkeleton count={8} />
        </div>
      </div>
    );
  }

  // Show paywall if no active plan
  if (!hasActivePlan) {
    return <NoPlanAccess />;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5">
              <Library className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Biblioteca Virtual
              </h1>
              <p className="text-sm text-muted-foreground">
                Material de estudio exclusivo para suscriptores
              </p>
            </div>
          </div>

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              setIsRefreshing(true);
              await new Promise((r) => setTimeout(r, 800));
              setIsRefreshing(false);
            }}
            disabled={isRefreshing}
            className="gap-2 self-start sm:self-auto rounded-lg"
          >
            <RefreshCw
              className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <LibraryFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            subjects={subjects}
            totalResults={materials?.length}
          />
        </motion.div>

        {/* Materials Grid */}
        {materials.length === 0 && !hasActiveFilters ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <MaterialCardSkeleton count={8} />
          </div>
        ) : materials && materials.length > 0 ? (
          <motion.div
            key={JSON.stringify(filters)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {materials.map((material, index) => (
              <MaterialCard
                key={material.id}
                material={material}
                onDownload={handleDownload}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <EmptyLibrary
            hasFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
