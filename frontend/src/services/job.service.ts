import api from '../utils/api';

export const jobService = {
  create: (data: any) => api.post('/jobs', data),
  match: (resumeId: string, jobData: any) => api.post(`/jobs/match/${resumeId}`, jobData),
};
