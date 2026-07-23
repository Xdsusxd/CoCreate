-- ========================================================
-- COCREATE BACKEND: STRICT ROYALTY LIMIT TRIGGER & RPC
-- Supabase PostgreSQL Migration 003
-- ========================================================

-- --------------------------------------------------------
-- 1. ROYALTY LIMIT TRIGGER FUNCTION
-- --------------------------------------------------------
-- Enforces that the total revenue_share_percent of all milestones
-- associated with a project NEVER exceeds projects.max_revenue_share.
-- Executes BEFORE INSERT OR UPDATE on public.milestones.
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION public.check_royalty_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max_share NUMERIC;
  v_current_total NUMERIC;
  v_new_total NUMERIC;
BEGIN
  -- Fetch the project's maximum allowed revenue share
  SELECT max_revenue_share
  INTO v_max_share
  FROM public.projects
  WHERE id = NEW.project_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proyecto no encontrado para el ID %', NEW.project_id;
  END IF;

  -- Calculate existing total revenue share for this project (excluding current row if updating)
  SELECT COALESCE(SUM(revenue_share_percent), 0)
  INTO v_current_total
  FROM public.milestones
  WHERE project_id = NEW.project_id
    AND (TG_OP = 'INSERT' OR id != NEW.id);

  -- Add the new/updated milestone's revenue share
  v_new_total := v_current_total + NEW.revenue_share_percent;

  -- Enforce constraint
  IF v_new_total > v_max_share THEN
    RAISE EXCEPTION 'Límite de regalías excedido: La suma total de hitos (%.2f%%) superaría el máximo permitido del proyecto (%.2f%%).',
      v_new_total, v_max_share;
  END IF;

  RETURN NEW;
END;
$$;

-- --------------------------------------------------------
-- 2. BIND TRIGGER TO MILESTONES TABLE
-- --------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_check_royalty_limit ON public.milestones;

CREATE TRIGGER trigger_check_royalty_limit
  BEFORE INSERT OR UPDATE ON public.milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.check_royalty_limit();

COMMENT ON FUNCTION public.check_royalty_limit() IS
  'Trigger function enforcing that total milestone revenue share does not exceed project max_revenue_share';
