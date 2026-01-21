import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/ui/lib/supabase";
import type { Subject } from "@/ui/types";

// Query keys
const TUTOR_KEYS = {
  all: ["tutors"] as const,
  list: (filters: TutorFilters) => [...TUTOR_KEYS.all, "list", filters] as const,
  detail: (id: string) => [...TUTOR_KEYS.all, "detail", id] as const,
  availability: (id: string) => [...TUTOR_KEYS.all, "availability", id] as const,
  favorites: ["favorites"] as const,
};

// Types
export interface TutorFilters {
  search?: string;
  subjectId?: string;
  university?: string;
  minRating?: number;
  maxPrice?: number;
  isAvailable?: boolean;
}

export interface TutorListItem {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  university: string;
  career: string;
  bio: string | null;
  specialties: string[];
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  totalSessions: number;
  isVerified: boolean;
  isAvailable: boolean;
  isFavorite: boolean;
}

export interface TutorDetail extends TutorListItem {
  recommendationRate: number;
  subjects: Subject[];
  availability: TutorAvailabilitySlot[];
  recentReviews: TutorReview[];
}

export interface TutorAvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface TutorReview {
  id: string;
  studentName: string;
  studentAvatar: string | null;
  rating: number;
  comment: string | null;
  tags: string[];
  createdAt: string;
}

