import { Users } from "lucide-react";
import { PlaceholderPage } from "@/ui/components/shared";

export default function TutorStudentsPage() {
  return (
    <PlaceholderPage
      title="Mis Estudiantes"
      description="Próximamente podrás ver la lista de todos tus estudiantes, su historial de sesiones y progreso."
      icon={<Users className="size-10 text-primary" />}
      backLink="/tutor/dashboard"
    />
  );
}
