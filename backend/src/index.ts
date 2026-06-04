import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import resumeRoutes from './routes/resume.routes';
import analysisRoutes from './routes/analysis.routes';
import jobRoutes from './routes/job.routes';
import reportRoutes from './routes/report.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

app.use(cors({ origin: true, credentials: true }));
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

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
