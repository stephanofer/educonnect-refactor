import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/ui/lib/supabase";

// Types
export interface TodaySession {
  id: string;
  studentName: string;
  studentAvatar: string | null;
  subject: string;
  time: string;
  durationMinutes: number;
  status: string;
}

export interface RecentReview {
  id: string;
  studentName: string;
  studentAvatar: string | null;
  rating: number;
  comment: string | null;
  tags: string[];
  createdAt: Date;
}

export interface TutorDashboardStats {
  todaySessions: number;
  monthlyEarnings: number;
  totalStudents: number;
  averageRating: number;
  weeklyGrowth: number;
  completedSessions: number;
}

export interface EarningsData {
  month: string;
  earnings: number;
}

export interface SessionsData {
  day: string;
  sessions: number;
}

export interface TutorPerformance {
  responseRate: number;
  completionRate: number;
  recommendationRate: number;
}

export interface TutorDashboardData {
  stats: TutorDashboardStats;
  todaysSessions: TodaySession[];
  recentReviews: RecentReview[];
  earningsData: EarningsData[];
  sessionsData: SessionsData[];
  performance: TutorPerformance;
}

async function fetchTutorDashboardData(userId: string): Promise<TutorDashboardData> {
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

  // Calculate weekly growth
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
  
  const earningsData = Array.from(earningsMap.entries()).map(([month, earnings]) => ({
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
  const sessionsData = orderedDays.map(day => ({
    day,
    sessions: sessionsMap.get(day) || 0,
  }));

  // Process today's sessions
  const todaysSessions: TodaySession[] = (todaySessionsResult.data || []).map((s) => {
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
  const recentReviews: RecentReview[] = (reviewsResult.data || []).map((r) => {
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
  const completionRate = allSessions.length > 0
    ? Math.round((completedSessions.length / allSessions.length) * 100)
    : 0;

  return {
    stats: {
      todaySessions: todayCount,
      monthlyEarnings,
      totalStudents: uniqueStudents,
      averageRating: tutorProfile?.rating || 0,
      weeklyGrowth,
      completedSessions: completedSessions.length,
    },
    todaysSessions,
    recentReviews,
    earningsData,
    sessionsData,
    performance: {
      responseRate: 95, // TODO: Calculate from actual data
      completionRate,
      recommendationRate: tutorProfile?.recommendation_rate || 0,
    },
  };
}

export function useTutorDashboard(userId: string | undefined) {
  return useQuery({
    queryKey: ["tutor-dashboard", userId],
    queryFn: () => fetchTutorDashboardData(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
