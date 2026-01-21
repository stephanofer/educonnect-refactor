// User types
export type UserRole = 'student' | 'tutor';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  university?: string;
  career?: string;
  semester?: number;
  bio?: string;
  plan_id?: string;
  sessions_remaining: number;
}

export interface TutorProfile {
  id: string;
  user_id: string;
  university: string;
  career: string;
  bio: string;
  specialties: string[];
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  total_sessions: number;
  is_verified: boolean;
  is_available: boolean;
  recommendation_rate: number;
}

// Session types
export type SessionStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface Session {
  id: string;
  student_id: string;
  tutor_id: string;
  subject_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: SessionStatus;
  description?: string;
  meeting_url?: string;
  recording_url?: string;
  summary?: string;
  created_at: string;
}

// Subject/Course types
export interface Subject {
  id: string;
  name: string;
  category: string;
  icon?: string;
}

// Review types
export interface Review {
  id: string;
  session_id: string;
  student_id: string;
  tutor_id: string;
  rating: number;
  comment?: string;
  tags: string[];
  created_at: string;
}

// Plan types
export type PlanTier = 'basic' | 'premium' | 'ultra';

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  price: number;
  sessions_included: number;
  features: string[];
  recording_days?: number;
  has_ai_summaries?: boolean;
  has_priority_booking?: boolean;
  is_active?: boolean;
  is_popular?: boolean;
}

// Subscription types
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan?: Plan; // Nested plan data
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  sessions_remaining: number;
  cancelled_at?: string;
  cancel_reason?: string;
}

// For the subscription with full plan details
export interface SubscriptionWithPlan extends Omit<Subscription, 'plan'> {
  plan: Plan;
}

// Notification types
export type NotificationType = 
  | 'session_confirmed'
  | 'session_reminder'
  | 'session_cancelled'
  | 'session_rescheduled'
  | 'new_review'
  | 'payment_success';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  data?: Record<string, unknown>;
  created_at: string;
}

// Library/Material types
export type MaterialType = 'pdf' | 'video' | 'link' | 'document';

export interface Material {
  id: string;
  tutor_id: string;
  session_id?: string;
  title: string;
  description?: string;
  type: MaterialType;
  file_url?: string;
  external_url?: string;
  subject_id?: string;
  is_public: boolean;
  created_at: string;
}

// Availability types
export interface TutorAvailability {
  id: string;
  tutor_id: string;
  day_of_week: number; // 0-6, Sunday-Saturday
  start_time: string; // HH:mm format
  end_time: string;
  is_active: boolean;
}

// Payment types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description: string;
  payment_method: string;
  invoice_url?: string;
  created_at: string;
}

// Chat message types (for AI chatbot)
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Testimonial type (for landing page)
export interface Testimonial {
  id: string;
  name: string;
  university: string;
  avatar_url: string;
  rating: number;
  comment: string;
}
