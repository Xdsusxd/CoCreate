import { create } from 'zustand';
import { Project, Milestone, ProjectType, RequiredRole } from '../types/project';
import { UserProfile } from '../services/profileService';
import {
  fetchProjects,
  fetchProjectById,
  fetchProjectMilestones,
  createProject as apiCreateProject,
  addMilestone as apiAddMilestone,
  submitApplication as apiSubmitApplication,
} from '../services/projectService';

export type ScreenName = 'menu' | 'gallery' | 'project_detail' | 'create_project' | 'my_projects';

interface AppStoreState {
  // Navigation State
  activeScreen: ScreenName;
  selectedProjectId: string | null;
  previousScreen: ScreenName | null;

  // Data State
  projects: Project[];
  filterType: ProjectType | 'all';
  selectedProject: Project | null;
  selectedProjectMilestones: Milestone[];
  
  // UI / Loading
  isLoadingProjects: boolean;
  isLoadingMilestones: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;

  // User Profile
  userProfile: UserProfile | null;

  // Actions
  setActiveScreen: (screen: ScreenName, projectId?: string) => void;
  setFilterType: (filter: ProjectType | 'all') => void;
  setUserProfile: (profile: UserProfile | null) => void;
  loadProjects: () => Promise<void>;
  selectProject: (projectId: string, userId?: string) => Promise<void>;
  createProject: (
    userId: string,
    data: {
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
  ) => Promise<boolean>;
  applyToMilestone: (userId: string, milestoneId: string, portfolioLink: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  activeScreen: 'menu',
  selectedProjectId: null,
  previousScreen: null,

  projects: [],
  filterType: 'all',
  selectedProject: null,
  selectedProjectMilestones: [],

  isLoadingProjects: false,
  isLoadingMilestones: false,
  isSubmitting: false,
  errorMessage: null,

  userProfile: null,

  setActiveScreen: (screen, projectId) => {
    set((state) => ({
      previousScreen: state.activeScreen,
      activeScreen: screen,
      selectedProjectId: projectId !== undefined ? projectId : state.selectedProjectId,
    }));
  },

  setFilterType: (filter) => {
    set({ filterType: filter });
    get().loadProjects();
  },

  setUserProfile: (profile) => set({ userProfile: profile }),

  loadProjects: async () => {
    set({ isLoadingProjects: true, errorMessage: null });
    try {
      const { filterType } = get();
      const list = await fetchProjects(filterType);
      set({ projects: list, isLoadingProjects: false });
    } catch (err: any) {
      set({ isLoadingProjects: false, errorMessage: err.message || 'Error cargando proyectos' });
    }
  },

  selectProject: async (projectId: string, userId?: string) => {
    set({ isLoadingMilestones: true, errorMessage: null });
    try {
      const [project, milestones] = await Promise.all([
        fetchProjectById(projectId),
        fetchProjectMilestones(projectId, userId),
      ]);
      set({
        selectedProject: project,
        selectedProjectMilestones: milestones,
        isLoadingMilestones: false,
      });
    } catch (err: any) {
      set({ isLoadingMilestones: false, errorMessage: err.message || 'Error cargando detalle' });
    }
  },

  createProject: async (userId, data) => {
    set({ isSubmitting: true, errorMessage: null });
    try {
      await apiCreateProject(userId, data);
      set({ isSubmitting: false });
      await get().loadProjects();
      get().setActiveScreen('gallery');
      return true;
    } catch (err: any) {
      set({ isSubmitting: false, errorMessage: err.message || 'Error creando proyecto' });
      return false;
    }
  },

  applyToMilestone: async (userId, milestoneId, portfolioLink) => {
    set({ isSubmitting: true, errorMessage: null });
    try {
      await apiSubmitApplication(userId, { milestone_id: milestoneId, portfolio_link: portfolioLink });
      set({ isSubmitting: false });
      // Refresh current project milestones
      const { selectedProjectId } = get();
      if (selectedProjectId) {
        const milestones = await fetchProjectMilestones(selectedProjectId, userId);
        set({ selectedProjectMilestones: milestones });
      }
      return true;
    } catch (err: any) {
      set({ isSubmitting: false, errorMessage: err.message || 'Error postulando al hito' });
      return false;
    }
  },

  clearError: () => set({ errorMessage: null }),
}));
