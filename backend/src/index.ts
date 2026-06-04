import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import resumeRoutes from './routes/resume.routes';
import analysisRoutes from './routes/analysis.routes';
import jobRoutes from './routes/job.routes';
import reportRoutes from './routes/report.routes';
import analyticsRoutes from './routes/analytics.routes';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.use('/auth', authRoutes);
app.use('/resumes', resumeRoutes);
app.use('/analysis', analysisRoutes);
app.use('/jobs', jobRoutes);
app.use('/reports', reportRoutes);
app.use('/analytics', analyticsRoutes);

const PORT = process.env.PORT || 3001;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
