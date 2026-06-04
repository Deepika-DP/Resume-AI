import { PrismaClient } from '@prisma/client';
import path from 'path';

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

export default prisma;
