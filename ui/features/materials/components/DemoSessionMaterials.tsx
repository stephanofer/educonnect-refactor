import { useState } from "react";
import { motion } from "motion/react";
import {
  BookOpen,
  Calendar,
  User,
  ChevronDown,
  FileText,
  Download,
  Sparkles,
  GraduationCap,
  Clock,
  Star,
  CheckCircle2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { Card, CardContent, CardHeader } from "@/ui/components/shadcn/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/ui/components/shadcn/collapsible";
import { Button } from "@/ui/components/shadcn/button";
import { Badge } from "@/ui/components/shadcn/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/ui/components/shadcn/dialog";
import { cn } from "@/ui/lib/utils";

// Demo session data (mockup)
const DEMO_SESSION = {
  sessionId: "demo-session-001",
  tutorName: "María García López",
  tutorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
  subjectName: "Cálculo Diferencial",
  sessionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  duration: 60,
  rating: 5,
  material: {
    id: "demo-material-001",
    title: "Guía de Derivadas e Integrales.pdf",
    description: "Material completo con ejercicios resueltos paso a paso",
    type: "pdf" as const,
    fileSize: 2.4 * 1024 * 1024, // 2.4 MB
    downloadCount: 42,
  },
  aiSummary: {
    keyTopics: [
      "Regla de la cadena para derivadas compuestas",
      "Derivadas de funciones trigonométricas",
      "Aplicaciones de la derivada: máximos y mínimos",
      "Técnicas de integración por sustitución",
    ],
    studentProgress: "Excelente comprensión de los conceptos básicos. Se recomienda practicar más ejercicios de integración por partes.",
    nextSteps: [
      "Revisar ejercicios del capítulo 5 del libro",
      "Practicar 10 problemas de derivadas implícitas",
      "Preparar dudas sobre series de Taylor para la próxima sesión",
    ],
  },
};

interface DemoSessionMaterialsProps {
  onSearchTutors?: () => void;
}

export function DemoSessionMaterials({ onSearchTutors }: DemoSessionMaterialsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = () => {
    // Simulate download - in real app would download the file
    alert("Esta es una sesión de ejemplo. En una sesión real, aquí se descargaría el archivo.");
  };

  return (
    <>
      {/* Demo Session Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        {/* Demo Badge */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Sparkles className="size-3 mr-1" />
            Sesión de ejemplo
          </Badge>
          <span className="text-xs text-muted-foreground">
            Así se verán tus materiales después de cada sesión
          </span>
        </div>

        <Card className="overflow-hidden border-dashed border-2 border-primary/30 bg-primary/5">
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-primary/10 transition-colors py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10 border-2 border-primary/30">
                      <AvatarImage
                        src={DEMO_SESSION.tutorAvatar}
                        alt={DEMO_SESSION.tutorName}
                      />
                      <AvatarFallback>
                        {DEMO_SESSION.tutorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{DEMO_SESSION.subjectName}</h3>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          1 material
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <User className="size-3.5" />
                          {DEMO_SESSION.tutorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          {DEMO_SESSION.sessionDate.toLocaleDateString("es", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button variant="ghost" size="icon">
                    <ChevronDown
                      className={cn(
                        "size-5 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </Button>
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="pt-0 pb-4">
                <div className="border-t border-dashed border-primary/30 pt-4 space-y-3">
                  {/* Material Card */}
                  <Card 
                    className="group hover:shadow-md transition-shadow cursor-pointer border-primary/20"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg text-red-500 bg-red-50">
                          <FileText className="size-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-medium text-foreground truncate">
                                {DEMO_SESSION.material.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                {DEMO_SESSION.material.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="secondary">PDF</Badge>
                              <Badge variant="outline" className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30 text-purple-600">
                                <Sparkles className="size-3 mr-1" />
                                Resumen IA
                              </Badge>
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>2.4 MB</span>
                              <span className="flex items-center gap-1">
                                <Download className="size-3" />
                                {DEMO_SESSION.material.downloadCount}
                              </span>
                            </div>

                            <Button size="sm" variant="outline" className="pointer-events-none">
                              <BookOpen className="size-4 mr-1.5" />
                              Ver detalles
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </motion.div>

      {/* Session Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="size-12 border">
                <AvatarImage
                  src={DEMO_SESSION.tutorAvatar}
                  alt={DEMO_SESSION.tutorName}
                />
                <AvatarFallback>
                  {DEMO_SESSION.tutorName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">
                  {DEMO_SESSION.subjectName}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <span>{DEMO_SESSION.tutorName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {DEMO_SESSION.duration} min
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star className="size-3.5 fill-current" />
                    {DEMO_SESSION.rating}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Material Download Section */}
            <div className="rounded-lg border bg-card p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-3">
                <FileText className="size-4 text-red-500" />
                Material compartido por el tutor
              </h4>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 text-red-500">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{DEMO_SESSION.material.title}</p>
                    <p className="text-xs text-muted-foreground">2.4 MB • PDF</p>
                  </div>
                </div>
                <Button size="sm" onClick={handleDownload}>
                  <Download className="size-4 mr-1.5" />
                  Descargar
                </Button>
              </div>
            </div>

            {/* AI Summary Section */}
            <div className="rounded-lg border bg-gradient-to-br from-purple-500/5 to-blue-500/5 p-4">
              <h4 className="font-semibold flex items-center gap-2 mb-4">
                <Sparkles className="size-4 text-purple-500" />
                Resumen generado por IA
              </h4>

              {/* Key Topics */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <GraduationCap className="size-4" />
                  Temas cubiertos
                </h5>
                <ul className="space-y-1.5">
                  {DEMO_SESSION.aiSummary.keyTopics.map((topic, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="size-4 text-green-500 mt-0.5 shrink-0" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Student Progress */}
              <div className="mb-4 p-3 rounded-lg bg-background/80 border">
                <h5 className="text-sm font-medium mb-1">Tu progreso</h5>
                <p className="text-sm text-muted-foreground">
                  {DEMO_SESSION.aiSummary.studentProgress}
                </p>
              </div>

              {/* Next Steps */}
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-2">
                  Próximos pasos recomendados
                </h5>
                <ul className="space-y-1.5">
                  {DEMO_SESSION.aiSummary.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                        {idx + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground mb-3">
                Esta es una sesión de ejemplo. Reserva tu primera sesión para obtener materiales y resúmenes personalizados.
              </p>
              {onSearchTutors && (
                <Button onClick={onSearchTutors} size="lg">
                  <GraduationCap className="size-4 mr-2" />
                  Buscar tutores
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
