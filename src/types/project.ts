export type ProjectType = 'game' | 'software';

export type RequiredRole = 'code' | 'design' | 'music' | 'marketing';

export type MilestoneStatus = 'open' | 'assigned' | 'completed';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  type: ProjectType;
  description: string;
  max_revenue_share: number;
  created_at: string;
  // Computed / expanded fields
  owner_username?: string;
  committed_revenue_share?: number;
  milestone_count?: number;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  required_role: RequiredRole;
  revenue_share_percent: number;
  status: MilestoneStatus;
  assigned_to: string | null;
  created_at: string;
  // Computed
  assigned_username?: string;
  user_applied?: boolean;
  application_status?: ApplicationStatus;
}

export interface Application {
  id: string;
  milestone_id: string;
  applicant_id: string;
  portfolio_link: string;
  status: ApplicationStatus;
  created_at: string;
  // Computed
  applicant_username?: string;
  milestone_title?: string;
  project_name?: string;
}

export interface CreateProjectPayload {
  name: string;
  type: ProjectType;
  description: string;
  max_revenue_share: number;
  milestones?: Array<{
    title: string;
    description?: string;
    required_role: RequiredRole;
    revenue_share_percent: number;
  }>;
}

export interface CreateApplicationPayload {
  milestone_id: string;
  portfolio_link: string;
}
