import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@resumeshield.com',
      passwordHash: 'hashed-password-123'
    }
  });

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      fileName: 'John_Doe_Resume.pdf',
      fileUrl: 'http://example.com/resume.pdf',
      score: 72,
      riskLevel: 'Low'
    }
  });

  await prisma.analysis.create({
    data: {
      resumeId: resume.id,
      score: 72,
      riskLevel: 'Low',
      findings: JSON.stringify([
        { type: 'Success', text: 'Original content detected, no obvious AI patterns.' },
        { type: 'Warning', text: 'Resume could benefit from more quantifiable achievements.' }
      ]),
      authenticityScore: 95,
      atsScore: 72,
      recommendations: JSON.stringify([
        'Add a professional summary section at the top',
        'Include quantifiable achievements with metrics',
        'Use more industry-specific keywords from the job description',
        'Ensure consistent formatting across all sections'
      ])
    }
  });

  await prisma.job.create({
    data: {
      title: 'Frontend Developer',
      description: 'Looking for a skilled Vue developer...'
    }
  });

  console.log('Seed data inserted');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
