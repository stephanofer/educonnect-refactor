import { motion } from "motion/react";
import { Star, Heart, BadgeCheck, GraduationCap, Clock } from "lucide-react";
import { Card, CardContent } from "@/ui/components/shadcn/card";
import { Badge } from "@/ui/components/shadcn/badge";
import { Button } from "@/ui/components/shadcn/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { cn } from "@/ui/lib/utils";
import type { TutorListItem } from "../hooks";

interface TutorCardProps {
  tutor: TutorListItem;
  onSelect: (tutor: TutorListItem) => void;
  onToggleFavorite: (tutorId: string, isFavorite: boolean) => void;
  index?: number;
  isTogglingFavorite?: boolean;
}

export function TutorCard({
  tutor,
  onSelect,
  onToggleFavorite,
  index = 0,
  isTogglingFavorite = false,
}: TutorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="group relative overflow-hidden hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          {/* Favorite button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 z-10 size-8"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(tutor.id, tutor.isFavorite);
            }}
            disabled={isTogglingFavorite}
          >
            <Heart
              className={cn(
                "size-5 transition-colors",
                tutor.isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground hover:text-red-500"
              )}
            />
          </Button>

          {/* Avatar and basic info */}
          <div className="flex gap-4">
            <Avatar className="size-16 shrink-0 border-2 border-background shadow-md">
              <AvatarImage src={tutor.avatarUrl || undefined} alt={tutor.fullName} />
              <AvatarFallback className="text-lg font-semibold">
                {tutor.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">
                  {tutor.fullName}
                </h3>
                {tutor.isVerified && (
                  <BadgeCheck className="size-4 text-primary shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                <GraduationCap className="size-3.5" />
                <span className="truncate">{tutor.university}</span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1">
                  <Star className="size-4 text-amber-500 fill-amber-500" />
                  <span className="font-medium text-sm">
                    {tutor.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({tutor.totalReviews} reseñas)
                </span>
                {tutor.totalSessions > 0 && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {tutor.totalSessions} sesiones
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Specialties */}
          {tutor.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tutor.specialties.slice(0, 3).map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {tutor.specialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tutor.specialties.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Bio preview */}
          {tutor.bio && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {tutor.bio}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 text-muted-foreground" />
              <span className="font-semibold text-primary">
                S/ {tutor.hourlyRate.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">/hora</span>
            </div>

            <Button size="sm" onClick={() => onSelect(tutor)}>
              Ver perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
