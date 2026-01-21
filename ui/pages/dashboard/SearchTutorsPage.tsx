import { Search } from "lucide-react";
import { PlaceholderPage } from "@/ui/components/shared";

export default function SearchTutorsPage() {
  return (
    <PlaceholderPage
      title="Buscar Tutores"
      description="Próximamente podrás buscar tutores por materia, universidad, disponibilidad y más. Encuentra al tutor perfecto para ti."
      icon={<Search className="size-10 text-primary" />}
      backLink="/dashboard"
    />
  );
}
