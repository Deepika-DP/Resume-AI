import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';
import { tryOcrFallback } from '../utils/ocr';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const job = await prisma.job.create({
      data: {
        title: req.body.title || 'New Job',
        description: req.body.description || ''
      }
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: 'Job creation failed' });
  }
});

router.post('/match/:resumeId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const resumeId = req.params.resumeId as string;
    const { description } = req.body;
    const resume = await prisma.resume.findUnique({ where: { id: resumeId }});

    if (!resume || !description) return res.status(400).json({ error: 'Missing resume or job description' });
    if (resume.userId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });
    if (!resume.fileUrl || resume.fileUrl === 'local') {
      return res.status(400).json({ error: 'No resume file found.' });
    }

    const ext = path.extname(resume.fileName).toLowerCase();
    let rawText = '';
    try {
      const dataBuffer = fs.readFileSync(resume.fileUrl);
      if (ext === '.docx') {
        const { default: mammoth, extractRawText } = await import('mammoth') as any;
        const result = await (extractRawText || mammoth.extractRawText)({ buffer: dataBuffer });
        rawText = result.value;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
        const pdfjs = require('pdfjs-dist') as any;
        // Preload worker so eval("require")(getWorkerSrc()) inside getDocument finds the module
        (globalThis as any).pdfjsWorker = require('pdfjs-dist/build/pdf.worker.js');
        const dataArr = new Uint8Array(dataBuffer.buffer, dataBuffer.byteOffset, dataBuffer.byteLength);
        const doc = await pdfjs.getDocument({ data: dataArr }).promise;
        const parts: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const tc = await page.getTextContent();
          parts.push(tc.items.map((t: any) => t.str).join(' '));
        }
        rawText = parts.join('\n');
      }
      rawText = await tryOcrFallback(dataBuffer, rawText);
    } catch (e: any) {
      console.error('Job parse error:', e?.message);
      return res.status(400).json({ error: `Parse error: ${e?.message || 'unknown'}` });
    }

    const resumeText = rawText.toLowerCase();
    const descText = description.toLowerCase();

    const resumeWords = resumeText.split(/\W+/).filter((w: string) => w.length > 2);
    const descWords = descText.split(/\W+/).filter((w: string) => w.length > 2);

    const resumeUnique = [...new Set<string>(resumeWords)];
    const descUnique = [...new Set<string>(descWords)];

    const commonWords = descUnique.filter(w => resumeUnique.includes(w));
    const overlapRatio = descUnique.length > 0 ? commonWords.length / descUnique.length : 0;

    const skillKeywords = ['javascript', 'python', 'react', 'node', 'typescript', 'sql', 'aws', 'docker', 'git', 'java', 'c#', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'php', 'vue', 'angular', 'mongodb', 'postgresql', 'redis', 'kubernetes', 'terraform', 'ansible', 'jenkins', 'ci/cd', 'graphql', 'rest', 'api', 'html', 'css', 'sass', 'tailwind', 'bootstrap', 'machine learning', 'ai', 'data', 'cloud', 'devops', 'agile', 'scrum'];
    const descSkills = skillKeywords.filter(kw => descText.includes(kw));
    const matchedSkills = descSkills.filter(kw => resumeText.includes(kw));
    const skillsScore = descSkills.length > 0 ? Math.round((matchedSkills.length / descSkills.length) * 100) : 50;

    const expKeywords = ['year', 'years', 'experience', 'senior', 'lead', 'manager', 'director', 'head'];
    const descExp = expKeywords.filter(kw => descText.includes(kw));
    const matchedExp = descExp.filter(kw => resumeText.includes(kw));
    const experienceScore = descExp.length > 0 ? Math.round((matchedExp.length / descExp.length) * 100) : 50;

    const eduKeywords = ['bachelor', 'master', 'phd', 'degree', 'b.tech', 'm.tech', 'ba', 'ma', 'b.sc', 'm.sc', 'university', 'college'];
    const descEdu = eduKeywords.filter(kw => descText.includes(kw));
    const matchedEdu = descEdu.filter(kw => resumeText.includes(kw));
    const educationScore = descEdu.length > 0 ? Math.round((matchedEdu.length / descEdu.length) * 100) : 50;

    const overall = Math.round((skillsScore * 0.5) + (experienceScore * 0.3) + (educationScore * 0.2));

    res.json({
      overall,
      skills: skillsScore,
      experience: experienceScore,
      education: educationScore,
      findings: [
        { text: `Matched ${commonWords.length} of ${descUnique.length} unique terms from job description (${Math.round(overlapRatio * 100)}% overlap).` },
        { text: matchedSkills.length > 0
          ? `Skills matched: ${matchedSkills.join(', ')}.`
          : 'No specific skill keywords from the job description were found in the resume.' },
        { text: overlapRatio > 0.3
          ? 'Strong keyword alignment between resume and job description.'
          : 'Weak keyword alignment. Consider tailoring the resume with more job-specific terms.' }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Matching failed' });
  }
});

export default router;
