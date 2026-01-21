import { BookOpen } from "lucide-react";
import { PlaceholderPage } from "@/ui/components/shared";

export default function MaterialsPage() {
  return (
    <PlaceholderPage
      title="Materiales de Estudio"
      description="Próximamente podrás acceder a los materiales compartidos por tus tutores. PDFs, documentos y recursos para tu estudio."
      icon={<BookOpen className="size-10 text-primary" />}
      backLink="/dashboard"
    />
  );
}
