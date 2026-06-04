import express from 'express';
import cors from 'cors';
import { syncSchema } from './utils/prisma.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, vercel: !!process.env.VERCEL, node: process.version });
});

function imp(path: string, mountPoint: string) {
  return Promise.race([
    import(path).then(m => { if (m?.default) app.use(mountPoint, m.default); return 'ok'; }),
    new Promise<string>((_, reject) => setTimeout(() => reject(new Error(`TIMEOUT importing ${path}`)), 8000))
  ]);
}

async function initModules() {
  await syncSchema();
  for (const [path, mount] of [
    ['./routes/auth.routes.js', '/auth'],
    ['./routes/resume.routes.js', '/resumes'],
    ['./routes/analysis.routes.js', '/analysis'],
    ['./routes/job.routes.js', '/jobs'],
    ['./routes/report.routes.js', '/reports'],
    ['./routes/analytics.routes.js', '/analytics'],
  ]) {
    try {
      const r = await imp(path, mount);
      console.log(`✓ ${mount}`);
    } catch (e: any) {
      console.error(`✗ ${mount}:`, e?.message);
    }
  }
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
