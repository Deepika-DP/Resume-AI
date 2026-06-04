import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
const UPLOAD_DIR = process.env.VERCEL ? '/tmp/uploads' : path.resolve(__dirname, '../../uploads');
const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.docx'];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  }
});

router.post('/upload', authMiddleware, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    const fileName = req.file ? req.file.originalname : `Uploaded_Resume_${Date.now()}.pdf`;
    const fileUrl = req.file ? req.file.path : 'local';

    const resume = await prisma.resume.create({
      data: {
        userId: req.user!.id,
        fileName,
        fileUrl,
        score: null,
        riskLevel: null
      }
    });
    res.status(201).json(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const resumes = await prisma.resume.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    include: {
      analyses: {
        orderBy: { id: 'desc' },
        take: 1
      }
    }
  });
  res.json(resumes);
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const resume = await prisma.resume.findUnique({
    where: { id },
    include: {
      analyses: {
        orderBy: { id: 'desc' },
        take: 1
      }
    }
  });
  if (!resume) return res.status(404).json({ error: 'Resume not found' });
  if (resume.userId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });
  res.json(resume);
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const resume = await prisma.resume.findUnique({
    where: { id },
    include: { analyses: true, reports: true }
  });
  if (!resume) return res.status(404).json({ error: 'Resume not found' });
  if (resume.userId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });
  await prisma.analysis.deleteMany({ where: { resumeId: id } });
  await prisma.report.deleteMany({ where: { resumeId: id } });
  await prisma.resume.delete({ where: { id } });
  res.status(204).send();
});

export default router;
