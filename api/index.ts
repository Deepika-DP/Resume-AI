import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../backend/src/routes/auth.routes';
import resumeRoutes from '../backend/src/routes/resume.routes';
import analysisRoutes from '../backend/src/routes/analysis.routes';
import jobRoutes from '../backend/src/routes/job.routes';
import reportRoutes from '../backend/src/routes/report.routes';
import analyticsRoutes from '../backend/src/routes/analytics.routes';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://resume-shield-ai.vercel.app',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/auth', authRoutes);
app.use('/resumes', resumeRoutes);
app.use('/analysis', analysisRoutes);
app.use('/jobs', jobRoutes);
app.use('/reports', reportRoutes);
app.use('/analytics', analyticsRoutes);

export default app;
