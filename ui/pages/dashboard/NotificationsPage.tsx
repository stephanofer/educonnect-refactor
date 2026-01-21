import { Bell } from "lucide-react";
import { PlaceholderPage } from "@/ui/components/shared";

export default function NotificationsPage() {
  return (
    <PlaceholderPage
      title="Centro de Notificaciones"
      description="Próximamente tendrás un centro completo de notificaciones donde podrás ver todo tu historial de alertas y recordatorios."
      icon={<Bell className="size-10 text-primary" />}
      backLink="/dashboard"
    />
  );
}
