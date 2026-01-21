import { Library } from "lucide-react";
import { PlaceholderPage } from "@/ui/components/shared";

export default function LibraryPage() {
  return (
    <PlaceholderPage
      title="Biblioteca Virtual"
      description="Próximamente tendrás acceso a nuestra biblioteca virtual con recursos académicos, guías de estudio y material exclusivo."
      icon={<Library className="size-10 text-primary" />}
      backLink="/dashboard"
    />
  );
}
