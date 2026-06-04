export const CONSTANTS = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  SUPPORTED_FORMATS: ['.pdf', '.docx']
};
