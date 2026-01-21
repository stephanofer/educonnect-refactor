import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/ui/components/shadcn/alert-dialog";
import { Textarea } from "@/ui/components/shadcn/textarea";
import { Label } from "@/ui/components/shadcn/label";
import type { SessionListItem } from "../hooks";

interface CancelSessionModalProps {
  session: SessionListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (sessionId: string, reason?: string) => void;
  isLoading?: boolean;
}

export function CancelSessionModal({
  session,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: CancelSessionModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!session) return;
    onConfirm(session.id, reason.trim() || undefined);
    setReason("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setReason("");
    }
    onOpenChange(newOpen);
  };

  const personName = session?.tutorName || session?.studentName || "el participante";

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>¿Cancelar sesión?</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                Esta acción no se puede deshacer. Se notificará a {personName} sobre la cancelación.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        {session && (
          <div className="mt-4 rounded-lg border bg-muted/50 p-3">
            <p className="font-medium">{session.subjectName}</p>
            <p className="text-sm text-muted-foreground">
              {session.scheduledAt.toLocaleDateString("es", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        <div className="mt-4 space-y-2">
          <Label htmlFor="cancel-reason">Motivo (opcional)</Label>
          <Textarea
            id="cancel-reason"
            placeholder="Cuéntanos por qué cancelas la sesión..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isLoading}>Volver</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Cancelando..." : "Sí, cancelar sesión"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
