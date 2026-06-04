import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';

const router = Router();

router.get('/dashboard', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const totalResumes = await prisma.resume.count({ where: { userId } });
    const resumes = await prisma.resume.findMany({
      where: { userId, score: { not: null } }
    });
    const averageScore = resumes.length > 0
      ? Math.round(resumes.reduce((acc, r) => acc + (r.score || 0), 0) / resumes.length)
      : 0;

    const highRiskCandidates = await prisma.resume.count({
      where: { userId, riskLevel: 'High' }
    });

    const recentUploads = await prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        analyses: {
          orderBy: { id: 'desc' },
          take: 1
        }
      }
    });

    res.json({
      totalResumes,
      averageScore,
      highRiskCandidates,
      recentUploads
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Dashboard failed to load' });
  }
});

export default router;
