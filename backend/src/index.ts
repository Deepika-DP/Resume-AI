import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  let requireWorks = false;
  let resolveResult = '';
  let errorMsg = '';
  try {
    const resolved = require.resolve('./routes/auth.routes');
    resolveResult = resolved;
    requireWorks = true;
  } catch (e: any) {
    errorMsg = e.message;
  }
  res.json({
    ok: true,
    vercel: !!process.env.VERCEL,
    node: process.version,
    requireWorks,
    resolveResult,
    errorMsg,
    cwd: process.cwd(),
    __dirname
  });
});

app.get('/init', async (_req, res) => {
  const results: any[] = [];
  const modules = [
    'auth',
    'resume',
    'analysis',
    'job',
    'report',
    'analytics'
  ];
  for (const name of modules) {
    const path = `./routes/${name}.routes`;
    try {
      const mod = require(path);
      results.push({ name, loaded: true, hasDefault: !!mod.default });
    } catch (e: any) {
      results.push({ name, loaded: false, error: e.message });
    }
  }
  res.json({ init: results });
});

app.get('/test-static-import', async (_req, res) => {
  try {
    const mod = await import('./routes/auth.routes');
    res.json({ ok: true, hasDefault: !!mod.default });
  } catch (e: any) {
    res.json({ ok: false, error: e.message, stack: e.stack?.split('\n').slice(0, 5).join('\n') });
  }
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;
