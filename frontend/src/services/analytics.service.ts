import api from '../utils/api';

export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
};
