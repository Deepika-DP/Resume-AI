import { PrismaClient } from '@prisma/client';
import path from 'path';
import { execSync } from 'child_process';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

let prisma: PrismaClient;

try {
  if (!globalForPrisma.prisma) {
    const dbUrl = process.env.VERCEL
      ? 'file:/tmp/dev.db'
      : `file:${path.resolve(__dirname, '../../prisma/dev.db')}`;
    globalForPrisma.prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });
  }
  prisma = globalForPrisma.prisma;
} catch (e) {
  console.error('Failed to create first PrismaClient:', e);
  try {
    prisma = new PrismaClient();
  } catch (e2) {
    console.error('Failed to create fallback PrismaClient:', e2);
    prisma = null as any;
  }
}

export async function syncSchema() {
  if (!prisma || process.env.VERCEL !== '1') return;
  try {
    const rows: any = await prisma.$queryRawUnsafe("SELECT count(*) as cnt FROM sqlite_master WHERE type='table' AND name='User'");
    const cnt = rows?.[0]?.cnt;
    if (cnt && Number(cnt) > 0) return;
  } catch {}
  try {
    const prismaCli = path.resolve(__dirname, '../../node_modules/prisma/build/index.js');
    execSync(`node "${prismaCli}" db push --skip-generate --accept-data-loss`, { stdio: 'pipe', cwd: path.resolve(__dirname, '../..'), timeout: 30000 });
  } catch (e: any) {
    console.error('prisma db push failed:', e.message);
  }
}

export default prisma;