// Fetch tutors list
async function fetchTutors(
  filters: TutorFilters,
  userId?: string
): Promise<TutorListItem[]> {
  // Base query
  let query = supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      avatar_url,
      tutor_profile:tutor_profiles!inner(
        university,
        career,
        bio,
        specialties,
        hourly_rate,
        rating,
        total_reviews,
        total_sessions,
        is_verified,
        is_available
      )
    `)
    .eq("role", "tutor");

  // Apply filters
  if (filters.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,tutor_profiles.bio.ilike.%${filters.search}%`);
  }

  if (filters.university) {
    query = query.eq("tutor_profiles.university", filters.university);
  }

  if (filters.minRating) {
    query = query.gte("tutor_profiles.rating", filters.minRating);
  }

  if (filters.maxPrice) {
    query = query.lte("tutor_profiles.hourly_rate", filters.maxPrice);
  }

  if (filters.isAvailable !== undefined) {
    query = query.eq("tutor_profiles.is_available", filters.isAvailable);
  }

  // Order by rating desc
  query = query.order("rating", { referencedTable: "tutor_profiles", ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  // Get favorites if user is logged in
  let favoriteIds: Set<string> = new Set();
  if (userId) {
    const { data: favorites } = await supabase
      .from("favorites")
      .select("tutor_id")
      .eq("student_id", userId);
    
    favoriteIds = new Set((favorites || []).map(f => f.tutor_id));
  }

  // Filter by subject if needed (separate query since it's many-to-many)
  let filteredData = data || [];
  if (filters.subjectId) {
    const { data: tutorSubjects } = await supabase
      .from("tutor_subjects")
      .select("tutor_id, tutor:tutor_profiles!inner(user_id)")
      .eq("subject_id", filters.subjectId);
    
    const tutorUserIds = new Set(
      (tutorSubjects || []).map(ts => {
        const tutor = Array.isArray(ts.tutor) ? ts.tutor[0] : ts.tutor;
        return tutor?.user_id;
      }).filter(Boolean)
    );
    
    filteredData = filteredData.filter(t => tutorUserIds.has(t.id));
  }

  // Transform response
  return filteredData.map((item) => {
    const profile = Array.isArray(item.tutor_profile) 
      ? item.tutor_profile[0] 
      : item.tutor_profile;
    
    return {
      id: item.id,
      fullName: item.full_name,
      avatarUrl: item.avatar_url,
      university: profile?.university || "",
      career: profile?.career || "",
      bio: profile?.bio || null,
      specialties: profile?.specialties || [],
      hourlyRate: profile?.hourly_rate || 0,
      rating: profile?.rating || 0,
      totalReviews: profile?.total_reviews || 0,
      totalSessions: profile?.total_sessions || 0,
      isVerified: profile?.is_verified || false,
      isAvailable: profile?.is_available || false,
      isFavorite: favoriteIds.has(item.id),
    };
  });
}

// Hook to fetch tutors list
export function useTutors(filters: TutorFilters = {}, userId?: string) {
  return useQuery({
    queryKey: TUTOR_KEYS.list(filters),
    queryFn: () => fetchTutors(filters, userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Fetch tutor detail
async function fetchTutorDetail(
  tutorId: string,
  userId?: string
): Promise<TutorDetail | null> {
  // Get profile and tutor_profile
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      avatar_url,
      tutor_profile:tutor_profiles!inner(
        id,
        university,
        career,
        bio,
        specialties,
        hourly_rate,
        rating,
        total_reviews,
        total_sessions,
        is_verified,
        is_available,
        recommendation_rate
      )
    `)
    .eq("id", tutorId)
    .eq("role", "tutor")
    .single();

  if (profileError || !profileData) return null;

  const tutorProfile = Array.isArray(profileData.tutor_profile)
    ? profileData.tutor_profile[0]
    : profileData.tutor_profile;

  if (!tutorProfile) return null;

  // Get subjects, availability, reviews in parallel
  const [subjectsResult, availabilityResult, reviewsResult, favoriteResult] = await Promise.all([
    // Subjects
    supabase
      .from("tutor_subjects")
      .select("subject:subjects(id, name, category, icon)")
      .eq("tutor_id", tutorProfile.id),
    
    // Availability
    supabase
      .from("tutor_availability")
      .select("id, day_of_week, start_time, end_time, is_active")
      .eq("tutor_id", tutorProfile.id)
      .eq("is_active", true)
      .order("day_of_week"),
    
    // Recent reviews
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
      .eq("tutor_id", tutorId)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(5),
    
    // Check if favorite
    userId
      ? supabase
          .from("favorites")
          .select("id")
          .eq("student_id", userId)
          .eq("tutor_id", tutorId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  // Process subjects
  const subjects: Subject[] = (subjectsResult.data || []).map(s => {
    const subject = Array.isArray(s.subject) ? s.subject[0] : s.subject;
    return {
      id: subject?.id || "",
      name: subject?.name || "",
      category: subject?.category || "",
      icon: subject?.icon,
    };
  }).filter(s => s.id);

  // Process availability
  const availability: TutorAvailabilitySlot[] = (availabilityResult.data || []).map(a => ({
    id: a.id,
    dayOfWeek: a.day_of_week,
    startTime: a.start_time,
    endTime: a.end_time,
    isActive: a.is_active,
  }));

  // Process reviews
  const recentReviews: TutorReview[] = (reviewsResult.data || []).map(r => {
    const student = Array.isArray(r.student) ? r.student[0] : r.student;
    return {
      id: r.id,
      studentName: student?.full_name || "Estudiante",
      studentAvatar: student?.avatar_url || null,
      rating: r.rating,
      comment: r.comment,
      tags: r.tags || [],
      createdAt: r.created_at,
    };
  });

  return {
    id: profileData.id,
    fullName: profileData.full_name,
    avatarUrl: profileData.avatar_url,
    university: tutorProfile.university,
    career: tutorProfile.career,
    bio: tutorProfile.bio,
    specialties: tutorProfile.specialties || [],
    hourlyRate: tutorProfile.hourly_rate,
    rating: tutorProfile.rating,
    totalReviews: tutorProfile.total_reviews,
    totalSessions: tutorProfile.total_sessions,
    isVerified: tutorProfile.is_verified,
    isAvailable: tutorProfile.is_available,
    isFavorite: !!favoriteResult.data,
    recommendationRate: tutorProfile.recommendation_rate || 0,
    subjects,
    availability,
    recentReviews,
  };
}

// Hook to fetch tutor detail
export function useTutorDetail(tutorId: string | undefined, userId?: string) {
  return useQuery({
    queryKey: TUTOR_KEYS.detail(tutorId || ""),
    queryFn: () => fetchTutorDetail(tutorId!, userId),
    enabled: !!tutorId,
    staleTime: 1000 * 60 * 5,
  });
}

// Toggle favorite
async function toggleFavorite(params: { tutorId: string; studentId: string; isFavorite: boolean }) {
  const { tutorId, studentId, isFavorite } = params;
  
  if (isFavorite) {
    // Remove from favorites
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("student_id", studentId)
      .eq("tutor_id", tutorId);
    
    if (error) throw error;
  } else {
    // Add to favorites
    const { error } = await supabase
      .from("favorites")
      .insert({ student_id: studentId, tutor_id: tutorId });
    
    if (error) throw error;
  }
}

// Hook to toggle favorite
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFavorite,
    onSuccess: () => {
      // Invalidate tutors list and favorites
      queryClient.invalidateQueries({ queryKey: TUTOR_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TUTOR_KEYS.favorites });
    },
  });
}

// Fetch unique universities for filter
async function fetchUniversities(): Promise<string[]> {
  const { data, error } = await supabase
    .from("tutor_profiles")
    .select("university")
    .eq("is_available", true);

  if (error) throw error;

  const universities = [...new Set((data || []).map(d => d.university))].filter(Boolean);
  return universities.sort();
}

// Hook to fetch universities
export function useUniversities() {
  return useQuery({
    queryKey: ["universities"],
    queryFn: fetchUniversities,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Fetch subjects for filter
async function fetchSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, category, icon")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data || [];
}

// Hook to fetch subjects
export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: fetchSubjects,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
