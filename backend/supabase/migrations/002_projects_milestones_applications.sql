-- ========================================================
-- COCREATE BACKEND: PROJECTS, MILESTONES & APPLICATIONS SCHEMA
-- Supabase PostgreSQL Migration 002
-- ========================================================

-- --------------------------------------------------------
-- 1. PROJECTS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL CHECK (char_length(name) >= 3),
  type              TEXT NOT NULL CHECK (type IN ('game', 'software')),
  description       TEXT NOT NULL,
  max_revenue_share NUMERIC NOT NULL DEFAULT 30.00 CHECK (max_revenue_share <= 100.00 AND max_revenue_share >= 0),
  created_at        TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.projects IS 'Creator projects registered in CoCreate platform';

-- --------------------------------------------------------
-- 2. MILESTONES TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.milestones (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id            UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  description           TEXT,
  required_role         TEXT CHECK (required_role IN ('code', 'design', 'music', 'marketing')),
  revenue_share_percent NUMERIC NOT NULL CHECK (revenue_share_percent > 0 AND revenue_share_percent <= 100.00),
  status                TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'completed')),
  assigned_to           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.milestones IS 'Royalty milestones associated with projects';

-- --------------------------------------------------------
-- 3. APPLICATIONS TABLE
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id   UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  applicant_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  portfolio_link TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at     TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_applicant_per_milestone UNIQUE (milestone_id, applicant_id)
);

COMMENT ON TABLE public.applications IS 'Collaborator applications to royalty milestones';

-- --------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can read projects" ON public.projects;
DROP POLICY IF EXISTS "Owners can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Owners can update projects" ON public.projects;
DROP POLICY IF EXISTS "Owners can delete projects" ON public.projects;

DROP POLICY IF EXISTS "Authenticated users can read milestones" ON public.milestones;
DROP POLICY IF EXISTS "Project owners can insert milestones" ON public.milestones;
DROP POLICY IF EXISTS "Project owners can update milestones" ON public.milestones;
DROP POLICY IF EXISTS "Project owners can delete milestones" ON public.milestones;

DROP POLICY IF EXISTS "Authenticated users can read applications" ON public.applications;
DROP POLICY IF EXISTS "Applicants can insert own application" ON public.applications;
DROP POLICY IF EXISTS "Applicants can update own application" ON public.applications;

-- Projects RLS
CREATE POLICY "Authenticated users can read projects"
  ON public.projects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Owners can insert projects"
  ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update projects"
  ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete projects"
  ON public.projects FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Milestones RLS
CREATE POLICY "Authenticated users can read milestones"
  ON public.milestones FOR SELECT TO authenticated USING (true);

CREATE POLICY "Project owners can insert milestones"
  ON public.milestones FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = milestones.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update milestones"
  ON public.milestones FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = milestones.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can delete milestones"
  ON public.milestones FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = milestones.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Applications RLS
CREATE POLICY "Authenticated users can read applications"
  ON public.applications FOR SELECT TO authenticated USING (true);

CREATE POLICY "Applicants can insert own application"
  ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Applicants can update own application"
  ON public.applications FOR UPDATE TO authenticated USING (auth.uid() = applicant_id);

-- --------------------------------------------------------
-- 5. RPC FUNCTION: ATOMIC APPLICATION ACCEPTANCE
-- --------------------------------------------------------
-- Accepts an application, assigns applicant to milestone,
-- sets milestone to 'assigned', and rejects all other pending applications.
-- Ensures atomicity inside a Postgres transaction block.
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.accept_application(app_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_milestone_id UUID;
  v_applicant_id UUID;
  v_project_id UUID;
  v_owner_id UUID;
  v_current_status TEXT;
BEGIN
  -- 1. Fetch application details
  SELECT milestone_id, applicant_id, status
  INTO v_milestone_id, v_applicant_id, v_current_status
  FROM public.applications
  WHERE id = app_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found with ID %', app_id;
  END IF;

  -- 2. Fetch project owner
  SELECT m.project_id, p.owner_id
  INTO v_project_id, v_owner_id
  FROM public.milestones m
  JOIN public.projects p ON p.id = m.project_id
  WHERE m.id = v_milestone_id;

  -- 3. Check caller authorization
  IF auth.uid() IS NULL OR auth.uid() != v_owner_id THEN
    RAISE EXCEPTION 'Unauthorized: Only project owner can accept applications';
  END IF;

  -- 4. Execute atomic updates
  -- A. Mark target application accepted
  UPDATE public.applications
  SET status = 'accepted'
  WHERE id = app_id;

  -- B. Assign applicant to milestone and set status to assigned
  UPDATE public.milestones
  SET assigned_to = v_applicant_id,
      status = 'assigned'
  WHERE id = v_milestone_id;

  -- C. Reject all other pending applications for this milestone
  UPDATE public.applications
  SET status = 'rejected'
  WHERE milestone_id = v_milestone_id
    AND id != app_id
    AND status = 'pending';

  RETURN jsonb_build_object(
    'success', true,
    'milestone_id', v_milestone_id,
    'assigned_to', v_applicant_id
  );
END;
$$;

-- --------------------------------------------------------
-- 6. INDEXES FOR PERFORMANCE
-- --------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_type ON public.projects(type);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON public.milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.milestones(status);
CREATE INDEX IF NOT EXISTS idx_applications_milestone_id ON public.applications(milestone_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON public.applications(applicant_id);
