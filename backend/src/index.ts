import express from 'express';
import cors from 'cors';
import { syncSchema } from './utils/prisma.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, vercel: !!process.env.VERCEL, node: process.version });
});

async function initModules() {
  await syncSchema();
  try { const m: any = await import('./routes/auth.routes.js'); if (m?.default) app.use('/auth', m.default); } catch (e: any) { console.error('auth:', e.message); }
  try { const m: any = await import('./routes/resume.routes.js'); if (m?.default) app.use('/resumes', m.default); } catch (e: any) { console.error('resume:', e.message); }
  try { const m: any = await import('./routes/analysis.routes.js'); if (m?.default) app.use('/analysis', m.default); } catch (e: any) { console.error('analysis:', e.message); }
  try { const m: any = await import('./routes/job.routes.js'); if (m?.default) app.use('/jobs', m.default); } catch (e: any) { console.error('job:', e.message); }
  try { const m: any = await import('./routes/report.routes.js'); if (m?.default) app.use('/reports', m.default); } catch (e: any) { console.error('report:', e.message); }
  try { const m: any = await import('./routes/analytics.routes.js'); if (m?.default) app.use('/analytics', m.default); } catch (e: any) { console.error('analytics:', e.message); }
}

let initPromise: Promise<void> | null = initModules().catch(e => console.error('initModules:', e.message));

app.use((_req, _res, next) => {
  if (initPromise) {
    const p = initPromise;
    initPromise = null;
    p.then(() => next()).catch(() => next());
  } else {
    next();
  }
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
