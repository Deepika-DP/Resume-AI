import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, vercel: !!process.env.VERCEL, node: process.version });
});

async function initModules() {
  const modules: [string, string][] = [
    ['/auth', './routes/auth.routes.js'],
    ['/resumes', './routes/resume.routes.js'],
    ['/analysis', './routes/analysis.routes.js'],
    ['/jobs', './routes/job.routes.js'],
    ['/reports', './routes/report.routes.js'],
    ['/analytics', './routes/analytics.routes.js'],
  ];
  for (const [path, specifier] of modules) {
    try {
      const mod = await import(specifier);
      app.use(path, mod.default || mod);
    } catch (e: any) {
      console.error(`Failed to load ${specifier}: ${e.message}`);
    }
  }
}

let initPromise = initModules().catch(e => console.error('initModules failed:', e));

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
