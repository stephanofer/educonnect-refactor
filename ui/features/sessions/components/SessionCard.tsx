import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Video,
  Clock,
  FileText,
  X,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Timer,
} from "lucide-react";
import { Card, CardContent } from "@/ui/components/shadcn/card";
import { Badge } from "@/ui/components/shadcn/badge";
import { Button } from "@/ui/components/shadcn/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { cn } from "@/ui/lib/utils";
import type { SessionListItem, SessionTab } from "../hooks";

interface SessionCardProps {
  session: SessionListItem;
  tab: SessionTab;
  viewAs: "student" | "tutor";
  onCancel?: (session: SessionListItem) => void;
  onViewMaterials?: (session: SessionListItem) => void;
  onJoinSession?: (session: SessionListItem) => void;
  index?: number;
}

// Format countdown helper
function formatCountdown(ms: number): string {
  if (ms <= 0) return "¡Ahora!";

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

// Format date helper
function formatSessionDate(date: Date): string {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) {
    return `Hoy, ${date.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (isTomorrow) {
    return `Mañana, ${date.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return date.toLocaleDateString("es", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Status badge component
function SessionStatusBadge({ status }: { status: SessionListItem["status"] }) {
  const config = {
    pending: { label: "Pendiente", variant: "outline" as const, icon: Clock },
    confirmed: { label: "Confirmada", variant: "default" as const, icon: CheckCircle2 },
    in_progress: { label: "En progreso", variant: "default" as const, icon: Video },
    completed: { label: "Completada", variant: "secondary" as const, icon: CheckCircle2 },
    cancelled: { label: "Cancelada", variant: "destructive" as const, icon: XCircle },
  };

  const { label, variant, icon: Icon } = config[status];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}

export function SessionCard({
  session,
  tab,
  viewAs,
  onCancel,
  onViewMaterials,
  onJoinSession,
  index = 0,
}: SessionCardProps) {
  const [countdown, setCountdown] = useState<number>(0);
  const [canJoin, setCanJoin] = useState(false);

  // Countdown timer for upcoming sessions
  useEffect(() => {
    if (tab !== "upcoming") return;

    const updateCountdown = () => {
      const now = Date.now();
      const sessionTime = session.scheduledAt.getTime();
      const diff = sessionTime - now;
      setCountdown(diff);

      // Can join 5 minutes before
      const fiveMinutes = 5 * 60 * 1000;
      setCanJoin(diff <= fiveMinutes && diff > -(session.durationMinutes * 60 * 1000));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [session.scheduledAt, session.durationMinutes, tab]);

  // Get person info based on view
  const personName = viewAs === "student" ? session.tutorName : session.studentName;
  const personAvatar = viewAs === "student" ? session.tutorAvatar : session.studentAvatar;
  const personLabel = viewAs === "student" ? "Tutor" : "Estudiante";

  // Check if session can be cancelled (only upcoming, pending/confirmed, and more than 2 hours before)
  const canCancel =
    tab === "upcoming" &&
    ["pending", "confirmed"].includes(session.status) &&
    countdown > 2 * 60 * 60 * 1000;

  // Is session about to start (less than 1 hour)
  const isUrgent = tab === "upcoming" && countdown > 0 && countdown <= 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden transition-shadow hover:shadow-md",
          isUrgent && "ring-2 ring-primary/50"
        )}
      >
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Left side: Person info and session details */}
            <div className="flex gap-3 flex-1 min-w-0">
              <Avatar className="size-12 shrink-0 border-2 border-background shadow-sm">
                <AvatarImage src={personAvatar || undefined} alt={personName} />
                <AvatarFallback className="text-sm font-semibold">
                  {personName?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground truncate">
                    {personName}
                  </h3>
                  <SessionStatusBadge status={session.status} />
                </div>

                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <User className="size-3.5" />
                  {personLabel}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {formatSessionDate(session.scheduledAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {session.durationMinutes} min
                  </span>
                </div>

                <Badge variant="secondary" className="mt-2">
                  {session.subjectName}
                </Badge>

                {session.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {session.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right side: Countdown and actions */}
            <div className="flex flex-col items-end gap-3 shrink-0">
              {/* Countdown for upcoming sessions */}
              {tab === "upcoming" && countdown > 0 && (
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                    isUrgent
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Timer className="size-4" />
                  <span className="font-mono font-semibold text-sm">
                    {formatCountdown(countdown)}
                  </span>
                </div>
              )}

              {/* Materials indicator */}
              {session.hasMaterials && (
                <button
                  onClick={() => onViewMaterials?.(session)}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <FileText className="size-3.5" />
                  {session.materialsCount} material{session.materialsCount > 1 ? "es" : ""}
                </button>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {tab === "upcoming" && canJoin && (
                  <Button size="sm" onClick={() => onJoinSession?.(session)}>
                    <Video className="size-4 mr-1.5" />
                    Entrar
                  </Button>
                )}

                {canCancel && onCancel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onCancel(session)}
                  >
                    <X className="size-4 mr-1" />
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
