-- ========================================================
-- COCREATE BACKEND: DATABASE SCHEMA, RLS & TRIGGERS
-- Supabase PostgreSQL Migration
-- ========================================================
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ========================================================

-- --------------------------------------------------------
-- 1. PUBLIC PROFILES TABLE
-- --------------------------------------------------------
-- Linked to auth.users via CASCADE foreign key.
-- Username: unique, NOT NULL, minimum 3 characters enforced via CHECK.
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL UNIQUE
              CHECK (char_length(username) >= 3),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Add a comment for documentation
COMMENT ON TABLE public.profiles IS 'User public profiles linked 1:1 to auth.users';

-- --------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS)
-- --------------------------------------------------------
-- Enforced policies:
--   SELECT: Any authenticated user can read any profile.
--   INSERT: Only the owner (auth.uid() = id) can insert their own row.
--   UPDATE: Only the owner (auth.uid() = id) can update their own row.
--   DELETE: Disabled (profiles are only removed via CASCADE from auth.users).
-- --------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent migration)
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- SELECT: Authenticated read access
CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Owner-only
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: Owner-only
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- --------------------------------------------------------
-- 3. AUTOMATIC PROFILE CREATION TRIGGER
-- --------------------------------------------------------
-- When a new user signs up via Supabase Auth, this trigger
-- automatically creates their row in public.profiles.
-- The username is derived from:
--   1. The 'username' field in raw_user_meta_data (if provided at signup), OR
--   2. The local-part of the email address (before '@').
-- ON CONFLICT: Does nothing if a row already exists for that user.
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
      SPLIT_PART(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger for idempotency
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------
-- 4. INDEXES FOR PERFORMANCE
-- --------------------------------------------------------
-- Fast username lookups for duplicate checks during registration.
-- --------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_profiles_username
  ON public.profiles (username);
