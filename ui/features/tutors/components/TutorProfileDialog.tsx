import {
  Star,
  Heart,
  BadgeCheck,
  GraduationCap,
  Calendar,
  ThumbsUp,
  BookOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/ui/components/shadcn/dialog";
import { Button } from "@/ui/components/shadcn/button";
import { Badge } from "@/ui/components/shadcn/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { Separator } from "@/ui/components/shadcn/separator";
import { Skeleton } from "@/ui/components/shadcn/skeleton";
import { ScrollArea } from "@/ui/components/shadcn/scroll-area";
import { cn } from "@/ui/lib/utils";
import { useTutorDetail, type TutorDetail } from "../hooks";

interface TutorProfileDialogProps {
  tutorId: string | null;
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
  onBook: (tutor: TutorDetail) => void;
  onToggleFavorite: (tutorId: string, isFavorite: boolean) => void;
}

const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export function TutorProfileDialog({
  tutorId,
  userId,
  isOpen,
  onClose,
  onBook,
  onToggleFavorite,
}: TutorProfileDialogProps) {
  const { data: tutor, isLoading } = useTutorDetail(tutorId || undefined, userId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            {isLoading ? (
              <TutorProfileSkeleton />
            ) : tutor ? (
              <TutorProfileContent
                tutor={tutor}
                onBook={onBook}
                onToggleFavorite={onToggleFavorite}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No se encontró el tutor
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function TutorProfileContent({
  tutor,
  onBook,
  onToggleFavorite,
}: {
  tutor: TutorDetail;
  onBook: (tutor: TutorDetail) => void;
  onToggleFavorite: (tutorId: string, isFavorite: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex gap-4">
        <Avatar className="size-20 border-2 border-background shadow-lg">
          <AvatarImage src={tutor.avatarUrl || undefined} alt={tutor.fullName} />
          <AvatarFallback className="text-2xl font-semibold">
            {tutor.fullName.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl font-bold">
              {tutor.fullName}
            </DialogTitle>
            {tutor.isVerified && (
              <BadgeCheck className="size-5 text-primary" />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto size-8"
              onClick={() => onToggleFavorite(tutor.id, tutor.isFavorite)}
            >
              <Heart
                className={cn(
                  "size-5",
                  tutor.isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground"
                )}
              />
            </Button>
          </div>

          <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
            <GraduationCap className="size-4" />
            <span>{tutor.career} - {tutor.university}</span>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <Star className="size-4 text-amber-500 fill-amber-500" />
              <span className="font-semibold">{tutor.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">
                ({tutor.totalReviews} reseñas)
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <BookOpen className="size-4" />
              <span>{tutor.totalSessions} sesiones</span>
            </div>
            {tutor.recommendationRate > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ThumbsUp className="size-4" />
                <span>{tutor.recommendationRate.toFixed(0)}% recomienda</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Price and book button */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Precio por hora</p>
          <p className="text-2xl font-bold text-primary">
            S/ {tutor.hourlyRate.toFixed(2)}
          </p>
        </div>
        <Button size="lg" onClick={() => onBook(tutor)}>
          <Calendar className="size-4 mr-2" />
          Reservar sesión
        </Button>
      </div>

      <Separator />

      {/* Bio */}
      {tutor.bio && (
        <div>
          <h3 className="font-semibold mb-2">Acerca de mí</h3>
          <p className="text-muted-foreground">{tutor.bio}</p>
        </div>
      )}

      {/* Specialties */}
      {tutor.specialties.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Especialidades</h3>
          <div className="flex flex-wrap gap-2">
            {tutor.specialties.map((specialty) => (
              <Badge key={specialty} variant="secondary">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Subjects */}
      {tutor.subjects.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Materias que enseño</h3>
          <div className="flex flex-wrap gap-2">
            {tutor.subjects.map((subject) => (
              <Badge key={subject.id} variant="outline">
                {subject.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      {tutor.availability.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Disponibilidad semanal</h3>
          <div className="grid grid-cols-7 gap-1">
            {DAY_NAMES.map((day, index) => {
              const slots = tutor.availability.filter(
                (a) => a.dayOfWeek === index
              );
              const hasSlots = slots.length > 0;

              return (
                <div
                  key={day}
                  className={cn(
                    "text-center p-2 rounded-lg text-sm",
                    hasSlots ? "bg-primary/10" : "bg-muted"
                  )}
                >
                  <p className="font-medium">{day}</p>
                  {hasSlots ? (
                    <div className="mt-1 space-y-0.5">
                      {slots.map((slot) => (
                        <p key={slot.id} className="text-xs text-muted-foreground">
                          {slot.startTime.slice(0, 5)}-{slot.endTime.slice(0, 5)}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-1">-</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Separator />

      {/* Reviews */}
      <div>
        <h3 className="font-semibold mb-3">Reseñas recientes</h3>
        {tutor.recentReviews.length > 0 ? (
          <div className="space-y-4">
            {tutor.recentReviews.map((review) => (
              <div key={review.id} className="flex gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={review.studentAvatar || undefined} />
                  <AvatarFallback>{review.studentName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{review.studentName}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "size-3",
                            i < review.rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("es")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {review.comment}
                    </p>
                  )}
                  {review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {review.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Este tutor aún no tiene reseñas
          </p>
        )}
      </div>
    </div>
  );
}

function TutorProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-1 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}
