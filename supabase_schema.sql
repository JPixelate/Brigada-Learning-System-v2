-- Lumina LMS Supabase Schema
-- Simply copy and paste this into the Supabase SQL Editor and run it.
-- We are using `text` for IDs to perfectly match the existing mock data IDs.

-- 1. Employees (Users)
CREATE TABLE IF NOT EXISTS public.employees (
  id text PRIMARY KEY,
  first_name text,
  last_name text,
  email text UNIQUE,
  department text,
  business_unit text,
  role text,
  admin_role text,
  employee_status text,
  employment_status text,
  transfer_status text,
  contract_type text,
  band_id text,
  position text,
  image_url text,
  last_active text,
  created_at text
);

-- 2. Modules
CREATE TABLE IF NOT EXISTS public.modules (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text,
  description text,
  instructor text,
  students_enrolled integer DEFAULT 0,
  status text,
  last_updated text,
  thumbnail text,
  duration text,
  sections jsonb,
  settings jsonb
);

-- 3. Enrollments
CREATE TABLE IF NOT EXISTS public.enrollments (
  id text PRIMARY KEY,
  employee_id text REFERENCES public.employees(id) ON DELETE CASCADE,
  module_id text REFERENCES public.modules(id) ON DELETE CASCADE,
  enrolled_date text,
  status text,
  progress numeric,
  last_accessed_date text,
  completed_date text,
  current_section_id text,
  current_component_id text,
  retake_count integer DEFAULT 0,
  evaluator_note text,
  submitted_for_evaluation_date text,
  evaluated_date text
);

-- 4. Learning Paths
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  module_count integer DEFAULT 0,
  enrolled_count integer DEFAULT 0,
  duration text,
  status text,
  target_audience text,
  modules jsonb
);

-- 5. Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text,
  content text,
  audience text,
  date text,
  pinned boolean DEFAULT false,
  priority text,
  status text,
  author text,
  reads integer DEFAULT 0
);

-- 6. Calendar Events
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id text PRIMARY KEY,
  day numeric,
  month text,
  title text,
  subtitle text,
  time text,
  type text,
  location text,
  attendees integer,
  color text,
  date text
);

-- 7. Certificate Templates
CREATE TABLE IF NOT EXISTS public.certificates (
  id text PRIMARY KEY,
  name text NOT NULL,
  issued integer DEFAULT 0,
  template text,
  business_unit text,
  module_type text,
  signatories jsonb,
  primary_color text,
  background_image text,
  last_issued text
);

-- Seed Universal Certificate Template
INSERT INTO public.certificates (id, name, issued, template, business_unit, module_type, signatories, primary_color, background_image, last_issued)
VALUES ('1', 'Academy Universal Certificate', 1406, 'Universal Premium', 'All Units', 'General', '[{"name": "Jonald Penpillo", "title": "Chief Executive Officer"}, {"name": "Alex Morgan", "title": "VP of Engineering"}]', '#0f172a', '/images/academy_cert_bg.webp', 'Feb 23, 2026')
ON CONFLICT (id) DO NOTHING;

-- 8. Component Progress
CREATE TABLE IF NOT EXISTS public.employee_certificates (
  id text PRIMARY KEY,
  employee_id text REFERENCES public.employees(id) ON DELETE CASCADE,
  certificate_template_id text,
  module_id text REFERENCES public.modules(id) ON DELETE CASCADE,
  issued_date text,
  certificate_number text,
  score numeric
);

-- 10. Quiz Attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id text PRIMARY KEY,
  employee_id text REFERENCES public.employees(id) ON DELETE CASCADE,
  module_id text REFERENCES public.modules(id) ON DELETE CASCADE,
  score numeric,
  total_questions integer,
  correct_answers integer,
  date text,
  attempt_number integer
);

-- 11. Learning Path Enrollments
CREATE TABLE IF NOT EXISTS public.learning_path_enrollments (
  id text PRIMARY KEY,
  employee_id text REFERENCES public.employees(id) ON DELETE CASCADE,
  path_id text REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  enrolled_date text,
  status text,
  progress numeric,
  completed_date text
);

-- 12. Module Evaluations (Explicit Table)
CREATE TABLE IF NOT EXISTS public.module_evaluations (
  id text PRIMARY KEY,
  enrollment_id text REFERENCES public.enrollments(id) ON DELETE CASCADE,
  employee_id text REFERENCES public.employees(id) ON DELETE CASCADE,
  module_id text REFERENCES public.modules(id) ON DELETE CASCADE,
  submitted_date text,
  status text,
  retake_count integer,
  evaluator_note text,
  evaluated_date text
);

-- 13. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id text PRIMARY KEY,
  user_id text REFERENCES public.employees(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  type text,
  read boolean DEFAULT false,
  date text
);

-- 14. Roles
CREATE TABLE IF NOT EXISTS public.roles (
  id text PRIMARY KEY,
  name text NOT NULL,
  members integer DEFAULT 0,
  permissions text,
  created text
);

-- 15. Settings Sections
CREATE TABLE IF NOT EXISTS public.settings_sections (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text,
  options jsonb
);

-- 16. Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id text PRIMARY KEY,
  sender_id text REFERENCES public.employees(id) ON DELETE CASCADE,
  receiver_id text REFERENCES public.employees(id) ON DELETE CASCADE,
  content text NOT NULL,
  timestamp text,
  read boolean DEFAULT false
);

-- Enable Realtime for specific tables
-- Note: In Supabase UI you usually do this via 'Replication' but we can add placeholders for SQL notes
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
