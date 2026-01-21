-- ============================================
-- EDUCONNECT DATABASE SCHEMA
-- Complete schema for Supabase
-- Run this in SQL Editor after resetting your database
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM ('student', 'tutor', 'admin');

-- Session status
CREATE TYPE session_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');

-- Subscription status
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'past_due');

-- Plan tiers
CREATE TYPE plan_tier AS ENUM ('basic', 'premium', 'ultra');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'session_confirmed',
  'session_reminder_24h',
  'session_reminder_1h',
  'session_reminder_15min',
  'session_reminder_1min',
  'session_cancelled',
  'session_rescheduled',
  'session_completed',
  'new_review',
  'payment_success',
  'payment_failed',
  'new_material',
  'plan_expiring',
  'welcome'
);

-- Material types
CREATE TYPE material_type AS ENUM ('pdf', 'video', 'link', 'document', 'image');

-- ============================================
-- TABLES
-- ============================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'student',
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student profiles
CREATE TABLE student_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  university TEXT,
  career TEXT,
  semester INTEGER,
  bio TEXT,
  interests TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tutor profiles
CREATE TABLE tutor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  university TEXT NOT NULL,
  career TEXT NOT NULL,
  bio TEXT,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 25.00,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  recommendation_rate DECIMAL(5, 2) DEFAULT 0.00,
  is_verified BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  verification_document_url TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Subjects/Courses
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tutor specialties (many-to-many)
CREATE TABLE tutor_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  experience_years INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tutor_id, subject_id)
);

-- Tutor availability
CREATE TABLE tutor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES tutor_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Plans
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tier plan_tier NOT NULL UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  sessions_included INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '[]',
  recording_days INTEGER DEFAULT 7,
  has_ai_summaries BOOLEAN DEFAULT false,
  has_priority_booking BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  sessions_remaining INTEGER NOT NULL DEFAULT 0,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions (tutoring sessions)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id),
  subscription_id UUID REFERENCES subscriptions(id),
  status session_status NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  description TEXT,
  notes TEXT,
  meeting_url TEXT,
  meeting_room_name TEXT,
  recording_url TEXT,
  summary TEXT,
  price DECIMAL(10, 2),
  cancelled_by UUID REFERENCES profiles(id),
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  tags TEXT[] DEFAULT '{}',
  would_recommend BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id)
);

-- Favorites
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, tutor_id)
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  session_id UUID REFERENCES sessions(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PEN',
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  description TEXT NOT NULL,
  invoice_url TEXT,
  invoice_number TEXT,
  external_payment_id TEXT,
  metadata JSONB DEFAULT '{}',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materials
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES subjects(id),
  title TEXT NOT NULL,
  description TEXT,
  type material_type NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  external_url TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Material access
CREATE TABLE material_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(material_id, student_id)
);

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_tutor_profiles_user_id ON tutor_profiles(user_id);
CREATE INDEX idx_tutor_profiles_rating ON tutor_profiles(rating DESC);
CREATE INDEX idx_tutor_profiles_is_verified ON tutor_profiles(is_verified);
CREATE INDEX idx_tutor_profiles_is_available ON tutor_profiles(is_available);
CREATE INDEX idx_tutor_profiles_specialties ON tutor_profiles USING GIN(specialties);
CREATE INDEX idx_sessions_student_id ON sessions(student_id);
CREATE INDEX idx_sessions_tutor_id ON sessions(tutor_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(current_period_end);
CREATE INDEX idx_reviews_tutor_id ON reviews(tutor_id);
CREATE INDEX idx_reviews_student_id ON reviews(student_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_materials_tutor_id ON materials(tutor_id);
CREATE INDEX idx_materials_session_id ON materials(session_id);
CREATE INDEX idx_materials_subject_id ON materials(subject_id);
CREATE INDEX idx_materials_is_public ON materials(is_public);
CREATE INDEX idx_favorites_student_id ON favorites(student_id);
CREATE INDEX idx_favorites_tutor_id ON favorites(tutor_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update tutor rating after review
CREATE OR REPLACE FUNCTION update_tutor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tutor_profiles
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE tutor_id = NEW.tutor_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE tutor_id = NEW.tutor_id
    ),
    recommendation_rate = (
      SELECT COALESCE(
        (COUNT(*) FILTER (WHERE would_recommend = true)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
        0
      )
      FROM reviews
      WHERE tutor_id = NEW.tutor_id
    ),
    updated_at = NOW()
  WHERE user_id = NEW.tutor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Increment tutor session count
CREATE OR REPLACE FUNCTION update_tutor_session_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE tutor_profiles
    SET 
      total_sessions = total_sessions + 1,
      updated_at = NOW()
    WHERE user_id = NEW.tutor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profile after user signup (CRITICAL FOR AUTH TO WORK)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'role', '')::user_role,
      'student'::user_role
    )
  );
  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutor_profiles_updated_at
  BEFORE UPDATE ON tutor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutor_availability_updated_at
  BEFORE UPDATE ON tutor_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Business logic triggers
