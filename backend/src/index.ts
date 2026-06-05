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
  const mods: [string, string][] = [
    ['./routes/auth.routes.js', '/auth'],
    ['./routes/resume.routes.js', '/resumes'],
    ['./routes/analysis.routes.js', '/analysis'],
    ['./routes/job.routes.js', '/jobs'],
    ['./routes/report.routes.js', '/reports'],
    ['./routes/analytics.routes.js', '/analytics'],
  ];
  for (const [p, mp] of mods) {
    try {
      const mod: any = await import(p);
      if (mod?.default) app.use(mp, mod.default);
      console.log(`✓ ${mp}`);
    } catch (e: any) {
      console.error(`✗ ${mp}:`, e?.message?.split('\n')[0]);
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
