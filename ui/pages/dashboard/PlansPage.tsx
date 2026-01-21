import { CreditCard } from "lucide-react";
import { PlaceholderPage } from "@/ui/components/shared";

export default function PlansPage() {
  return (
    <PlaceholderPage
      title="Mis Planes"
      description="Próximamente podrás gestionar tu suscripción, ver tus planes activos, comprar sesiones adicionales y descargar facturas."
      icon={<CreditCard className="size-10 text-primary" />}
      backLink="/dashboard"
    />
  );
}
