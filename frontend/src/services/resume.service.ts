import api from '../utils/api';

export const resumeService = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getAll: () => api.get('/resumes'),
  getById: (id: string) => api.get(`/resumes/${id}`),
  delete: (id: string) => api.delete(`/resumes/${id}`),
};
