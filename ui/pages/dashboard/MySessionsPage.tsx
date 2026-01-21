import { Calendar } from "lucide-react";
import { PlaceholderPage } from "@/ui/components/shared";

export default function MySessionsPage() {
  return (
    <PlaceholderPage
      title="Mis Sesiones"
      description="Próximamente podrás ver todas tus sesiones programadas, pasadas y canceladas. Gestiona tu agenda académica desde aquí."
      icon={<Calendar className="size-10 text-primary" />}
      backLink="/dashboard"
    />
  );
}
