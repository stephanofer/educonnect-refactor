import { Link } from "react-router";
import { motion } from "motion/react";
import { Lock, Sparkles, ArrowRight, BookOpen, Video, FileText } from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { Card, CardContent } from "@/ui/components/shadcn/card";

interface NoPlanAccessProps {
  title?: string;
  description?: string;
}

export function NoPlanAccess({
  title = "Contenido Exclusivo para Suscriptores",
  description = "Accede a nuestra biblioteca completa con materiales de estudio, guías, videos y más recursos académicos.",
}: NoPlanAccessProps) {
  const features = [
    {
      icon: BookOpen,
      title: "Guías de Estudio",
      description: "Material curado por expertos",
    },
    {
      icon: Video,
      title: "Videos Educativos",
      description: "Clases grabadas y tutoriales",
    },
    {
      icon: FileText,
      title: "Documentos PDF",
      description: "Ejercicios y resúmenes",
    },
  ];

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl text-center"
      >
        {/* Lock Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10"
        >
          <Lock className="size-10 text-primary" />
        </motion.div>

        {/* Title */}
        <h1 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h1>

        {/* Description */}
        <p className="mx-auto mb-8 max-w-md text-muted-foreground">
          {description}
        </p>

        {/* Features Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="h-full border-dashed">
                <CardContent className="flex flex-col items-center p-4 text-center">
                  <div className="mb-3 rounded-lg bg-muted p-2">
                    <feature.icon className="size-5 text-muted-foreground" />
                  </div>
                  <h3 className="mb-1 text-sm font-medium">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <Button asChild size="lg" className="gap-2">
            <Link to="/dashboard/planes">
              <Sparkles className="size-4" />
              Ver Planes Disponibles
              <ArrowRight className="size-4" />
            </Link>
          </Button>

          <p className="text-sm text-muted-foreground">
            Desde <span className="font-semibold text-foreground">S/ 29.90</span> al mes
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
