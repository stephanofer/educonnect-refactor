import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Star, Heart, BadgeCheck, GraduationCap, BookOpen, ArrowRight, ThumbsUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/ui/components/shadcn/card";
import { Badge } from "@/ui/components/shadcn/badge";
import { Button } from "@/ui/components/shadcn/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { cn } from "@/ui/lib/utils";
import type { TutorListItem } from "../hooks";
import { getTutorSlotsForDate } from "../hooks";

interface TutorCardProps {
  tutor: TutorListItem;
  onToggleFavorite: (tutorId: string, isFavorite: boolean) => void;
  index?: number;
  isTogglingFavorite?: boolean;
  availableDate?: string;
}

export function TutorCard({
  tutor,
  onToggleFavorite,
  index = 0,
  isTogglingFavorite = false,
  availableDate,
}: TutorCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/dashboard/tutor/${tutor.id}`);
  };

  const dateSlots = availableDate
    ? getTutorSlotsForDate(tutor, availableDate)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden cursor-pointer transition-all duration-300",
          "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
          "border border-border/50 hover:border-primary/20"
        )}
        onClick={handleCardClick}
      >
        {/* Top accent gradient */}
        <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardContent className="p-5">
          {/* Favorite button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 size-9 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(tutor.id, tutor.isFavorite);
            }}
            disabled={isTogglingFavorite}
          >
            <Heart
              className={cn(
                "size-5 transition-all duration-300",
                tutor.isFavorite
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-muted-foreground group-hover:text-red-400"
              )}
            />
          </Button>

          {/* Avatar and basic info */}
          <div className="flex gap-4">
            <div className="relative">
              <Avatar className="size-18 shrink-0 border-3 border-background shadow-lg ring-2 ring-primary/10">
                <AvatarImage src={tutor.avatarUrl || undefined} alt={tutor.fullName} />
                <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                  {tutor.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {tutor.isAvailable && (
                <div className="absolute -bottom-0.5 -right-0.5 size-5 rounded-full bg-emerald-500 border-2 border-background" title="Disponible" />
              )}
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground truncate text-base">
                  {tutor.fullName}
                </h3>
                {tutor.isVerified && (
                  <BadgeCheck className="size-5 text-blue-500 shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <GraduationCap className="size-4 shrink-0" />
                <span className="truncate">{tutor.career}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
                  <Star className="size-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-semibold text-sm text-amber-700 dark:text-amber-400">
                    {tutor.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {tutor.totalReviews} reseñas
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-4 px-3 py-2.5 bg-muted/40 rounded-lg">
            <div className="flex items-center gap-1.5 text-sm">
              <BookOpen className="size-4 text-primary" />
              <span className="font-medium">{tutor.totalSessions}</span>
              <span className="text-muted-foreground text-xs">sesiones</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5 text-sm">
              <ThumbsUp className="size-4 text-emerald-500" />
              <span className="font-medium">{tutor.recommendationRate}%</span>
              <span className="text-muted-foreground text-xs">recomienda</span>
            </div>
          </div>

          {/* Specialties */}
          {tutor.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tutor.specialties.slice(0, 3).map((specialty) => (
                <Badge
                  key={specialty}
                  variant="secondary"
                  className="text-xs font-medium px-2.5 py-0.5 bg-primary/5 text-primary border-0 hover:bg-primary/10"
                >
                  {specialty}
                </Badge>
              ))}
              {tutor.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs px-2.5 py-0.5">
                  +{tutor.specialties.length - 3} más
                </Badge>
              )}
            </div>
          )}

          {/* Bio preview */}
          {tutor.bio && !availableDate && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2 leading-relaxed">
              {tutor.bio}
            </p>
          )}

          {/* Available time slots for selected date */}
          {availableDate && dateSlots.length > 0 && (
            <div className="mt-3 p-2.5 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Horarios disponibles
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dateSlots.map((slot) => (
                  <span
                    key={slot.startTime}
                    className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium"
                  >
                    {slot.startTime} - {slot.endTime}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer CTA */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              {tutor.university.length > 35
                ? tutor.university.slice(0, 35) + "..."
                : tutor.university}
            </span>
            <div className="flex items-center gap-1.5 text-primary text-sm font-medium group-hover:gap-2.5 transition-all duration-300">
              Ver perfil
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
