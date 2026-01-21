import { CalendarClock } from "lucide-react";
import { PlaceholderPage } from "@/ui/components/shared";

export default function TutorAvailabilityPage() {
  return (
    <PlaceholderPage
      title="Configurar Disponibilidad"
      description="Próximamente podrás configurar tu disponibilidad semanal con un calendario drag-and-drop fácil de usar."
      icon={<CalendarClock className="size-10 text-primary" />}
      backLink="/tutor/dashboard"
    />
  );
}
