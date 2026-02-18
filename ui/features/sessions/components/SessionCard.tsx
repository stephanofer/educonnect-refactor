import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  BookOpen,
  ArrowRight,
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

// Status config with colors
const STATUS_CONFIG = {
  pending: {
    label: "Pendiente",
    icon: Clock,
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotColor: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmada",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotColor: "bg-emerald-500",
  },
  in_progress: {
    label: "En progreso",
    icon: Video,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotColor: "bg-blue-500",
  },
  completed: {
    label: "Completada",
    icon: CheckCircle2,
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    dotColor: "bg-slate-500",
  },
  cancelled: {
    label: "Cancelada",
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    dotColor: "bg-red-500",
  },
} as const;

// Status badge component
function SessionStatusBadge({ status }: { status: SessionListItem["status"] }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.className
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dotColor)} />
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}

// Accent bar gradient based on status
function getAccentGradient(status: SessionListItem["status"], isUrgent: boolean) {
  if (isUrgent) return "from-primary via-primary/80 to-primary/50";
  switch (status) {
    case "confirmed":
      return "from-emerald-500 via-emerald-400 to-teal-400";
    case "in_progress":
      return "from-blue-500 via-blue-400 to-cyan-400";
    case "pending":
      return "from-amber-500 via-amber-400 to-orange-400";
    case "completed":
      return "from-slate-400 via-slate-300 to-slate-200";
    case "cancelled":
      return "from-red-400 via-red-300 to-red-200";
    default:
      return "from-primary via-primary/80 to-primary/50";
  }
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

  // Session is live now (countdown <= 0 but within duration)
  const isLive =
    tab === "upcoming" &&
    countdown <= 0 &&
    countdown > -(session.durationMinutes * 60 * 1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      whileHover={{ y: -2 }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden border transition-all duration-300",
          "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20",
          isUrgent && "ring-2 ring-primary/40 border-primary/30",
          isLive && "ring-2 ring-emerald-500/50 border-emerald-500/30"
        )}
      >
        {/* Gradient accent bar */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-1 rounded-l-lg bg-gradient-to-b transition-all duration-300",
            "group-hover:w-1.5",
            getAccentGradient(session.status, isUrgent || isLive)
          )}
        />

        {/* Subtle hover glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/[0.02] group-hover:via-primary/[0.01] group-hover:to-transparent transition-all duration-500 pointer-events-none" />

        <CardContent className="p-4 pl-5 sm:p-5 sm:pl-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Left side: Person info and session details */}
            <div className="flex gap-3.5 flex-1 min-w-0">
              {/* Avatar with online ring */}
              <div className="relative shrink-0">
                <Avatar className={cn(
                  "size-14 border-2 shadow-md transition-all duration-300",
                  "group-hover:shadow-lg group-hover:scale-105",
                  isLive
                    ? "border-emerald-500/50"
                    : isUrgent
                      ? "border-primary/40"
                      : "border-background"
                )}>
                  <AvatarImage src={personAvatar || undefined} alt={personName} />
                  <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                    {personName?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0">
                {/* Name + Status row */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-semibold text-foreground text-base truncate">
                    {personName}
                  </h3>
                  <SessionStatusBadge status={session.status} />
                </div>

                {/* Role label */}
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <User className="size-3.5" />
                  {personLabel}
                </p>

                {/* Date/time info chips */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-xs font-medium text-muted-foreground">
                    <Calendar className="size-3" />
                    {formatSessionDate(session.scheduledAt)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-xs font-medium text-muted-foreground">
                    <Clock className="size-3" />
                    {session.durationMinutes} min
                  </span>
                </div>

                {/* Subject badge */}
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="gap-1 font-medium">
                    <BookOpen className="size-3" />
                    {session.subjectName}
                  </Badge>

                  {/* Materials indicator inline */}
                  {session.hasMaterials && (
                    <button
                      onClick={() => onViewMaterials?.(session)}
                      className="inline-flex items-center gap-1 rounded-md bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                    >
                      <FileText className="size-3" />
                      {session.materialsCount} material{session.materialsCount > 1 ? "es" : ""}
                    </button>
                  )}
                </div>

                {/* Description */}
                {session.description && (
                  <p className="text-sm text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed">
                    {session.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right side: Countdown and actions */}
            <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
              {/* Countdown for upcoming sessions */}
              <AnimatePresence mode="popLayout">
                {tab === "upcoming" && countdown > 0 && (
                  <motion.div
                    key="countdown"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3.5 py-2 backdrop-blur-sm",
                      isUrgent
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-muted/80 text-muted-foreground border border-transparent"
                    )}
                  >
                    <Timer className={cn(
                      "size-4",
                      isUrgent && "animate-pulse"
                    )} />
                    <span className="font-mono font-bold text-sm tracking-tight">
                      {formatCountdown(countdown)}
                    </span>
                  </motion.div>
                )}

                {/* Live indicator */}
                {isLive && (
                  <motion.div
                    key="live"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2"
                  >
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                      EN VIVO
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {tab === "upcoming" && canJoin && (
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <Button
                      size="sm"
                      onClick={() => onJoinSession?.(session)}
                      className={cn(
                        "relative gap-2 rounded-lg font-semibold shadow-md transition-all duration-300",
                        "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
                        "hover:shadow-lg hover:shadow-primary/25",
                        isLive && "from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 hover:shadow-emerald-500/25"
                      )}
                    >
                      <Video className="size-4" />
                      {isLive ? "Unirse ahora" : "Entrar a la sala"}
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </motion.div>
                )}

                {canCancel && onCancel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
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
