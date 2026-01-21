import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Calendar,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  CalendarOff,
  Loader2,
  MessageSquare,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  LineChart,
  ResponsiveContainer,
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
interface TodaySession {
  id: string;
  studentName: string;
  studentAvatar: string | null;
  subject: string;
  time: string;
  durationMinutes: number;
  status: string;
}

interface RecentReview {
  id: string;
  studentName: string;
  studentAvatar: string | null;
  rating: number;
  comment: string | null;
  tags: string[];
  createdAt: Date;
}

interface DashboardStats {
  todaySessions: number;
  monthlyEarnings: number;
  totalStudents: number;
  averageRating: number;
  weeklyGrowth: number;
  completedSessions: number;
}

interface EarningsData {
  month: string;
  earnings: number;
}

interface SessionsData {
  day: string;
  sessions: number;
}

interface TutorPerformance {
  responseRate: number;
  completionRate: number;
  recommendationRate: number;
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

// Custom tooltip for charts
function CustomTooltip({ active, payload, label, prefix = "" }: { 
  active?: boolean; 
  payload?: Array<{ value: number; name: string }>; 
  label?: string;
  prefix?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          {prefix}{payload[0].value} {payload[0].name === "earnings" ? "" : "sesiones"}
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
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-12" />
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
    <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
      <Skeleton className="size-12 rounded-full" />
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
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="text-center py-8">
      <div className="size-12 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-3">
        <Icon className="size-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
      <p className="text-xs text-muted-foreground/70">{description}</p>
    </div>
  );
}

export default function TutorDashboardHome() {
  const { user, profile } = useAuthStore();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    todaySessions: 0,
    monthlyEarnings: 0,
    totalStudents: 0,
    averageRating: 0,
    weeklyGrowth: 0,
    completedSessions: 0,
  });
  const [todaysSessions, setTodaysSessions] = useState<TodaySession[]>([]);
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);
  const [earningsData, setEarningsData] = useState<EarningsData[]>([]);
  const [sessionsData, setSessionsData] = useState<SessionsData[]>([]);
  const [performance, setPerformance] = useState<TutorPerformance>({
    responseRate: 0,
    completionRate: 0,
    recommendationRate: 0,
  });

  const displayName = profile?.full_name?.split(" ")[0] || "Tutor";

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return;

    const userId = user.id;

    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get current month range
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        // Get week range for weekly sessions chart
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());

        // Fetch all data in parallel
        const [
          sessionsResult,
          todaySessionsResult,
          reviewsResult,
          tutorProfileResult,
          paymentsResult,
        ] = await Promise.all([
          // Get all sessions for this tutor
          supabase
            .from("sessions")
            .select("id, status, scheduled_at, price, student_id")
            .eq("tutor_id", userId),
          
          // Get today's sessions with student info
          supabase
            .from("sessions")
            .select(`
              id,
              scheduled_at,
              duration_minutes,
              status,
              subject:subjects(name),
              student:profiles!sessions_student_id_fkey(full_name, avatar_url)
            `)
            .eq("tutor_id", userId)
            .gte("scheduled_at", today.toISOString())
            .lt("scheduled_at", tomorrow.toISOString())
            .order("scheduled_at", { ascending: true }),
          
          // Get recent reviews
          supabase
            .from("reviews")
            .select(`
              id,
              rating,
              comment,
              tags,
              created_at,
              student:profiles!reviews_student_id_fkey(full_name, avatar_url)
            `)
            .eq("tutor_id", userId)
            .order("created_at", { ascending: false })
            .limit(3),
          
          // Get tutor profile for performance metrics
          supabase
            .from("tutor_profiles")
            .select("rating, total_reviews, total_sessions, recommendation_rate")
            .eq("user_id", userId)
            .single(),
          
          // Get payments for earnings
          supabase
            .from("payments")
            .select("amount, created_at, status")
            .eq("user_id", userId)
            .eq("status", "completed")
            .gte("created_at", new Date(today.getFullYear() - 1, today.getMonth(), 1).toISOString()),
        ]);

        // Process sessions data
        const allSessions = sessionsResult.data || [];
        const completedSessions = allSessions.filter(s => s.status === "completed");
        
        // Count unique students
        const uniqueStudents = new Set(allSessions.map(s => s.student_id)).size;
        
        // Today's sessions count
        const todayCount = (todaySessionsResult.data || []).length;
        
        // Calculate monthly earnings from completed session prices
        const monthlyEarnings = completedSessions
          .filter(s => {
            const date = new Date(s.scheduled_at);
            return date >= monthStart && date <= monthEnd;
          })
          .reduce((sum, s) => sum + (s.price || 0), 0);

        // Calculate weekly growth (compare this week vs last week)
        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        
        const thisWeekSessions = allSessions.filter(s => new Date(s.scheduled_at) >= weekStart).length;
        const lastWeekSessions = allSessions.filter(s => {
          const date = new Date(s.scheduled_at);
          return date >= lastWeekStart && date < weekStart;
        }).length;
        
        const weeklyGrowth = lastWeekSessions > 0 
          ? Math.round(((thisWeekSessions - lastWeekSessions) / lastWeekSessions) * 100)
          : 0;

        // Calculate earnings data for last 6 months
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const earningsMap = new Map<string, number>();
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          earningsMap.set(monthNames[date.getMonth()], 0);
        }
        
        (paymentsResult.data || []).forEach(p => {
          const date = new Date(p.created_at);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          
          if (date > sixMonthsAgo) {
            const month = monthNames[date.getMonth()];
            earningsMap.set(month, (earningsMap.get(month) || 0) + p.amount);
          }
        });
        
        const processedEarnings = Array.from(earningsMap.entries()).map(([month, earnings]) => ({
          month,
          earnings,
        }));

        // Calculate weekly sessions data
        const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        const sessionsMap = new Map<string, number>();
        dayNames.forEach(day => sessionsMap.set(day, 0));
        
        allSessions
          .filter(s => new Date(s.scheduled_at) >= weekStart)
          .forEach(s => {
            const dayIndex = new Date(s.scheduled_at).getDay();
            const day = dayNames[dayIndex];
            sessionsMap.set(day, (sessionsMap.get(day) || 0) + 1);
          });
        
        // Reorder to start from Monday
        const orderedDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        const processedSessions = orderedDays.map(day => ({
          day,
          sessions: sessionsMap.get(day) || 0,
        }));

        // Process today's sessions
        const processedTodaysSessions: TodaySession[] = (todaySessionsResult.data || []).map((s) => {
          const subject = Array.isArray(s.subject) ? s.subject[0] : s.subject;
          const student = Array.isArray(s.student) ? s.student[0] : s.student;
          const scheduledAt = new Date(s.scheduled_at);
          
          return {
            id: s.id,
            studentName: student?.full_name || "Estudiante",
            studentAvatar: student?.avatar_url || null,
            subject: subject?.name || "Sesión",
            time: scheduledAt.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
            durationMinutes: s.duration_minutes,
            status: s.status,
          };
        });

        // Process recent reviews
        const processedReviews: RecentReview[] = (reviewsResult.data || []).map((r) => {
          const student = Array.isArray(r.student) ? r.student[0] : r.student;
          
          return {
            id: r.id,
            studentName: student?.full_name || "Estudiante",
            studentAvatar: student?.avatar_url || null,
            rating: r.rating,
            comment: r.comment,
            tags: r.tags || [],
            createdAt: new Date(r.created_at),
          };
        });

        // Get performance metrics
        const tutorProfile = tutorProfileResult.data;
        const completionRate = tutorProfile?.total_sessions 
          ? Math.round((completedSessions.length / allSessions.length) * 100) || 0
          : 0;

        // Update state
        setStats({
          todaySessions: todayCount,
          monthlyEarnings,
          totalStudents: uniqueStudents,
          averageRating: tutorProfile?.rating || 0,
          weeklyGrowth,
          completedSessions: completedSessions.length,
        });
        setTodaysSessions(processedTodaysSessions);
        setRecentReviews(processedReviews);
        setEarningsData(processedEarnings);
        setSessionsData(processedSessions);
        setPerformance({
          responseRate: 95, // TODO: Calculate from actual data
          completionRate,
          recommendationRate: tutorProfile?.recommendation_rate || 0,
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
              Gestiona tus sesiones y revisa tu rendimiento
            </p>
          </div>
          <Link to="/tutor/disponibilidad">
            <Button className="gap-2">
              <CalendarClock className="size-4" />
              Configurar Disponibilidad
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
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
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.todaySessions}
                    </p>
                    <p className="text-xs text-muted-foreground">Sesiones hoy</p>
                  </div>
                </div>
              </CardContent>
              <div className="absolute -right-4 -bottom-4 size-20 rounded-full bg-primary/5" />
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <DollarSign className="size-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      S/ {stats.monthlyEarnings}
                    </p>
                    <p className="text-xs text-muted-foreground">Este mes</p>
                  </div>
                </div>
                {stats.weeklyGrowth !== 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className={`text-xs ${stats.weeklyGrowth > 0 ? "text-success" : "text-destructive"}`}>
                      {stats.weeklyGrowth > 0 ? "+" : ""}{stats.weeklyGrowth}%
                    </Badge>
                  </div>
                )}
              </CardContent>
              <div className="absolute -right-4 -bottom-4 size-20 rounded-full bg-success/5" />
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Users className="size-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.totalStudents}
                    </p>
                    <p className="text-xs text-muted-foreground">Estudiantes</p>
                  </div>
                </div>
              </CardContent>
              <div className="absolute -right-4 -bottom-4 size-20 rounded-full bg-accent/5" />
            </Card>

            <Card className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Star className="size-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {stats.averageRating ? stats.averageRating.toFixed(1) : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                </div>
              </CardContent>
              <div className="absolute -right-4 -bottom-4 size-20 rounded-full bg-warning/5" />
            </Card>
          </>
        )}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Today's Schedule & Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Sessions */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">Agenda de Hoy</CardTitle>
                  <CardDescription>Tus sesiones programadas para hoy</CardDescription>
                </div>
                <Link to="/tutor/sesiones">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Ver todas <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    <SessionItemSkeleton />
                    <SessionItemSkeleton />
                  </div>
                ) : todaysSessions.length === 0 ? (
                  <EmptyState
                    icon={CalendarOff}
                    title="Sin sesiones hoy"
                    description="No tienes sesiones programadas para hoy"
                  />
                ) : (
                  <div className="space-y-3">
                    {todaysSessions.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <Avatar className="size-12 border-2 border-background shadow-sm">
                          <AvatarImage src={session.studentAvatar || undefined} />
                          <AvatarFallback>{session.studentName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground truncate">
                              {session.subject}
                            </h4>
                            {session.status === "completed" ? (
                              <CheckCircle2 className="size-4 text-success shrink-0" />
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                {session.durationMinutes} min
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            con {session.studentName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {session.time}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.status === "completed" ? "Completada" : "Pendiente"}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Earnings Chart */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ganancias Mensuales</CardTitle>
                <CardDescription>Tu progreso financiero este año</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                ) : earningsData.every(e => e.earnings === 0) ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <EmptyState
                      icon={DollarSign}
                      title="Sin ganancias aún"
                      description="Completa sesiones para ver tus ganancias aquí"
                    />
                  </div>
                ) : (
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={earningsData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
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
                          width={50}
                          tickFormatter={(value) => `S/${value}`}
                        />
                        <Tooltip content={<CustomTooltip prefix="S/ " />} />
                        <Bar
                          dataKey="earnings"
                          name="earnings"
                          fill="hsl(var(--success))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Sessions Chart */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sesiones esta Semana</CardTitle>
                <CardDescription>Distribución de tus sesiones</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  </div>
                ) : sessionsData.every(s => s.sessions === 0) ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <EmptyState
                      icon={Calendar}
                      title="Sin sesiones esta semana"
                      description="Aún no tienes sesiones programadas esta semana"
                    />
                  </div>
                ) : (
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={sessionsData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="day"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                          width={30}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          dataKey="sessions"
                          name="sessions"
                          type="monotone"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 0 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Stats & Reviews */}
        <div className="space-y-6">
          {/* Performance Card */}
          <motion.div variants={itemVariants}>
            {isLoading ? (
              <Card className="bg-gradient-to-br from-primary to-primary/80">
                <CardContent className="p-5">
                  <Skeleton className="h-5 w-28 bg-white/20 mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-full bg-white/20" />
                    <Skeleton className="h-8 w-full bg-white/20" />
                    <Skeleton className="h-8 w-full bg-white/20" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="size-5" />
                    <h3 className="font-semibold">Rendimiento</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-primary-foreground/80">Tasa de respuesta</span>
                        <span className="font-medium">{performance.responseRate}%</span>
                      </div>
                      <Progress value={performance.responseRate} className="h-2 bg-white/20" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-primary-foreground/80">Sesiones completadas</span>
                        <span className="font-medium">{performance.completionRate}%</span>
                      </div>
                      <Progress value={performance.completionRate} className="h-2 bg-white/20" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-primary-foreground/80">Recomendaciones</span>
                        <span className="font-medium">{performance.recommendationRate}%</span>
                      </div>
                      <Progress value={performance.recommendationRate} className="h-2 bg-white/20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Recent Reviews */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">Reseñas Recientes</CardTitle>
                  <CardDescription>Lo que dicen tus estudiantes</CardDescription>
                </div>
                <Link to="/tutor/resenas">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Ver todas <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="size-8 rounded-full" />
                          <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                ) : recentReviews.length === 0 ? (
                  <EmptyState
                    icon={MessageSquare}
                    title="Sin reseñas aún"
                    description="Completa sesiones para recibir reseñas"
                  />
                ) : (
                  <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <div key={review.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8">
                            <AvatarImage src={review.studentAvatar || undefined} />
                            <AvatarFallback>{review.studentName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{review.studentName}</p>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`size-3 ${
                                    i < review.rating
                                      ? "text-warning fill-warning"
                                      : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">
                            "{review.comment}"
                          </p>
                        )}
                        {review.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {review.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
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
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Link to="/tutor/disponibilidad">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5">
                    <CalendarClock className="size-5 text-primary" />
                    <span className="text-xs">Disponibilidad</span>
                  </Button>
                </Link>
                <Link to="/tutor/sesiones">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5">
                    <Calendar className="size-5 text-primary" />
                    <span className="text-xs">Sesiones</span>
                  </Button>
                </Link>
                <Link to="/tutor/estudiantes">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5">
                    <Users className="size-5 text-primary" />
                    <span className="text-xs">Estudiantes</span>
                  </Button>
                </Link>
                <Link to="/tutor/ganancias">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5">
                    <DollarSign className="size-5 text-primary" />
                    <span className="text-xs">Ganancias</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Complete Profile Alert */}
          {!profile?.onboarding_completed && (
            <motion.div variants={itemVariants}>
              <Card className="border-warning/50 bg-warning/5">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="size-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">
                        Completa tu perfil
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Agrega tus materias y disponibilidad para empezar a recibir reservas.
                      </p>
                      <Link to="/tutor/perfil">
                        <Button size="sm" className="mt-3">
                          Completar perfil
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
