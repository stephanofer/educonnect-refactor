import { Star } from "lucide-react";
import { PlaceholderPage } from "@/ui/components/shared";

export default function TutorReviewsPage() {
  return (
    <PlaceholderPage
      title="Reseñas"
      description="Próximamente podrás ver todas las reseñas que te han dejado tus estudiantes y responder a ellas."
      icon={<Star className="size-10 text-primary" />}
      backLink="/tutor/dashboard"
    />
  );
}
