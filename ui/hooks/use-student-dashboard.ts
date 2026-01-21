import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/ui/lib/supabase";

// Types
export interface UpcomingSession {
  id: string;
  tutorName: string;
  tutorAvatar: string | null;
  subject: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: string;
}

export interface FavoriteTutor {
  id: string;
  name: string;
  avatar: string | null;
  specialty: string;
  rating: number;
  university: string;
}

export interface DashboardStats {
  upcomingSessions: number;
  availableSessions: number;
  completedSessions: number;
  averageRating: number;
}

export interface SessionActivity {
  month: string;
  sessions: number;
}

export interface SubscriptionInfo {
  planName: string;
  planTier: string;
  sessionsUsed: number;
  sessionsTotal: number;
}

export interface StudentDashboardData {
  stats: DashboardStats;
  upcomingSessions: UpcomingSession[];
  favoriteTutors: FavoriteTutor[];
  sessionActivity: SessionActivity[];
  subscription: SubscriptionInfo | null;
}

async function fetchStudentDashboardData(userId: string): Promise<StudentDashboardData> {
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
    
    // Get reviews given by this student
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
  
  const sessionActivity = Array.from(activityMap.entries()).map(([month, sessions]) => ({
    month,
    sessions,
  }));

  // Process upcoming sessions
  const processedUpcoming: UpcomingSession[] = (upcomingResult.data || []).map((s) => {
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

  // Process favorites
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
  let subscription: SubscriptionInfo | null = null;
  if (subscriptionResult.data && !subscriptionResult.error) {
    const sub = subscriptionResult.data;
    const plan = Array.isArray(sub.plan) ? sub.plan[0] : sub.plan;
    
    if (plan) {
      subscription = {
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

  return {
    stats: {
      upcomingSessions: upcoming,
      availableSessions: subscriptionResult.data?.sessions_remaining || 0,
      completedSessions: completed,
      averageRating: Math.round(avgRating * 10) / 10,
    },
    upcomingSessions: processedUpcoming,
    favoriteTutors: processedFavorites,
    sessionActivity,
    subscription,
  };
}

export function useStudentDashboard(userId: string | undefined) {
  return useQuery({
    queryKey: ["student-dashboard", userId],
    queryFn: () => fetchStudentDashboardData(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
