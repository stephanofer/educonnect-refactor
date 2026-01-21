import { motion } from "motion/react";
import { Construction } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { Link } from "react-router";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  backLink?: string;
}

export function PlaceholderPage({
  title,
  description,
  icon,
  backLink = "/dashboard",
}: PlaceholderPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center"
    >
      <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-6">
        {icon || <Construction className="size-10 text-muted-foreground" />}
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      <div className="flex gap-3">
        <Link to={backLink}>
          <Button variant="outline">Volver</Button>
        </Link>
      </div>
    </motion.div>
  );
}
