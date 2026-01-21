import { useState } from "react";
import { useNavigate } from "react-router";
import { Calendar, Upload } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/ui/components/shadcn/tabs";
import { useAuthStore } from "@/ui/stores/auth.store";
import {
  useTutorSessions,
  useCancelSession,
  SESSION_TAB,
  type SessionTab,
  type SessionListItem,
} from "@/ui/features/sessions";
import {
  SessionCard,
  SessionCardSkeleton,
  EmptySessions,
  CancelSessionModal,
} from "@/ui/features/sessions";
import { UploadMaterialModal } from "@/ui/features/materials";

export default function TutorSessionsPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SessionTab>(SESSION_TAB.UPCOMING);
  const [cancelSession, setCancelSession] = useState<SessionListItem | null>(null);
  const [uploadSession, setUploadSession] = useState<SessionListItem | null>(null);

  const { data: sessions, isLoading } = useTutorSessions(profile?.id, activeTab);
  const cancelMutation = useCancelSession();

  const handleTabChange = (value: string) => {
    setActiveTab(value as SessionTab);
  };

  const handleCancelClick = (session: SessionListItem) => {
    setCancelSession(session);
  };

  const handleConfirmCancel = (sessionId: string, reason?: string) => {
    if (!profile?.id) return;

    cancelMutation.mutate(
      { sessionId, userId: profile.id, reason },
      {
        onSuccess: () => {
          toast.success("Sesión cancelada", {
            description: "La sesión ha sido cancelada y el estudiante fue notificado.",
          });
          setCancelSession(null);
        },
        onError: (error) => {
          toast.error("Error al cancelar", {
            description: error.message || "No pudimos cancelar la sesión. Intenta de nuevo.",
          });
        },
      }
    );
  };

  const handleViewMaterials = (session: SessionListItem) => {
    setUploadSession(session);
  };

  const handleJoinSession = (session: SessionListItem) => {
    navigate(`/sala/${session.id}`);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mis Sesiones</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona las sesiones con tus estudiantes
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value={SESSION_TAB.UPCOMING} className="flex-1 sm:flex-none">
            Próximas
          </TabsTrigger>
          <TabsTrigger value={SESSION_TAB.COMPLETED} className="flex-1 sm:flex-none">
            Completadas
          </TabsTrigger>
          <TabsTrigger value={SESSION_TAB.CANCELLED} className="flex-1 sm:flex-none">
            Canceladas
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value={SESSION_TAB.UPCOMING}>
            <SessionList
              sessions={sessions}
              isLoading={isLoading}
              tab={SESSION_TAB.UPCOMING}
              onCancel={handleCancelClick}
              onViewMaterials={handleViewMaterials}
              onJoinSession={handleJoinSession}
            />
          </TabsContent>

          <TabsContent value={SESSION_TAB.COMPLETED}>
            {/* Tip for uploading materials */}
            {sessions && sessions.length > 0 && (
              <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-start gap-2">
                  <Upload className="size-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary">
                      ¿Tienes material para compartir?
                    </p>
                    <p className="text-muted-foreground">
                      Haz clic en "materiales" en cada sesión para subir recursos de estudio.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <SessionList
              sessions={sessions}
              isLoading={isLoading}
              tab={SESSION_TAB.COMPLETED}
              onViewMaterials={handleViewMaterials}
            />
          </TabsContent>

          <TabsContent value={SESSION_TAB.CANCELLED}>
            <SessionList
              sessions={sessions}
              isLoading={isLoading}
              tab={SESSION_TAB.CANCELLED}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Cancel Modal */}
      <CancelSessionModal
        session={cancelSession}
        open={!!cancelSession}
        onOpenChange={(open) => !open && setCancelSession(null)}
        onConfirm={handleConfirmCancel}
        isLoading={cancelMutation.isPending}
      />

      {/* Upload Material Modal */}
      {uploadSession && profile?.id && (
        <UploadMaterialModal
          open={!!uploadSession}
          onOpenChange={(open) => !open && setUploadSession(null)}
          sessionId={uploadSession.id}
          tutorId={profile.id}
          sessionInfo={{
            subjectName: uploadSession.subjectName,
            studentName: uploadSession.studentName || "Estudiante",
            date: uploadSession.scheduledAt,
          }}
        />
      )}
    </div>
  );
}

// Helper component for session list
interface SessionListProps {
  sessions: SessionListItem[] | undefined;
  isLoading: boolean;
  tab: SessionTab;
  onCancel?: (session: SessionListItem) => void;
  onViewMaterials?: (session: SessionListItem) => void;
  onJoinSession?: (session: SessionListItem) => void;
}

function SessionList({
  sessions,
  isLoading,
  tab,
  onCancel,
  onViewMaterials,
  onJoinSession,
}: SessionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SessionCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return <EmptySessions tab={tab} viewAs="tutor" />;
  }

  return (
    <div className="space-y-4">
      {sessions.map((session, index) => (
        <SessionCard
          key={session.id}
          session={session}
          tab={tab}
          viewAs="tutor"
          onCancel={onCancel}
          onViewMaterials={onViewMaterials}
          onJoinSession={onJoinSession}
          index={index}
        />
      ))}
    </div>
  );
}
