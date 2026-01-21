import { Calendar } from "lucide-react";
import { PlaceholderPage } from "@/ui/components/shared";

export default function TutorSessionsPage() {
  return (
    <PlaceholderPage
      title="Mis Sesiones"
      description="Próximamente podrás ver todas tus sesiones programadas, pasadas y gestionar tu agenda de tutorías."
      icon={<Calendar className="size-10 text-primary" />}
      backLink="/tutor/dashboard"
    />
  );
}
