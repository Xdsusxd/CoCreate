import { supabase } from '../lib/supabase';
import {
  Project,
  Milestone,
  Application,
  CreateProjectPayload,
  CreateApplicationPayload,
  ProjectType,
} from '../types/project';

/**
 * Service for managing projects, milestones, and applications in Supabase DB.
 */

export const fetchProjects = async (filterType?: ProjectType | 'all'): Promise<Project[]> => {
  try {
    let query = supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id (username),
        milestones (revenue_share_percent)
      `)
      .order('created_at', { ascending: false });

    if (filterType && filterType !== 'all') {
      query = query.eq('type', filterType);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[projectService] fetchProjects error:', error.message);
      return [];
    }

    if (!data) return [];

    return data.map((row: any) => {
      const milestones = row.milestones || [];
      const committedRevenue = milestones.reduce(
        (sum: number, m: any) => sum + Number(m.revenue_share_percent || 0),
        0
      );

      return {
        id: row.id,
        owner_id: row.owner_id,
        name: row.name,
        type: row.type,
        description: row.description,
        max_revenue_share: Number(row.max_revenue_share),
        created_at: row.created_at,
        owner_username: row.profiles?.username || 'Anónimo',
        committed_revenue_share: committedRevenue,
        milestone_count: milestones.length,
      };
    });
  } catch (err) {
    console.error('[projectService] fetchProjects exception:', err);
    return [];
  }
};

export const fetchProjectById = async (projectId: string): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        profiles:owner_id (username),
        milestones (revenue_share_percent)
      `)
      .eq('id', projectId)
      .single();

    if (error || !data) {
      console.warn('[projectService] fetchProjectById error:', error?.message);
      return null;
    }

    const milestones = data.milestones || [];
    const committedRevenue = milestones.reduce(
      (sum: number, m: any) => sum + Number(m.revenue_share_percent || 0),
      0
    );

    return {
      id: data.id,
      owner_id: data.owner_id,
      name: data.name,
      type: data.type,
      description: data.description,
      max_revenue_share: Number(data.max_revenue_share),
      created_at: data.created_at,
      owner_username: data.profiles?.username || 'Anónimo',
      committed_revenue_share: committedRevenue,
      milestone_count: milestones.length,
    };
  } catch (err) {
    console.error('[projectService] fetchProjectById exception:', err);
    return null;
  }
};

export const createProject = async (
  ownerId: string,
  payload: CreateProjectPayload
): Promise<Project> => {
  // 1. Pre-validate revenue share totals if milestones are passed upfront
  if (payload.milestones && payload.milestones.length > 0) {
    const totalShare = payload.milestones.reduce((acc, m) => acc + m.revenue_share_percent, 0);
    if (totalShare > payload.max_revenue_share) {
      throw new Error(
        `La suma de regalías de los hitos (${totalShare}%) supera el máximo permitido del proyecto (${payload.max_revenue_share}%).`
      );
    }
  }

  // 2. Insert project
  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .insert({
      owner_id: ownerId,
      name: payload.name.trim(),
      type: payload.type,
      description: payload.description.trim(),
      max_revenue_share: payload.max_revenue_share,
    })
    .select()
    .single();

  if (projectError || !projectData) {
    console.error('[projectService] createProject error:', projectError);
    throw new Error('Error al crear el proyecto en la base de datos.');
  }

  // 3. Insert initial milestones if provided
  if (payload.milestones && payload.milestones.length > 0) {
    const milestonesToInsert = payload.milestones.map((m) => ({
      project_id: projectData.id,
      title: m.title.trim(),
      description: m.description?.trim() || null,
      required_role: m.required_role,
      revenue_share_percent: m.revenue_share_percent,
    }));

    const { error: msError } = await supabase.from('milestones').insert(milestonesToInsert);
    if (msError) {
      console.warn('[projectService] Error creating initial milestones:', msError.message);
    }
  }

  return {
    id: projectData.id,
    owner_id: projectData.owner_id,
    name: projectData.name,
    type: projectData.type,
    description: projectData.description,
    max_revenue_share: Number(projectData.max_revenue_share),
    created_at: projectData.created_at,
    committed_revenue_share: payload.milestones
      ? payload.milestones.reduce((a, b) => a + b.revenue_share_percent, 0)
      : 0,
    milestone_count: payload.milestones?.length || 0,
  };
};

