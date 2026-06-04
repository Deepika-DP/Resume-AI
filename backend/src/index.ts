import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const prisma = new PrismaClient({ datasources: { db: { url: process.env.VERCEL ? 'file:/tmp/dev.db' : 'file:./prisma/dev.db' } } });

app.get('/health', async (_req, res) => {
  const files: any = {};
  const dirs = ['.', 'prisma', 'src', 'src/routes', 'node_modules/prisma'];
  for (const d of dirs) {
    try {
      const abs = path.resolve(__dirname, '..', d);
      files[d] = { abs, files: fs.readdirSync(abs).slice(0, 10) };
    } catch { files[d] = 'NOT_FOUND'; }
  }
  
  let dbPushResult = 'not run';
  try {
    const prismaCli = path.resolve(__dirname, '../node_modules/prisma/build/index.js');
    const { execSync } = require('child_process');
    const out = execSync(`node "${prismaCli}" db push --skip-generate --accept-data-loss`, {
      cwd: path.resolve(__dirname, '..'),
      timeout: 10000,
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL: 'file:/tmp/dev.db' }
    });
    dbPushResult = out.toString();
  } catch (e: any) {
    dbPushResult = `FAILED: ${e.message}`;
  }

  res.json({ __dirname, cwd: process.cwd(), files, dbPushResult });
});

export default app;
