import { DollarSign } from "lucide-react";
import { PlaceholderPage } from "@/ui/components/shared";

export default function TutorEarningsPage() {
  return (
    <PlaceholderPage
      title="Ganancias"
      description="Próximamente podrás ver tus estadísticas de ingresos, historial de pagos y solicitar retiros."
      icon={<DollarSign className="size-10 text-primary" />}
      backLink="/tutor/dashboard"
    />
  );
}
