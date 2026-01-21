import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Check, CheckCheck, X, Calendar, AlertCircle, Star, Clock } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/ui/components/shadcn/dropdown-menu";
import { ScrollArea } from "@/ui/components/shadcn/scroll-area";
import { Badge } from "@/ui/components/shadcn/badge";
import { cn } from "@/ui/lib/utils";

export interface Notification {
  id: string;
  type: "session_confirmed" | "session_reminder" | "session_cancelled" | "review" | "general";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// Mock notifications for demo
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "session_reminder",
    title: "Sesión en 15 minutos",
    message: "Tu sesión con Carlos García está por comenzar. ¡Prepárate!",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    actionUrl: "/dashboard/mis-sesiones",
  },
  {
    id: "2",
    type: "session_confirmed",
    title: "Sesión confirmada",
    message: "Tu sesión de Cálculo para mañana a las 3:00 PM ha sido confirmada.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    actionUrl: "/dashboard/mis-sesiones",
  },
  {
    id: "3",
    type: "review",
    title: "Deja tu reseña",
    message: "¿Cómo fue tu sesión con María López? Comparte tu experiencia.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: "4",
    type: "session_cancelled",
    title: "Sesión reprogramada",
    message: "Tu tutor Juan Pérez ha reprogramado la sesión para el viernes.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
  },
];

const notificationIcons: Record<Notification["type"], typeof Bell> = {
  session_confirmed: Calendar,
  session_reminder: Clock,
  session_cancelled: AlertCircle,
  review: Star,
  general: Bell,
};

const notificationColors: Record<Notification["type"], string> = {
  session_confirmed: "bg-success/10 text-success",
  session_reminder: "bg-primary/10 text-primary",
  session_cancelled: "bg-destructive/10 text-destructive",
  review: "bg-yellow-100 text-yellow-600",
  general: "bg-muted text-muted-foreground",
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  return `Hace ${diffDays} días`;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 size-5 bg-destructive text-white text-xs font-medium rounded-full flex items-center justify-center"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 md:w-96 p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">Notificaciones</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} nuevas
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllAsRead}
            >
              <CheckCheck className="size-4 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Bell className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                No tienes notificaciones
              </p>
            </div>
          ) : (
            <div className="divide-y">
              <AnimatePresence mode="popLayout">
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type];
                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      className={cn(
                        "relative p-4 hover:bg-muted/50 transition-colors group",
                        !notification.read && "bg-primary/5"
                      )}
                    >
                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 size-2 rounded-full bg-primary" />
                      )}
                      
                      <div className="flex gap-3 pl-3">
                        <div
                          className={cn(
                            "size-10 rounded-full flex items-center justify-center shrink-0",
                            notificationColors[notification.type]
                          )}
                        >
                          <Icon className="size-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {notification.title}
                            </p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="size-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeNotification(notification.id)}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Button variant="outline" className="w-full" size="sm" asChild>
              <a href="/dashboard/notificaciones">Ver todas las notificaciones</a>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
