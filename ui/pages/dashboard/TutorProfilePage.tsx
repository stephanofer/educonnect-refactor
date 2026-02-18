import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Star,
  Heart,
  BadgeCheck,
  GraduationCap,
  BookOpen,
  ThumbsUp,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  Award,
  FileCheck,
  Clock,
  Users,
  Download,
} from "lucide-react";
import { Button } from "@/ui/components/shadcn/button";
import { Badge } from "@/ui/components/shadcn/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/components/shadcn/card";
import { Separator } from "@/ui/components/shadcn/separator";
import { cn } from "@/ui/lib/utils";
import { useMockTutorDetail, useToggleFavorite } from "@/ui/features/tutors";
import { toast } from "sonner";

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const CREDENTIAL_ICONS = {
  degree: GraduationCap,
  certificate: Award,
  diploma: FileCheck,
};

export default function TutorProfilePage() {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const { data: tutor } = useMockTutorDetail(tutorId);
  const toggleFavorite = useToggleFavorite();

  if (!tutor) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">No se encontró el tutor</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }

  const handleToggleFavorite = () => {
    toggleFavorite.mutate(
      { tutorId: tutor.id, isFavorite: tutor.isFavorite },
      {
        onSuccess: () => {
          toast.success(tutor.isFavorite ? "Eliminado de favoritos" : "Agregado a favoritos");
        },
      }
    );
  };

  const handleBookSession = () => {
    navigate(`/dashboard/reservar/${tutor.id}`);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Back button */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 -ml-2">
          <ArrowLeft className="size-4" />
          Volver a búsqueda
        </Button>
      </motion.div>

      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center md:items-start gap-3">
                <div className="relative">
                  <Avatar className="size-28 border-4 border-background shadow-xl ring-2 ring-primary/20">
                    <AvatarImage src={tutor.avatarUrl || undefined} alt={tutor.fullName} />
                    <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                      {tutor.fullName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {tutor.isAvailable && (
                    <div className="absolute bottom-1 right-1 size-6 rounded-full bg-emerald-500 border-3 border-background" />
                  )}
                </div>
                {tutor.isAvailable ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800">
                    <div className="size-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                    Disponible ahora
                  </Badge>
                ) : (
                  <Badge variant="secondary">No disponible</Badge>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold">{tutor.fullName}</h1>
                    {tutor.isVerified && (
                      <BadgeCheck className="size-6 text-blue-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-full ml-auto"
                      onClick={handleToggleFavorite}
                    >
                      <Heart
                        className={cn(
                          "size-5",
                          tutor.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
                        )}
                      />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <GraduationCap className="size-5" />
                    <span className="text-base">{tutor.career} &mdash; {tutor.university}</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full">
                    <Star className="size-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-amber-700 dark:text-amber-400">{tutor.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">({tutor.totalReviews} reseñas)</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-full">
                    <BookOpen className="size-4 text-primary" />
                    <span className="font-bold">{tutor.totalSessions}</span>
                    <span className="text-sm text-muted-foreground">sesiones</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-full">
                    <ThumbsUp className="size-4 text-emerald-500" />
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{tutor.recommendationRate}%</span>
                    <span className="text-sm text-muted-foreground">recomienda</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button size="lg" onClick={handleBookSession} className="gap-2 text-base w-full md:w-auto">
                  <Calendar className="size-5" />
                  Reservar sesión
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  Acerca de mí
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{tutor.bio}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Specialties & Subjects */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5 text-primary" />
                  Especialidades y Materias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tutor.specialties.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Especialidades</p>
                    <div className="flex flex-wrap gap-2">
                      {tutor.specialties.map((s) => (
                        <Badge key={s} className="bg-primary/10 text-primary border-0 px-3 py-1">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {tutor.subjects.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Materias que enseña</p>
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects.map((s) => (
                        <Badge key={s.id} variant="outline" className="px-3 py-1">
                          {s.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Credentials */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-primary" />
                  Credenciales y Certificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tutor.credentials.length > 0 ? (
                  <div className="space-y-4">
                    {tutor.credentials.map((cred) => {
                      const Icon = CREDENTIAL_ICONS[cred.type];
                      return (
                        <div
                          key={cred.id}
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-lg border",
                            cred.verified
                              ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/50"
                              : "bg-muted/30 border-border/50"
                          )}
                        >
                          <div
                            className={cn(
                              "size-10 rounded-full flex items-center justify-center shrink-0",
                              cred.verified
                                ? "bg-emerald-100 dark:bg-emerald-900/50"
                                : "bg-muted"
                            )}
                          >
                            <Icon
                              className={cn(
                                "size-5",
                                cred.verified ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{cred.title}</p>
                              {cred.verified && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800 text-xs">
                                  <ShieldCheck className="size-3 mr-1" />
                                  Verificado
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {cred.institution} &middot; {cred.year}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0 gap-1.5"
                            asChild
                          >
                            <a href="/CARTPRES-Fernadez-27_1_2026-181910.pdf" download>
                              <Download className="size-4" />
                              <span className="hidden sm:inline">Descargar</span>
                            </a>
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Este tutor aún no ha registrado credenciales
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Reviews */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="size-5 text-primary" />
                  Reseñas ({tutor.recentReviews.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tutor.recentReviews.length > 0 ? (
                  <div className="space-y-5">
                    {tutor.recentReviews.map((review) => (
                      <div key={review.id}>
                        <div className="flex items-start gap-3">
                          <Avatar className="size-10">
                            <AvatarImage src={review.studentAvatar || undefined} />
                            <AvatarFallback className="text-sm">{review.studentName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">{review.studentName}</span>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "size-3.5",
                                      i < review.rating
                                        ? "text-amber-500 fill-amber-500"
                                        : "text-muted-foreground/30"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString("es-PE", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                                {review.comment}
                              </p>
                            )}
                            {review.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {review.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <Separator className="mt-4 last:hidden" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Este tutor aún no tiene reseñas
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Book CTA Sticky */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-5 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">¿Listo para aprender?</p>
                  <p className="text-lg font-bold mt-1">Agenda tu sesión ahora</p>
                </div>
                <Button size="lg" onClick={handleBookSession} className="w-full gap-2 text-base">
                  <Calendar className="size-5" />
                  Reservar sesión
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Se descontará de tu plan activo
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Availability */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="size-5 text-primary" />
                  Disponibilidad semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {DAY_NAMES.map((day, index) => {
                    const slots = tutor.availability.filter((a) => a.dayOfWeek === index);
                    const hasSlots = slots.length > 0;

                    return (
                      <div
                        key={day}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
                          hasSlots ? "bg-primary/5" : "bg-muted/30"
                        )}
                      >
                        <span className={cn("font-medium w-10", hasSlots ? "text-foreground" : "text-muted-foreground")}>
                          {day}
                        </span>
                        {hasSlots ? (
                          <div className="flex flex-wrap gap-1.5">
                            {slots.map((slot) => (
                              <span key={slot.id} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No disponible</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sesiones completadas</span>
                  <span className="font-bold">{tutor.totalSessions}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reseñas recibidas</span>
                  <span className="font-bold">{tutor.totalReviews}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tasa de recomendación</span>
                  <span className="font-bold text-emerald-600">{tutor.recommendationRate}%</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Calificación promedio</span>
                  <div className="flex items-center gap-1">
                    <Star className="size-4 text-amber-500 fill-amber-500" />
                    <span className="font-bold">{tutor.rating.toFixed(1)}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Credenciales verificadas</span>
                  <span className="font-bold">{tutor.credentials.filter((c) => c.verified).length}/{tutor.credentials.length}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
