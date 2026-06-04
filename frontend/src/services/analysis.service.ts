import api from '../utils/api';

export const analysisService = {
  getByResumeId: (resumeId: string) => api.get(`/analysis/${resumeId}`),
  analyze: (resumeId: string) => api.post(`/analysis/${resumeId}`),
};
