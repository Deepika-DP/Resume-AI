import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, vercel: !!process.env.VERCEL, node: process.version });
});

function tryRequire(name: string, modulePath: string) {
  try {
    const mod = require(modulePath);
    console.log(`  ✓ loaded ${name}`);
    return mod.default || mod;
  } catch (e: any) {
    console.error(`  ✗ failed to load ${name}: ${e.message}`);
    return null;
  }
}

console.log('[init] loading modules...');
const authRoutes = tryRequire('auth', './routes/auth.routes');
const resumeRoutes = tryRequire('resume', './routes/resume.routes');
const analysisRoutes = tryRequire('analysis', './routes/analysis.routes');
const jobRoutes = tryRequire('job', './routes/job.routes');
const reportRoutes = tryRequire('report', './routes/report.routes');
const analyticsRoutes = tryRequire('analytics', './routes/analytics.routes');

if (authRoutes) { console.log('[init] mounting /auth'); app.use('/auth', authRoutes); }
if (resumeRoutes) { console.log('[init] mounting /resumes'); app.use('/resumes', resumeRoutes); }
if (analysisRoutes) { console.log('[init] mounting /analysis'); app.use('/analysis', analysisRoutes); }
if (jobRoutes) { console.log('[init] mounting /jobs'); app.use('/jobs', jobRoutes); }
if (reportRoutes) { console.log('[init] mounting /reports'); app.use('/reports', reportRoutes); }
if (analyticsRoutes) { console.log('[init] mounting /analytics'); app.use('/analytics', analyticsRoutes); }
console.log('[init] done');

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
