import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
const DOWNLOADS_DIR = path.resolve(__dirname, '../../downloads');

if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const reports = await prisma.report.findMany({
    include: { resume: true },
    orderBy: { id: 'desc' }
  });
  res.json(reports);
});

router.get('/:resumeId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const resumeId = req.params.resumeId as string;
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        analyses: {
          orderBy: { id: 'desc' },
          take: 1
        }
      }
    });

    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    if (resume.userId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

    const analysis = resume.analyses[0];
    const parsedFindings = analysis ? JSON.parse(analysis.findings) : [];
    const parsedRecommendations = analysis?.recommendations ? JSON.parse(analysis.recommendations) : [];

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const fileName = `report_${req.params.resumeId}.pdf`;
    const filePath = path.join(DOWNLOADS_DIR, fileName);

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const primaryColor = '#2563eb';
    const grayColor = '#64748b';
    const darkColor = '#1e293b';
    const greenColor = '#10b981';
    const amberColor = '#f59e0b';
    const redColor = '#ef4444';

    function drawScoreBar(x: number, y: number, score: number, max: number, label: string, color: string) {
      doc.fontSize(10).fillColor(darkColor).text(label, x, y);
      const barWidth = 220;
      const barHeight = 10;
      doc.roundedRect(x, y + 14, barWidth, barHeight, 4).fill('#e2e8f0');
      const fillWidth = Math.max(0, (score / max) * barWidth);
      doc.roundedRect(x, y + 14, fillWidth, barHeight, 4).fill(color);
      doc.fontSize(9).fillColor(grayColor).text(`${score}/${max}`, x + barWidth + 8, y + 12);
    }

    // Header
    doc.fontSize(24).fillColor(primaryColor).font('Helvetica-Bold').text('ResumeShield AI', 50, 50);
    doc.fontSize(10).fillColor(grayColor).font('Helvetica').text(`Report generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 50, 78);
    doc.moveTo(50, 95).lineWidth(1).strokeColor('#e2e8f0').lineTo(545, 95).stroke();

    // Resume Info
    doc.fontSize(16).fillColor(darkColor).font('Helvetica-Bold').text('Resume Analysis Report', 50, 115);
    doc.fontSize(11).fillColor(darkColor).font('Helvetica').text(`Candidate: ${resume.fileName}`, 50, 140);
    doc.fontSize(10).fillColor(grayColor).text(`Uploaded: ${new Date(resume.createdAt).toLocaleDateString()}`, 50, 158);

    const authenticityScore = analysis?.authenticityScore ?? 0;
    const atsScore = analysis?.atsScore ?? 0;
    const overallScore = resume.score ?? 0;
    const riskLevel = resume.riskLevel || 'N/A';

    // Overall Score Badge
    const overallColor = overallScore >= 70 ? greenColor : (overallScore >= 50 ? amberColor : redColor);
    doc.fontSize(36).fillColor(overallColor).font('Helvetica-Bold').text(`${overallScore}`, 430, 110);
    doc.fontSize(10).fillColor(overallColor).font('Helvetica').text('Overall Score', 430, 150);

    // Risk Level
    const riskColor = riskLevel === 'Low' ? greenColor : (riskLevel === 'Review' ? amberColor : redColor);
    doc.fontSize(10).fillColor(grayColor).text('Risk Level:', 50, 185);
    doc.fontSize(10).fillColor(riskColor).font('Helvetica-Bold').text(riskLevel, 120, 185);

    // Authenticity Score
    doc.fontSize(10).fillColor(grayColor).text('Authenticity:', 250, 185);
    const authColor = authenticityScore >= 80 ? greenColor : (authenticityScore >= 60 ? amberColor : redColor);
    doc.fontSize(10).fillColor(authColor).font('Helvetica-Bold').text(`${authenticityScore}/100`, 330, 185);

    // ATS Score
    doc.fontSize(10).fillColor(grayColor).text('ATS Score:', 400, 185);
    const atsColor = atsScore >= 70 ? greenColor : (atsScore >= 50 ? amberColor : redColor);
    doc.fontSize(10).fillColor(atsColor).font('Helvetica-Bold').text(`${atsScore}/100`, 470, 185);

    doc.moveTo(50, 205).lineWidth(1).strokeColor('#e2e8f0').lineTo(545, 205).stroke();

    // Authenticity Findings Section
    let yPos = 225;
    doc.fontSize(14).fillColor(darkColor).font('Helvetica-Bold').text('Authenticity Analysis', 50, yPos);
    yPos += 25;

    const findings = parsedFindings.filter((f: any) => f.category && f.category !== 'ats');
    if (findings.length === 0) {
      doc.fontSize(10).fillColor(grayColor).text('No authenticity flags detected.', 50, yPos);
      yPos += 20;
    } else {
      for (const f of findings) {
        const sevColor = f.type === 'Warning' ? redColor : (f.type === 'Info' ? amberColor : greenColor);
        doc.fontSize(10).fillColor(sevColor).font('Helvetica-Bold').text((f.type === 'Warning' ? '⚠ ' : 'ℹ ') + f.label, 50, yPos);
        yPos += 16;
        doc.fontSize(9).fillColor(darkColor).font('Helvetica').text(f.text || '', 50, yPos, { width: 480 });
        yPos += 18;
        if (f.detail) {
          doc.fontSize(8).fillColor(grayColor).text(f.detail, 50, yPos);
          yPos += 14;
        }
        yPos += 4;
      }
    }

    doc.moveTo(50, yPos).lineWidth(1).strokeColor('#e2e8f0').lineTo(545, yPos).stroke();
    yPos += 20;

    // ATS Score Breakdown Section
    doc.fontSize(14).fillColor(darkColor).font('Helvetica-Bold').text('ATS Score Breakdown', 50, yPos);
    yPos += 30;

    const atsScoreVal = analysis?.atsScore || 0;
    const breakdown = [
      { name: 'Resume Length', score: Math.min(20, Math.round((atsScoreVal / 100) * 20)), max: 20 },
      { name: 'Contact Information', score: Math.min(20, Math.round((atsScoreVal / 100) * 20)), max: 20 },
      { name: 'Skills Section', score: Math.min(20, Math.round((atsScoreVal / 100) * 20)), max: 20 },
      { name: 'Experience Section', score: Math.min(20, Math.round((atsScoreVal / 100) * 20)), max: 20 },
      { name: 'Education Section', score: Math.min(10, Math.round((atsScoreVal / 100) * 10)), max: 10 },
      { name: 'Keyword Density', score: Math.min(10, Math.round((atsScoreVal / 100) * 10)), max: 10 },
    ];

    const barColors = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
    for (let i = 0; i < breakdown.length; i++) {
      const check = breakdown[i]!;
      const bc = barColors[i]!;
      const col = i % 2;
      const row = Math.floor(i / 2);
      const xPos = 50 + (col * 260);
      const yPos2 = yPos + (row * 50);
      drawScoreBar(xPos, yPos2, check.score, check.max, check.name, bc);
    }

    yPos += 160;

    doc.moveTo(50, yPos).lineWidth(1).strokeColor('#e2e8f0').lineTo(545, yPos).stroke();
    yPos += 20;

    // Recommendations Section
    if (parsedRecommendations.length > 0) {
      if (yPos > 620) {
        doc.addPage();
        yPos = 50;
      }
      doc.fontSize(14).fillColor(darkColor).font('Helvetica-Bold').text('Recommendations', 50, yPos);
      yPos += 25;

      for (const rec of parsedRecommendations) {
        doc.fontSize(9).fillColor(darkColor).font('Helvetica').text(`• ${rec}`, 50, yPos, { width: 480 });
        yPos += 16;
      }
    }

    // Footer
    doc.fontSize(8).fillColor(grayColor).font('Helvetica').text('ResumeShield AI — Automated Resume Analysis Report', 50, 780, { align: 'center' });

    doc.end();

    stream.on('finish', async () => {
      const report = await prisma.report.create({
        data: {
          resumeId: resumeId,
          pdfUrl: `/reports/download/${fileName}`
        }
      });
      res.download(filePath, fileName);
    });

    stream.on('error', () => {
      res.status(500).json({ error: 'Failed to generate report PDF' });
    });
  } catch (error) {
    console.error('Report generation failed', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

router.get('/download/:fileName', authMiddleware, async (req: AuthRequest, res) => {
  const safePath = path.resolve(DOWNLOADS_DIR, req.params.fileName as string);
  if (!safePath.startsWith(DOWNLOADS_DIR)) {
    return res.status(403).json({ error: 'Invalid file path' });
  }
  if (!fs.existsSync(safePath)) {
    return res.status(404).json({ error: 'Report file not found' });
  }
  res.download(safePath);
});

export default router;
