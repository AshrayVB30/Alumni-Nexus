import api from './api';

export const projectService = {
  getProjects: async () => {
    const response = await api.get('projects/');
    return response.data;
  },
  
  applyToProject: async (projectId: string) => {
    const response = await api.post(`projects/${projectId}/apply`);
    return response.data;
  },

  createProject: async (projectData: any) => {
    const response = await api.post('projects/', projectData);
    return response.data;
  }
};
