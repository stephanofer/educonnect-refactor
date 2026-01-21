import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Calendar,
  Clock,
  Star,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Sparkles,
  Heart,
  GraduationCap,
  CalendarOff,
  Users,
  Loader2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Button } from "@/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/components/shadcn/card";
import { Badge } from "@/ui/components/shadcn/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/components/shadcn/avatar";
import { Progress } from "@/ui/components/shadcn/progress";
import { Skeleton } from "@/ui/components/shadcn/skeleton";
import { useAuthStore } from "@/ui/stores/auth.store";
import { supabase } from "@/ui/lib/supabase";

// Types
interface UpcomingSession {
  id: string;
  tutorName: string;
  tutorAvatar: string | null;
  subject: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: string;
}

interface FavoriteTutor {
  id: string;
  name: string;
  avatar: string | null;
  specialty: string;
  rating: number;
  university: string;
}

interface DashboardStats {
  upcomingSessions: number;
  availableSessions: number;
  completedSessions: number;
  averageRating: number;
}

interface SessionActivity {
  month: string;
  sessions: number;
}

interface SubscriptionInfo {
  planName: string;
  planTier: string;
  sessionsUsed: number;
  sessionsTotal: number;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function formatTimeUntil(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `En ${days} día${days > 1 ? "s" : ""}`;
  }
  if (hours > 0) {
    return `En ${hours}h ${minutes}min`;
  }
  if (minutes > 0) {
    return `En ${minutes} minutos`;
  }
  return "¡Ahora!";
}

// Custom tooltip for the chart
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          {payload[0].value} sesiones
        </p>
      </div>
    );
  }
  return null;
}

// Loading skeleton for stats cards
function StatsCardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-center gap-2 md:gap-3">
          <Skeleton className="size-8 md:size-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading skeleton for session items
