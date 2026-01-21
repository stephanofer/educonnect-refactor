import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";
import { ArrowLeft, Loader2, Video, AlertTriangle } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { useAuthStore } from "@/ui/stores/auth.store";
import { getDailyRoomUrl } from "@/ui/lib/daily";

type CallState = "idle" | "joining" | "joined" | "error";

export default function VideoCallPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();

  const [callFrame, setCallFrame] = useState<DailyCall | null>(null);
  const [callState, setCallState] = useState<CallState>("idle");
  const [error, setError] = useState<string | null>(null);
  const isJoiningRef = useRef(false);

  // Get room URL
  const roomUrl = sessionId ? getDailyRoomUrl(sessionId) : null;

  // Get back URL based on role
  const getBackUrl = useCallback(() => {
    return profile?.role === "tutor"
      ? "/tutor/sesiones"
      : "/dashboard/mis-sesiones";
  }, [profile?.role]);

  // Handle manual cancel/back
  const handleCancel = useCallback(() => {
    if (callFrame) {
      callFrame.destroy();
      setCallFrame(null);
    }
    navigate(getBackUrl());
  }, [callFrame, navigate, getBackUrl]);

  // Join the call
  const joinCall = useCallback(async () => {
    if (!roomUrl || isJoiningRef.current) return;

    isJoiningRef.current = true;
    setCallState("joining");

    console.log("[VideoCall] Creating frame for:", roomUrl);

    const frame = DailyIframe.createFrame({
      showLeaveButton: true,
      showFullscreenButton: true,
      iframeStyle: {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        border: "none",
        zIndex: "9999",
      },
      theme: {
        colors: {
          accent: "#6366f1",
          accentText: "#ffffff",
          background: "#1a1a2e",
          backgroundAccent: "#16213e",
          baseText: "#ffffff",
          border: "#334155",
          mainAreaBg: "#0f0f23",
          mainAreaBgAccent: "#1a1a2e",
          mainAreaText: "#ffffff",
          supportiveText: "#94a3b8",
        },
      },
    });

    // Event: User joined successfully
    frame.on("joined-meeting", () => {
      console.log("[VideoCall] Event: joined-meeting ✓");
      setCallState("joined");
    });

    // Event: User left the meeting - redirect to dashboard
    frame.on("left-meeting", () => {
      console.log("[VideoCall] Event: left-meeting → redirecting");
      frame.destroy();
      setCallFrame(null);
      navigate(getBackUrl());
    });

    // Event: Meeting ended by host
    frame.on("meeting-session-state-updated", (event) => {
      console.log("[VideoCall] Meeting state:", event);
    });

    // Event: Connection errors (only log, don't break the flow)
    frame.on("error", (event) => {
      console.warn("[VideoCall] Daily error (non-fatal):", event);
      // Only set error state for fatal errors
      if (event?.errorMsg?.includes("room not found")) {
        frame.destroy();
        setError("La sala no existe o ha expirado.");
        setCallState("error");
      }
    });

    // Join the room
    try {
      console.log("[VideoCall] Joining room...");
      await frame.join({
        url: roomUrl,
        userName: profile?.full_name || "Participante",
      });
      console.log("[VideoCall] Join promise resolved");
      setCallFrame(frame);
    } catch (err) {
      console.error("[VideoCall] Join error:", err);
      frame.destroy();
      setError(
        err instanceof Error ? err.message : "No pudimos conectarte a la sala."
      );
      setCallState("error");
      isJoiningRef.current = false;
    }
  }, [roomUrl, profile?.full_name, navigate, getBackUrl]);

  // Auto-join on mount
  useEffect(() => {
    if (roomUrl && callState === "idle") {
      joinCall();
    }

    // Cleanup on unmount (e.g., browser back button)
    return () => {
      if (callFrame) {
        console.log("[VideoCall] Cleanup: destroying frame");
        callFrame.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomUrl]);

  // Render: No session ID
  if (!sessionId || !roomUrl) {
    return (
      <ErrorState
        title="Sesión no encontrada"
        description="No pudimos encontrar la sesión solicitada."
        onBack={() => navigate(getBackUrl())}
      />
    );
  }

  // Render: Fatal error
  if (callState === "error") {
    return (
      <ErrorState
        title="Error al conectar"
        description={error || "No pudimos conectarte a la sala."}
        onBack={() => navigate(getBackUrl())}
      />
    );
  }

  // Render: Loading/Joining (iframe will appear on top when ready)
  if (callState === "idle" || callState === "joining") {
    return (
      <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Video className="size-8 text-primary" />
            </div>
            <Loader2 className="absolute -bottom-1 -right-1 size-6 text-primary animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Conectando a la sala...</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Esto puede tomar unos segundos
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="mt-4"
          >
            <ArrowLeft className="size-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  // Render: Joined - Daily iframe is visible (z-index 9999), nothing to render
  return null;
}

// Error state component
interface ErrorStateProps {
  title: string;
  description: string;
  onBack: () => void;
}

function ErrorState({ title, description, onBack }: ErrorStateProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center max-w-md px-4">
        <div className="size-16 rounded-full bg-destructive/20 flex items-center justify-center">
          <AlertTriangle className="size-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="size-4 mr-2" />
          Volver a mis sesiones
        </Button>
      </div>
    </div>
  );
}
