-- SimulationHub WMO-C — User Profiles & Authorization System
-- Run this in the Supabase SQL Editor

-- ============================================================
-- USER PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'colaborador' CHECK (role IN ('admin', 'colaborador')),
  status      TEXT NOT NULL DEFAULT 'pending'     CHECK (status IN ('pending', 'approved', 'rejected')),
  page_access TEXT[] NOT NULL DEFAULT ARRAY['dashboard', 'projetos'],
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, status, page_access)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN NEW.email = 'caioof@weg.net' THEN 'admin' ELSE 'colaborador' END,
    CASE WHEN NEW.email = 'caioof@weg.net' THEN 'approved' ELSE 'pending' END,
    ARRAY['dashboard', 'projetos']
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Seed: create admin profile if caioof@weg.net already exists
-- ============================================================
INSERT INTO public.user_profiles (id, email, role, status, page_access)
SELECT id, email, 'admin', 'approved', ARRAY['dashboard', 'projetos']
FROM auth.users
WHERE email = 'caioof@weg.net'
ON CONFLICT (id) DO UPDATE
  SET role = 'admin', status = 'approved';

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile; admin reads all
CREATE POLICY "users_read_own_or_admin_reads_all"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR (auth.jwt() ->> 'email') = 'caioof@weg.net'
  );

-- Only admin can update any profile
CREATE POLICY "admin_update_profiles"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'caioof@weg.net')
  WITH CHECK ((auth.jwt() ->> 'email') = 'caioof@weg.net');

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email  ON public.user_profiles(email);
