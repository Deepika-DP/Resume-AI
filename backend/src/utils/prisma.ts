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

const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS "User" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "email" TEXT NOT NULL UNIQUE, "passwordHash" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS "Resume" ("id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "fileName" TEXT NOT NULL, "fileUrl" TEXT NOT NULL, "score" INTEGER, "riskLevel" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY ("userId") REFERENCES "User"("id"))`,
  `CREATE TABLE IF NOT EXISTS "Job" ("id" TEXT NOT NULL PRIMARY KEY, "title" TEXT NOT NULL, "description" TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS "Analysis" ("id" TEXT NOT NULL PRIMARY KEY, "resumeId" TEXT NOT NULL, "score" INTEGER NOT NULL DEFAULT 0, "riskLevel" TEXT NOT NULL DEFAULT 'Unknown', "findings" TEXT NOT NULL DEFAULT '[]', "authenticityScore" INTEGER, "atsScore" INTEGER, "recommendations" TEXT, "fakeFlags" TEXT NOT NULL DEFAULT '[]', "atsChecks" TEXT NOT NULL DEFAULT '[]', FOREIGN KEY ("resumeId") REFERENCES "Resume"("id"))`,
  `CREATE TABLE IF NOT EXISTS "Report" ("id" TEXT NOT NULL PRIMARY KEY, "resumeId" TEXT NOT NULL, "pdfUrl" TEXT NOT NULL, FOREIGN KEY ("resumeId") REFERENCES "Resume"("id"))`,
];

export async function syncSchema() {
  if (!prisma) return;
  for (const sql of CREATE_TABLES) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (e: any) {
      console.error('syncSchema error:', e.message);
    }
  }
}

export default prisma;