CREATE TRIGGER trigger_update_tutor_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_tutor_rating();

CREATE TRIGGER trigger_update_tutor_session_count
  AFTER UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_tutor_session_count();

-- CRITICAL: Create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- PROFILES
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- STUDENT PROFILES
CREATE POLICY "student_profiles_select" ON student_profiles
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'tutor')
  );

CREATE POLICY "student_profiles_insert" ON student_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "student_profiles_update" ON student_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- TUTOR PROFILES
CREATE POLICY "tutor_profiles_select_all" ON tutor_profiles
  FOR SELECT USING (true);

CREATE POLICY "tutor_profiles_insert" ON tutor_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tutor_profiles_update" ON tutor_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- SUBJECTS
CREATE POLICY "subjects_select_all" ON subjects
  FOR SELECT USING (true);

-- TUTOR SUBJECTS
CREATE POLICY "tutor_subjects_select_all" ON tutor_subjects
  FOR SELECT USING (true);

CREATE POLICY "tutor_subjects_insert" ON tutor_subjects
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM tutor_profiles WHERE id = tutor_id AND user_id = auth.uid())
  );

CREATE POLICY "tutor_subjects_update" ON tutor_subjects
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM tutor_profiles WHERE id = tutor_id AND user_id = auth.uid())
  );

CREATE POLICY "tutor_subjects_delete" ON tutor_subjects
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM tutor_profiles WHERE id = tutor_id AND user_id = auth.uid())
  );

-- TUTOR AVAILABILITY
CREATE POLICY "tutor_availability_select_all" ON tutor_availability
  FOR SELECT USING (true);

CREATE POLICY "tutor_availability_insert" ON tutor_availability
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM tutor_profiles WHERE id = tutor_id AND user_id = auth.uid())
  );

CREATE POLICY "tutor_availability_update" ON tutor_availability
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM tutor_profiles WHERE id = tutor_id AND user_id = auth.uid())
  );

CREATE POLICY "tutor_availability_delete" ON tutor_availability
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM tutor_profiles WHERE id = tutor_id AND user_id = auth.uid())
  );

-- PLANS
CREATE POLICY "plans_select_all" ON plans
  FOR SELECT USING (true);

-- SUBSCRIPTIONS
CREATE POLICY "subscriptions_select_own" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_insert_own" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- SESSIONS
CREATE POLICY "sessions_select_own" ON sessions
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = tutor_id);

CREATE POLICY "sessions_insert_student" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "sessions_update_participants" ON sessions
  FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = tutor_id);

-- REVIEWS
CREATE POLICY "reviews_select" ON reviews
  FOR SELECT USING (is_public = true OR auth.uid() = student_id OR auth.uid() = tutor_id);

CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (
      SELECT 1 FROM sessions
      WHERE id = session_id AND student_id = auth.uid() AND status = 'completed'
    )
  );

-- FAVORITES
CREATE POLICY "favorites_select_own" ON favorites
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "favorites_insert_own" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "favorites_delete_own" ON favorites
  FOR DELETE USING (auth.uid() = student_id);

-- PAYMENTS
CREATE POLICY "payments_select_own" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- MATERIALS
CREATE POLICY "materials_select_public" ON materials
  FOR SELECT USING (
    is_public = true AND
    EXISTS (SELECT 1 FROM subscriptions WHERE user_id = auth.uid() AND status = 'active')
  );

CREATE POLICY "materials_select_session" ON materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE id = session_id AND (student_id = auth.uid() OR tutor_id = auth.uid())
    )
  );

CREATE POLICY "materials_select_own" ON materials
  FOR SELECT USING (auth.uid() = tutor_id);

CREATE POLICY "materials_insert_tutor" ON materials
  FOR INSERT WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "materials_update_tutor" ON materials
  FOR UPDATE USING (auth.uid() = tutor_id);

CREATE POLICY "materials_delete_tutor" ON materials
  FOR DELETE USING (auth.uid() = tutor_id);