export const fetchProjectMilestones = async (
  projectId: string,
  userId?: string
): Promise<Milestone[]> => {
  try {
    const { data, error } = await supabase
      .from('milestones')
      .select(`
        *,
        profiles:assigned_to (username),
        applications (id, applicant_id, status)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.warn('[projectService] fetchProjectMilestones error:', error?.message);
      return [];
    }

    return data.map((row: any) => {
      const apps = row.applications || [];
      const userApp = userId ? apps.find((a: any) => a.applicant_id === userId) : null;

      return {
        id: row.id,
        project_id: row.project_id,
        title: row.title,
        description: row.description,
        required_role: row.required_role,
        revenue_share_percent: Number(row.revenue_share_percent),
        status: row.status,
        assigned_to: row.assigned_to,
        created_at: row.created_at,
        assigned_username: row.profiles?.username || undefined,
        user_applied: !!userApp,
        application_status: userApp?.status || undefined,
      };
    });
  } catch (err) {
    console.error('[projectService] fetchProjectMilestones exception:', err);
    return [];
  }
};

export const addMilestone = async (
  projectId: string,
  ownerId: string,
  milestone: {
    title: string;
    description?: string;
    required_role: Milestone['required_role'];
    revenue_share_percent: number;
  }
): Promise<Milestone> => {
  // Validate total revenue share
  const project = await fetchProjectById(projectId);
  if (!project) throw new Error('Proyecto no encontrado.');

  const existingMilestones = await fetchProjectMilestones(projectId);
  const currentTotal = existingMilestones.reduce((a, b) => a + b.revenue_share_percent, 0);

  if (currentTotal + milestone.revenue_share_percent > project.max_revenue_share) {
    throw new Error(
      `No se puede añadir el hito. Las regalías acumuladas (${currentTotal + milestone.revenue_share_percent}%) excederían el límite de ${project.max_revenue_share}%.`
    );
  }

  const { data, error } = await supabase
    .from('milestones')
    .insert({
      project_id: projectId,
      title: milestone.title.trim(),
      description: milestone.description?.trim() || null,
      required_role: milestone.required_role,
      revenue_share_percent: milestone.revenue_share_percent,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('[projectService] addMilestone error:', error);
    throw new Error('Error al guardar el hito en la base de datos.');
  }

  return {
    id: data.id,
    project_id: data.project_id,
    title: data.title,
    description: data.description,
    required_role: data.required_role,
    revenue_share_percent: Number(data.revenue_share_percent),
    status: data.status,
    assigned_to: data.assigned_to,
    created_at: data.created_at,
  };
};

export const submitApplication = async (
  applicantId: string,
  payload: CreateApplicationPayload
): Promise<Application> => {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      milestone_id: payload.milestone_id,
      applicant_id: applicantId,
      portfolio_link: payload.portfolio_link.trim(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Ya te has postulado previamente a este hito.');
    }
    console.error('[projectService] submitApplication error:', error);
    throw new Error('Error al registrar la postulación.');
  }

  return {
    id: data.id,
    milestone_id: data.milestone_id,
    applicant_id: data.applicant_id,
    portfolio_link: data.portfolio_link,
    status: data.status,
    created_at: data.created_at,
  };
};

export const acceptApplicationRPC = async (applicationId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('accept_application', {
      app_id: applicationId,
    });

    if (error) {
      console.error('[projectService] acceptApplicationRPC error:', error.message);
      throw new Error(error.message);
    }

    return data?.success === true;
  } catch (err: any) {
    console.error('[projectService] acceptApplicationRPC exception:', err);
    throw new Error(err.message || 'Error al procesar la aceptación.');
  }
};
