import { Link } from "react-router";
import { motion } from "motion/react";
import { Library, Users, BookOpen, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/components/shadcn/card";
import { Button } from "@/ui/components/shadcn/button";

const adminSections = [
  {
    title: "Biblioteca Virtual",
    description: "Gestiona los materiales de estudio disponibles para los suscriptores",
    icon: Library,
    path: "/admin/biblioteca",
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Usuarios",
    description: "Administra estudiantes, tutores y sus perfiles",
    icon: Users,
    path: "/admin/usuarios",
    color: "bg-green-500/10 text-green-500",
    comingSoon: true,
  },
  {
    title: "Contenido",
    description: "Gestiona materias, cursos y categorías",
    icon: BookOpen,
    path: "/admin/contenido",
    color: "bg-purple-500/10 text-purple-500",
    comingSoon: true,
  },
  {
    title: "Métricas",
    description: "Visualiza estadísticas y reportes de la plataforma",
    icon: TrendingUp,
    path: "/admin/metricas",
    color: "bg-orange-500/10 text-orange-500",
    comingSoon: true,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">
          Panel de Administración
        </h1>
        <p className="text-muted-foreground">
          Bienvenido al panel de control de EduConnect
        </p>
      </motion.div>

      {/* Admin Sections Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {adminSections.map((section, index) => (
          <motion.div
            key={section.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`h-full ${section.comingSoon ? "opacity-60" : "hover:border-primary/50 transition-colors"}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg p-2 ${section.color}`}>
                    <section.icon className="size-5" />
                  </div>
                  {section.comingSoon && (
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                      Próximamente
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {!section.comingSoon && (
                  <Button asChild variant="ghost" className="gap-2 -ml-4">
                    <Link to={section.path}>
                      Gestionar
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
