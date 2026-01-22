import { useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, ChevronDown, Calendar, User } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { Card, CardContent, CardHeader } from "@/ui/components/shadcn/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/ui/components/shadcn/collapsible";
import { Button } from "@/ui/components/shadcn/button";
import { Skeleton } from "@/ui/components/shadcn/skeleton";
import { cn } from "@/ui/lib/utils";
import { useAuthStore } from "@/ui/stores/auth.store";
import {
  useStudentMaterials,
  useIncrementDownload,
  type StudentSessionWithMaterials,
  type SessionMaterial,
} from "@/ui/features/materials";
import { MaterialCard, MaterialCardSkeleton, DemoSessionMaterials } from "@/ui/features/materials";

export default function MaterialsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuthStore();

  const { data: sessionsWithMaterials, isLoading } = useStudentMaterials(profile?.id);
  const incrementDownload = useIncrementDownload();

  // Get session ID from URL if present (from MySessionsPage link)
  const highlightedSessionId = searchParams.get("session");

  // Track which sessions are expanded
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(() => {
    // If there's a highlighted session, start with it expanded
    return highlightedSessionId ? new Set([highlightedSessionId]) : new Set();
  });

  const toggleSession = (sessionId: string) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  const handleDownload = (material: SessionMaterial) => {
    incrementDownload.mutate(material.id, {
      onError: () => {
        // Silent fail - don't block the download
      },
    });
  };

  const handleSearchTutors = () => {
    navigate("/dashboard/buscar-tutores");
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Materiales de Estudio</h1>
            <p className="text-sm text-muted-foreground">
              Recursos compartidos por tus tutores
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <MaterialsLoading />
      ) : (
        <>
          {/* Demo session - always visible */}
          <DemoSessionMaterials onSearchTutors={handleSearchTutors} />

          {/* Real sessions */}
          {sessionsWithMaterials && sessionsWithMaterials.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Tus sesiones</h2>
              {sessionsWithMaterials.map((session, index) => (
                <SessionMaterialsCard
                  key={session.sessionId}
                  session={session}
                  index={index}
                  isExpanded={expandedSessions.has(session.sessionId)}
                  isHighlighted={session.sessionId === highlightedSessionId}
                  onToggle={() => toggleSession(session.sessionId)}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

// Session card with collapsible materials
interface SessionMaterialsCardProps {
  session: StudentSessionWithMaterials;
  index: number;
  isExpanded: boolean;
  isHighlighted: boolean;
  onToggle: () => void;
  onDownload: (material: SessionMaterial) => void;
}

function SessionMaterialsCard({
  session,
  index,
  isExpanded,
  isHighlighted,
  onToggle,
  onDownload,
}: SessionMaterialsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={cn(
          "overflow-hidden transition-shadow",
          isHighlighted && "ring-2 ring-primary"
        )}
      >
        <Collapsible open={isExpanded} onOpenChange={onToggle}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 border">
                    <AvatarImage
                      src={session.tutorAvatar || undefined}
                      alt={session.tutorName}
                    />
                    <AvatarFallback>
                      {session.tutorName?.charAt(0) || "T"}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{session.subjectName}</h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {session.materials.length} material{session.materials.length > 1 ? "es" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <User className="size-3.5" />
                        {session.tutorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {session.sessionDate.toLocaleDateString("es", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <Button variant="ghost" size="icon">
                  <ChevronDown
                    className={cn(
                      "size-5 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </Button>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <AnimatePresence>
            {isExpanded && (
              <CollapsibleContent forceMount asChild>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className="pt-0 pb-4">
                    <div className="border-t pt-4 space-y-3">
                      {session.materials.map((material, materialIndex) => (
                        <MaterialCard
                          key={material.id}
                          material={material}
                          onDownload={onDownload}
                          index={materialIndex}
                        />
                      ))}
                    </div>
                  </CardContent>
                </motion.div>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </Collapsible>
      </Card>
    </motion.div>
  );
}

// Loading skeleton
function MaterialsLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="border-t pt-4 space-y-3">
              <MaterialCardSkeleton />
              <MaterialCardSkeleton />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