-- MATERIAL ACCESS
CREATE POLICY "material_access_select_own" ON material_access
  FOR SELECT USING (auth.uid() = student_id);

-- CHAT MESSAGES
CREATE POLICY "chat_messages_select" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "chat_messages_insert" ON chat_messages
  FOR INSERT WITH CHECK (true);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create buckets (run this separately if needed)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('materials', 'materials', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']),
  ('verification-documents', 'verification-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('session-recordings', 'session-recordings', false, 524288000, ARRAY['video/mp4', 'video/webm'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- AVATARS BUCKET (public)
CREATE POLICY "avatars_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "avatars_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- MATERIALS BUCKET
CREATE POLICY "materials_select_authenticated" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'materials' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "materials_insert_tutor" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'materials' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'tutor')
  );

CREATE POLICY "materials_update_tutor" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'materials' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "materials_delete_tutor" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'materials' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- VERIFICATION DOCUMENTS BUCKET
CREATE POLICY "verification_docs_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "verification_docs_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- SESSION RECORDINGS BUCKET
CREATE POLICY "recordings_select_participants" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'session-recordings' AND
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.meeting_room_name = (storage.foldername(name))[1]
      AND (s.student_id = auth.uid() OR s.tutor_id = auth.uid())
    )
  );

-- ============================================
-- SEED DATA
-- ============================================

-- Default plans
INSERT INTO plans (name, tier, price, sessions_included, features, recording_days, has_ai_summaries, has_priority_booking, is_popular) VALUES
  ('Basico', 'basic', 29.90, 2, '["2 sesiones incluidas", "Grabaciones por 7 dias", "Chat con tutor post-sesion", "Soporte por email"]', 7, false, false, false),
  ('Premium', 'premium', 59.90, 5, '["5 sesiones incluidas", "Grabaciones ilimitadas", "Resumenes por IA", "Chat prioritario", "Materiales de estudio"]', 365, true, false, true),
  ('Ultra', 'ultra', 99.90, 10, '["10 sesiones incluidas", "Todo lo de Premium", "Prioridad en reservas", "Tutor dedicado", "Soporte 24/7"]', 365, true, true, false);

-- Default subjects
INSERT INTO subjects (name, slug, category, icon) VALUES
  ('Matematicas', 'matematicas', 'Ciencias', 'Calculator'),
  ('Calculo I', 'calculo-1', 'Ciencias', 'Calculator'),
  ('Calculo II', 'calculo-2', 'Ciencias', 'Calculator'),
  ('Algebra Lineal', 'algebra-lineal', 'Ciencias', 'Calculator'),
  ('Estadistica', 'estadistica', 'Ciencias', 'TrendingUp'),
  ('Fisica I', 'fisica-1', 'Ciencias', 'Atom'),
  ('Fisica II', 'fisica-2', 'Ciencias', 'Atom'),
  ('Quimica General', 'quimica-general', 'Ciencias', 'FlaskConical'),
  ('Quimica Organica', 'quimica-organica', 'Ciencias', 'FlaskConical'),
  ('Biologia', 'biologia', 'Ciencias', 'Microscope'),
  ('Programacion', 'programacion', 'Tecnologia', 'Code'),
  ('Python', 'python', 'Tecnologia', 'Code'),
  ('JavaScript', 'javascript', 'Tecnologia', 'Code'),
  ('Base de Datos', 'base-de-datos', 'Tecnologia', 'Database'),
  ('Algoritmos', 'algoritmos', 'Tecnologia', 'Code'),
  ('Economia', 'economia', 'Negocios', 'TrendingUp'),
  ('Microeconomia', 'microeconomia', 'Negocios', 'TrendingUp'),
  ('Macroeconomia', 'macroeconomia', 'Negocios', 'TrendingUp'),
  ('Contabilidad', 'contabilidad', 'Negocios', 'Calculator'),
  ('Finanzas', 'finanzas', 'Negocios', 'Wallet'),
  ('Marketing', 'marketing', 'Negocios', 'Megaphone'),
  ('Ingles', 'ingles', 'Idiomas', 'Languages'),
  ('Ingles Tecnico', 'ingles-tecnico', 'Idiomas', 'Languages'),
  ('Redaccion Academica', 'redaccion-academica', 'Humanidades', 'PenTool'),
  ('Literatura', 'literatura', 'Humanidades', 'BookOpen'),
  ('Filosofia', 'filosofia', 'Humanidades', 'Brain'),
  ('Derecho', 'derecho', 'Humanidades', 'Scale'),
  ('Psicologia', 'psicologia', 'Humanidades', 'Brain');
