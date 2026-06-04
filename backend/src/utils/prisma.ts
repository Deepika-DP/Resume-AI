import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrisma(): PrismaClient {
  if (process.env.VERCEL) {
    const dbPath = '/tmp/dev.db';
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(dbPath)) {
      try {
        execSync('npx prisma db push --skip-generate --accept-data-loss', {
          cwd: path.resolve(__dirname, '../..'),
          stdio: 'pipe',
          env: { ...process.env, DATABASE_URL: `file:${dbPath}` }
        });
      } catch (e: any) {
        console.error('Prisma push failed:', e.stderr?.toString() || e.message);
      }
    }
  }
  return new PrismaClient({ datasources: { db: { url: `file:${process.env.VERCEL ? '/tmp/dev.db' : path.resolve(__dirname, '../../prisma/dev.db')}` } } });
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrisma();
}

export default globalForPrisma.prisma!;