function SessionItemSkeleton() {
  return (
    <div className="flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-xl bg-muted/50">
      <Skeleton className="size-10 md:size-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-16 ml-auto" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  action?: { label: string; href: string } 
}) {
  return (
    <div className="text-center py-8">
      <div className="size-12 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-3">
        <Icon className="size-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
      <p className="text-xs text-muted-foreground/70">{description}</p>
      {action && (
        <Link to={action.href}>
          <Button variant="link" className="mt-2">
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}

export default function StudentDashboardHome() {
  const { user, profile } = useAuthStore();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    upcomingSessions: 0,
    availableSessions: 0,
    completedSessions: 0,
    averageRating: 0,
  });
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [favoriteTutors, setFavoriteTutors] = useState<FavoriteTutor[]>([]);
  const [sessionActivity, setSessionActivity] = useState<SessionActivity[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  const displayName = profile?.full_name?.split(" ")[0] || "Estudiante";

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return;

    const userId = user.id;

    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [
          sessionsResult,
          upcomingResult,
          favoritesResult,
          subscriptionResult,
          reviewsResult,
        ] = await Promise.all([
          // Get session counts
          supabase
            .from("sessions")
            .select("id, status, scheduled_at")
            .eq("student_id", userId),
          
          // Get upcoming sessions with tutor info
          supabase
            .from("sessions")
            .select(`
              id,
              scheduled_at,
              duration_minutes,
              status,
              subject:subjects(name),
              tutor:profiles!sessions_tutor_id_fkey(full_name, avatar_url)
            `)
            .eq("student_id", userId)
            .in("status", ["pending", "confirmed"])
            .gte("scheduled_at", new Date().toISOString())
            .order("scheduled_at", { ascending: true })
            .limit(3),
          
          // Get favorite tutors
          supabase
            .from("favorites")
            .select(`
              id,
              tutor:profiles!favorites_tutor_id_fkey(
                id,
                full_name,
                avatar_url
              )
            `)
            .eq("student_id", userId)
            .limit(3),
          
          // Get active subscription with plan info
          supabase
            .from("subscriptions")
            .select(`
              id,
              sessions_remaining,
              plan:plans(name, tier, sessions_included)
            `)
            .eq("user_id", userId)
            .eq("status", "active")
            .single(),
          
          // Get reviews given by this student (to calculate average rating given)
          supabase
            .from("reviews")
            .select("rating")
            .eq("student_id", userId),
        ]);

        // Process sessions data
        const allSessions = sessionsResult.data || [];
        const now = new Date();
        
        const upcoming = allSessions.filter(s => 
          (s.status === "pending" || s.status === "confirmed") && 
          new Date(s.scheduled_at) > now
        ).length;
        
        const completed = allSessions.filter(s => s.status === "completed").length;

        // Calculate session activity for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const activityMap = new Map<string, number>();
        
        // Initialize last 6 months with 0
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          activityMap.set(monthNames[date.getMonth()], 0);
        }
        
        // Count sessions per month
        allSessions
          .filter(s => s.status === "completed" && new Date(s.scheduled_at) > sixMonthsAgo)
          .forEach(s => {
            const month = monthNames[new Date(s.scheduled_at).getMonth()];
            activityMap.set(month, (activityMap.get(month) || 0) + 1);
          });
        
        const activityData = Array.from(activityMap.entries()).map(([month, sessions]) => ({
          month,
          sessions,
        }));

        // Process upcoming sessions - Supabase returns arrays for relations
        const processedUpcoming: UpcomingSession[] = (upcomingResult.data || []).map((s) => {
          // Handle both array and object responses from Supabase
          const subject = Array.isArray(s.subject) ? s.subject[0] : s.subject;
          const tutor = Array.isArray(s.tutor) ? s.tutor[0] : s.tutor;
          
          return {
            id: s.id,
            tutorName: tutor?.full_name || "Tutor",
            tutorAvatar: tutor?.avatar_url || null,
            subject: subject?.name || "Sesión",
            scheduledAt: new Date(s.scheduled_at),
            durationMinutes: s.duration_minutes,
            status: s.status,
          };
        });

        // Process favorites - need to get tutor_profiles for specialties
        const processedFavorites: FavoriteTutor[] = [];
        if (favoritesResult.data && favoritesResult.data.length > 0) {
          const tutorIds = favoritesResult.data
            .map((f) => {
              const tutor = Array.isArray(f.tutor) ? f.tutor[0] : f.tutor;
              return tutor?.id;
            })
            .filter(Boolean);
          
          if (tutorIds.length > 0) {
            const { data: tutorProfiles } = await supabase
              .from("tutor_profiles")
              .select("user_id, university, specialties, rating")
              .in("user_id", tutorIds);
            
            const tutorProfileMap = new Map(
              (tutorProfiles || []).map((tp) => [tp.user_id, tp])
            );
            
            for (const f of favoritesResult.data) {
              const tutor = Array.isArray(f.tutor) ? f.tutor[0] : f.tutor;
              if (tutor) {
                const tutorProfile = tutorProfileMap.get(tutor.id);
                processedFavorites.push({
                  id: tutor.id,
                  name: tutor.full_name,
                  avatar: tutor.avatar_url,
                  specialty: tutorProfile?.specialties?.[0] || "Tutor",
                  rating: tutorProfile?.rating || 0,
                  university: tutorProfile?.university || "",
                });
              }
            }
          }
        }

        // Process subscription
        let subInfo: SubscriptionInfo | null = null;
        if (subscriptionResult.data && !subscriptionResult.error) {
          const sub = subscriptionResult.data;
          const plan = Array.isArray(sub.plan) ? sub.plan[0] : sub.plan;
          
          if (plan) {
            subInfo = {
              planName: plan.name || "Plan",
              planTier: plan.tier || "basic",
              sessionsUsed: (plan.sessions_included || 0) - sub.sessions_remaining,
              sessionsTotal: plan.sessions_included || 0,
            };
          }
        }

        // Calculate average rating from reviews
        const reviews = reviewsResult.data || [];
        const avgRating = reviews.length > 0
          ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
          : 0;

        // Update state
        setStats({
          upcomingSessions: upcoming,
          availableSessions: subscriptionResult.data?.sessions_remaining || 0,
          completedSessions: completed,
          averageRating: Math.round(avgRating * 10) / 10,
        });
        setUpcomingSessions(processedUpcoming);
        setFavoriteTutors(processedFavorites);
        setSessionActivity(activityData);
        setSubscription(subInfo);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  const planProgress = subscription 
    ? (subscription.sessionsUsed / subscription.sessionsTotal) * 100 
    : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
              ¡Hola, {displayName}!
              <motion.span
                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                transition={{ duration: 1.5, delay: 0.5 }}
              >
                👋
              </motion.span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Aquí está el resumen de tu actividad académica
            </p>
          </div>
          <Link to="/dashboard/buscar-tutores">
            <Button className="gap-2 w-full sm:w-auto">
              <Sparkles className="size-4" />
              Buscar Tutores
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <Card className="relative overflow-hidden">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="size-8 md:size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="size-4 md:size-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stats.upcomingSessions}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                      Próximas sesiones
                    </p>
                  </div>
                </div>
              </CardContent>
              <div className="absolute -right-4 -bottom-4 size-16 md:size-20 rounded-full bg-primary/5" />
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="size-8 md:size-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                    <Clock className="size-4 md:size-5 text-success" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stats.availableSessions}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                      Sesiones disponibles
                    </p>
                  </div>
                </div>
              </CardContent>
              <div className="absolute -right-4 -bottom-4 size-16 md:size-20 rounded-full bg-success/5" />
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="size-8 md:size-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <GraduationCap className="size-4 md:size-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stats.completedSessions}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                      Completadas
                    </p>
                  </div>
                </div>
              </CardContent>
              <div className="absolute -right-4 -bottom-4 size-16 md:size-20 rounded-full bg-accent/5" />
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="size-8 md:size-10 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                    <Star className="size-4 md:size-5 text-warning" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl md:text-2xl font-bold text-foreground">
                      {stats.averageRating || "—"}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                      Rating promedio
                    </p>
                  </div>
                </div>
              </CardContent>
              <div className="absolute -right-4 -bottom-4 size-16 md:size-20 rounded-full bg-warning/5" />
            </Card>
          </>
        )}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column - Sessions & Activity */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Upcoming Sessions */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base md:text-lg">Próximas Sesiones</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Tus sesiones programadas</CardDescription>
                </div>
                <Link to="/dashboard/mis-sesiones">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs md:text-sm">
                    Ver todas <ArrowRight className="size-3 md:size-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <SessionItemSkeleton />
                    <SessionItemSkeleton />
                  </div>
                ) : upcomingSessions.length === 0 ? (
                  <EmptyState
                    icon={CalendarOff}
                    title="Sin sesiones programadas"
                    description="Agenda tu primera sesión con un tutor"
                    action={{ label: "Buscar un tutor", href: "/dashboard/buscar-tutores" }}
                  />
                ) : (
                  <div className="space-y-3">
                    {upcomingSessions.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 md:gap-4 p-2 md:p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <Avatar className="size-10 md:size-12 border-2 border-background shadow-sm shrink-0">
                          <AvatarImage src={session.tutorAvatar || undefined} />
                          <AvatarFallback>{session.tutorName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-sm md:text-base text-foreground truncate">
                              {session.subject}
                            </h4>
                            <Badge variant="secondary" className="text-[10px] md:text-xs shrink-0">
                              {session.durationMinutes} min
                            </Badge>
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">
                            con {session.tutorName}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs md:text-sm font-medium text-primary">
                            {formatTimeUntil(session.scheduledAt)}
                          </p>
                          <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">
                            {session.scheduledAt.toLocaleDateString("es", {
                              weekday: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Chart */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Actividad de Sesiones</CardTitle>
                <CardDescription className="text-xs md:text-sm">Tu progreso en los últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[200px] md:h-[250px] flex items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                ) : sessionActivity.every(a => a.sessions === 0) ? (
                  <div className="h-[200px] md:h-[250px] flex items-center justify-center">
                    <EmptyState
                      icon={TrendingUp}
                      title="Sin actividad aún"
                      description="Completa sesiones para ver tu progreso aquí"
                    />
                  </div>
                ) : (
                  <div className="h-[200px] md:h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sessionActivity}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                          width={40}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }} />
                        <Bar
                          dataKey="sessions"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={50}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Plan & Favorites */}
        <div className="space-y-4 md:space-y-6">
          {/* Plan Progress */}
          <motion.div variants={itemVariants}>
            {isLoading ? (
              <Card className="bg-gradient-to-br from-primary to-primary/80">
                <CardContent className="p-4 md:p-5">
                  <Skeleton className="h-5 w-24 bg-white/20 mb-4" />
                  <Skeleton className="h-4 w-full bg-white/20 mb-2" />
                  <Skeleton className="h-2 w-full bg-white/20 mb-2" />
                  <Skeleton className="h-3 w-32 bg-white/20" />
                </CardContent>
              </Card>
            ) : subscription ? (
              <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="size-4 md:size-5" />
                    <h3 className="font-semibold text-sm md:text-base">Tu Plan</h3>
                    <Badge className="ml-auto bg-white/20 hover:bg-white/30 text-white text-xs capitalize">
                      {subscription.planName}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className="text-primary-foreground/80">Sesiones usadas</span>
                      <span className="font-medium">{subscription.sessionsUsed} / {subscription.sessionsTotal}</span>
                    </div>
                    <Progress
                      value={planProgress}
                      className="h-2 bg-white/20"
                    />
                    <p className="text-[10px] md:text-xs text-primary-foreground/70">
                      Te quedan {subscription.sessionsTotal - subscription.sessionsUsed} sesiones este mes
                    </p>
                  </div>
                  <Link to="/dashboard/planes">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-0 text-xs md:text-sm"
                    >
                      Mejorar Plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-muted to-muted/80">
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="size-4 md:size-5 text-muted-foreground" />
                    <h3 className="font-semibold text-sm md:text-base text-muted-foreground">Sin Plan Activo</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Adquiere un plan para comenzar a agendar sesiones con tutores.
                  </p>
                  <Link to="/dashboard/planes">
                    <Button size="sm" className="w-full text-xs md:text-sm">
                      Ver Planes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Favorite Tutors */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <Heart className="size-4 text-red-500" />
                    Tutores Favoritos
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">Tus tutores guardados</CardDescription>
                </div>
                <Link to="/dashboard/buscar-tutores">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs md:text-sm">
                    Ver todos <ArrowRight className="size-3 md:size-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3 p-2">
                        <Skeleton className="size-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : favoriteTutors.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="Sin favoritos aún"
                    description="Guarda tutores para encontrarlos fácilmente"
                    action={{ label: "Explorar tutores", href: "/dashboard/buscar-tutores" }}
                  />
                ) : (
                  <div className="space-y-3">
                    {favoriteTutors.map((tutor) => (
                      <Link
                        key={tutor.id}
                        to={`/dashboard/tutor/${tutor.id}`}
                        className="group flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Avatar className="size-10 border-2 border-background shadow-sm shrink-0">
                          <AvatarImage src={tutor.avatar || undefined} />
                          <AvatarFallback>{tutor.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {tutor.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {tutor.specialty}
                            </p>
                            {tutor.university && (
                              <>
                                <span className="text-muted-foreground">·</span>
                                <p className="text-xs text-muted-foreground">
                                  {tutor.university}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        {tutor.rating > 0 && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Star className="size-3 text-warning fill-warning" />
                            <span className="text-xs font-medium">{tutor.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base md:text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Link to="/dashboard/buscar-tutores">
                  <Button variant="outline" className="w-full h-auto py-2 md:py-3 flex-col gap-1 md:gap-1.5">
                    <BookOpen className="size-4 md:size-5 text-primary" />
                    <span className="text-[10px] md:text-xs">Buscar Tutores</span>
                  </Button>
                </Link>
                <Link to="/dashboard/mis-sesiones">
                  <Button variant="outline" className="w-full h-auto py-2 md:py-3 flex-col gap-1 md:gap-1.5">
                    <Calendar className="size-4 md:size-5 text-primary" />
                    <span className="text-[10px] md:text-xs">Mis Sesiones</span>
                  </Button>
                </Link>
                <Link to="/dashboard/materiales">
                  <Button variant="outline" className="w-full h-auto py-2 md:py-3 flex-col gap-1 md:gap-1.5">
                    <BookOpen className="size-4 md:size-5 text-primary" />
                    <span className="text-[10px] md:text-xs">Materiales</span>
                  </Button>
                </Link>
                <Link to="/dashboard/planes">
                  <Button variant="outline" className="w-full h-auto py-2 md:py-3 flex-col gap-1 md:gap-1.5">
                    <TrendingUp className="size-4 md:size-5 text-primary" />
                    <span className="text-[10px] md:text-xs">Mi Plan</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
