import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import resumeRoutes from './routes/resume.routes';
import analysisRoutes from './routes/analysis.routes';
import jobRoutes from './routes/job.routes';
import reportRoutes from './routes/report.routes';
import analyticsRoutes from './routes/analytics.routes';
import prisma from './utils/prisma';

dotenv.config();

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, env: { vercel: !!process.env.VERCEL, jwt: !!process.env.JWT_SECRET } });
});

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
