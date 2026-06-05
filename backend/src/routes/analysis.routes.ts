import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';
import { tryOcrFallback } from '../utils/ocr';

const router = Router();

const AI_PHRASES = [
  'delve', 'testament to', 'rich tapestry', 'unwavering commitment', 'as an ai', 'dynamic landscape',
  'synergy', 'leverage', 'spearheaded', 'proactive approach', 'game-changer', 'revolutionary',
  'thought leader', 'bleeding edge', 'deep dive', 'holistic', 'utilize', 'world-class',
  'results-driven', 'highly skilled', 'proven track record', 'passionate about', 'committed to excellence',
  'strong background in', 'dedicated to delivering', 'solutions-oriented', 'strategic thinker',
  'forward-thinking', 'detail-oriented', 'team player', 'excellent communication',
  'seeking a challenging', 'seeking a position', 'opportunity to leverage', 'opportunity to contribute',
  'take ownership', 'drive results', 'make a meaningful impact', 'thrive in a fast-paced',
  'adapt quickly', 'fast learner', 'exceptional ability', 'demonstrated ability',
  'comprehensive understanding', 'in-depth knowledge', 'extensive experience',
  'well-versed in', 'proficient in', 'expertise in', 'specializing in',
  'core competencies', 'professional summary', 'areas of expertise', 'key accomplishments',
  'instrumental in', 'played a key role', 'responsible for', 'in charge of',
  'successfully delivered', 'successfully managed', 'successfully implemented',
  'cross-functional teams', 'stakeholder management', 'best practices',
  'cutting-edge', 'state-of-the-art', 'groundbreaking',
  'a track record of', 'track record of success', 'history of delivering',
  'technology-driven', 'data-driven', 'insight-driven',
  'collaborative environment', 'dynamic team', 'results-oriented',
  'business-critical', 'mission-critical', 'key player',
  'end-to-end', 'full lifecycle', 'from conception to completion'
];

router.post('/:resumeId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const resumeId = req.params.resumeId as string;
    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    if (resume.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!resume.fileUrl || resume.fileUrl === 'local') {
      return res.status(400).json({ error: 'No resume file found. Please upload a valid PDF or DOCX file.' });
    }

    const ext = path.extname(resume.fileName).toLowerCase();
    let rawText = '';
    try {
      let dataBuffer: Buffer;
      try { dataBuffer = fs.readFileSync(resume.fileUrl); } catch (e2: any) {
        return res.status(400).json({ error: `Resume file not found on server (uploaded on a different instance, Vercel ephemeral storage). ${e2.message}` });
      }
      if (ext === '.docx') {
        const mammothMod: any = await import('mammoth');
        const mammoth = mammothMod.default || mammothMod;
        const result = await mammoth.extractRawText({ buffer: dataBuffer });
        rawText = result.value;
      } else {
        const pdfMod: any = await import('pdf-parse');
        const PDFParse = pdfMod.default || pdfMod;
        const parser = new PDFParse({ data: dataBuffer });
        await parser.load();
        const result = await parser.getText();
        rawText = result.text || (result.pages || []).map((p: any) => p.text || '').join('\n');
        await parser.destroy();
      }
      rawText = await tryOcrFallback(dataBuffer, rawText);
    } catch (e) {
      console.error('File parse error:', (e as Error).message);
      return res.status(400).json({ error: 'Could not parse resume file. Supported formats: PDF, DOCX.' });
    }

    const text = rawText.toLowerCase();
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    let authenticityScore = 100;
    const fakeFlags: any[] = [];
    let totalAiFlags = 0;

    let aiPhraseCount = 0;
    const foundPhrases: string[] = [];
    for (const phrase of AI_PHRASES) {
      if (text.includes(phrase)) {
        aiPhraseCount++;
        foundPhrases.push(phrase);
      }
    }

    if (aiPhraseCount > 10) {
      authenticityScore -= 30;
      totalAiFlags++;
      fakeFlags.push({
        type: 'ai_generated', severity: 'high',
        label: 'AI-Generated Content Detected',
        text: `High probability of AI generation. Found ${aiPhraseCount} typical AI-sourced phrases.`,
        detail: `Heavy AI phrasing: ${aiPhraseCount} phrases detected`
      });
    } else if (aiPhraseCount > 5) {
      authenticityScore -= 15;
      totalAiFlags++;
      fakeFlags.push({
        type: 'ai_generated', severity: 'medium',
        label: 'AI-Content Patterns Found',
        text: `Moderate AI-sourced phrasing detected: ${aiPhraseCount} typical AI phrases found.`,
        detail: `AI phrases: ${aiPhraseCount}`
      });
    } else if (aiPhraseCount > 2) {
      authenticityScore -= 5;
      totalAiFlags++;
      fakeFlags.push({
        type: 'ai_generated', severity: 'low',
        label: 'Minor AI Phrasing',
        text: `Found ${aiPhraseCount} phrases commonly found in AI-generated resumes.`,
        detail: `AI phrases: ${aiPhraseCount}`
      });
    }

    let vagueTermScore = 0;
    const vagueTerms = ['various', 'multiple', 'numerous', 'extensive', 'significant', 'substantial', 'considerable', 'diverse', 'wide range', 'broad', 'extensive'];
    for (const vt of vagueTerms) {
      if (text.includes(vt)) vagueTermScore++;
    }
    const hasMetrics = /(\d+%|\$\d+|\d+[xX])/.test(text);
    if (vagueTermScore > 3 && !hasMetrics) {
      authenticityScore -= 10;
      totalAiFlags++;
      fakeFlags.push({
        type: 'generic_content', severity: 'medium',
        label: 'Vague Language Without Metrics',
        text: 'Heavy use of vague quantifiers (various, multiple, extensive) with no specific metrics. AI tends to describe achievements without measurable outcomes.',
        detail: `Vague terms: ${vagueTermScore}`
      });
    }

    const sentences = rawText.split(/[.!?]+/).filter((s: string) => s.trim().length > 10);
    let formalStartCount = 0;
    const formalStarts = ['responsible for', 'duties included', 'duties include', 'duties included:', 'responsibilities include', 'responsibilities included'];
    let actionVerbStartCount = 0;
    const actionVerbs = ['led ', 'managed ', 'developed ', 'created ', 'designed ', 'implemented ', 'built ', 'established ', 'spearheaded ', 'oversaw '];
    for (const s of sentences) {
      const trimmed = s.trim().toLowerCase();
      for (const fs of formalStarts) {
        if (trimmed.startsWith(fs)) { formalStartCount++; break; }
      }
      for (const av of actionVerbs) {
        if (trimmed.startsWith(av)) { actionVerbStartCount++; break; }
      }
    }

    const totalChecked = sentences.length || 1;
    const actionVerbRatio = actionVerbStartCount / totalChecked;

    if (formalStartCount > 2) {
      authenticityScore -= 10;
      totalAiFlags++;
      fakeFlags.push({
        type: 'formulaic_structure', severity: 'medium',
        label: 'Formulaic Job Description Style',
        text: 'Multiple bullet points start with "Responsible for" or "Duties included". AI-generated resumes often use this passive, HR-template style.',
        detail: `${formalStartCount} bullets use formal job description phrasing`
      });
    }

    if (actionVerbRatio > 0.55) {
      authenticityScore -= 10;
      totalAiFlags++;
      fakeFlags.push({
        type: 'formulaic_structure', severity: 'medium',
        label: 'Over-optimized Action Verbs',
        text: `Over ${Math.round(actionVerbRatio * 100)}% of sentences start with the same action verbs (Led, Managed, Developed). AI tends to overuse resume-optimized vocabulary.`,
        detail: `${actionVerbStartCount}/${totalChecked} sentences start with action verbs`
      });
    }

    const templateHeaders = ['core competencies', 'areas of expertise', 'professional summary', 'technical skills', 'key skills', 'relevant experience'];
    let templateHeaderCount = 0;
    const foundHeaders: string[] = [];
    for (const th of templateHeaders) {
      if (text.includes(th)) { templateHeaderCount++; foundHeaders.push(th); }
    }

    if (templateHeaderCount > 1) {
      authenticityScore -= 8;
      totalAiFlags++;
      fakeFlags.push({
        type: 'template_pattern', severity: 'low',
        label: 'AI-Template Section Structure',
        text: `Resume uses AI-generator preferred section headers (${foundHeaders.join(', ')}). These are commonly found in ChatGPT-generated resumes.`,
        detail: `Template sections: ${templateHeaderCount}`
      });
    }

    const summaryPhrases = ['professional summary', 'profile', 'objective', 'about me', 'career objective', 'personal summary'];
    let hasSummary = false;
    for (const sp of summaryPhrases) {
      if (text.includes(sp)) { hasSummary = true; break; }
    }

    let summaryGenericScore = 0;
    if (hasSummary) {
      const summaryGeneric = ['seeking a challenging', 'opportunity to leverage', 'proven track record', 'highly skilled', 'results-driven', 'team player', 'fast-paced environment', 'make a meaningful impact', 'dedicated professional', 'motivated professional'];
      for (const sg of summaryGeneric) {
        if (text.includes(sg)) summaryGenericScore++;
      }
      if (summaryGenericScore > 2) {
        authenticityScore -= 10;
        totalAiFlags++;
        fakeFlags.push({
          type: 'ai_generated', severity: 'medium',
          label: 'AI-Generated Summary Section',
          text: `Summary/Objective section contains ${summaryGenericScore} generic AI-generated phrases. Real professionals write unique, specific summaries.`,
          detail: `Generic summary: ${summaryGenericScore} templated phrases`
        });
      }
    }

    if (wordCount > 600) {
      authenticityScore -= 10;
      totalAiFlags++;
      fakeFlags.push({
        type: 'skill_stuffing', severity: 'low',
        label: 'Unusually Long Resume',
        text: `Resume is ${wordCount} words. While not definitive, AI-generated resumes tend to be verbose and include excessive keyword stuffing.`,
        detail: `Long resume: ${wordCount} words`
      });
    }

    if (wordCount > 900) {
      const extraDeduction = Math.min(15, Math.floor((wordCount - 900) / 100) * 2);
      authenticityScore -= extraDeduction;
      fakeFlags.push({
        type: 'skill_stuffing', severity: 'medium',
        label: 'Potential Keyword Stuffing',
        text: `Very long resume (${wordCount} words). This often indicates keyword stuffing to game ATS systems, a common AI-assisted tactic.`,
        detail: `Excessive length: ${wordCount} words`
      });
    }

    const expMatches = text.match(/expert(.*?)(months?|weeks?)/gi);
    if (expMatches && expMatches.length > 0) {
      authenticityScore -= 20;
      totalAiFlags++;
      fakeFlags.push({
        type: 'exaggerated_experience', severity: 'high',
        label: 'Exaggerated Experience Claims',
        text: 'Claims "Expert" status with very short timeline (months/weeks). This is a common resume inflation tactic.',
        detail: 'Expert-level claims with insufficient experience timeline'
      });
    }

    const hasEntryLevel = text.includes('entry level') || text.includes('junior');
    const hasSeniorClaim = text.includes('senior') || text.includes('lead') || text.includes('head of');
    if (hasEntryLevel && hasSeniorClaim) {
      authenticityScore -= 10;
      totalAiFlags++;
      fakeFlags.push({
        type: 'experience_inconsistency', severity: 'medium',
        label: 'Experience Level Inconsistency',
        text: 'Resume contains both "entry level"/"junior" and "senior"/"lead" claims, suggesting inflated titles.',
        detail: 'Mix of junior and senior role claims'
      });
    }

    const sections = rawText.split(/\n\s*\n/).filter(s => s.trim().length > 50);
    if (sections.length >= 3) {
      const sentenceCounts = sections.map(s => s.split(/[.!?]+/).filter(Boolean).length);
      const avgSentences = sentenceCounts.reduce((a, b) => a + b, 0) / sentenceCounts.length;
      const variance = sentenceCounts.reduce((sum, c) => sum + Math.pow(c - avgSentences, 2), 0) / sentenceCounts.length;
      if (variance < 0.5 && avgSentences > 3) {
        authenticityScore -= 8;
        totalAiFlags++;
        fakeFlags.push({
          type: 'template_pattern', severity: 'low',
          label: 'Suspiciously Consistent Section Structure',
          text: 'Every section has nearly the same number of sentences. AI-generated documents tend to produce unnaturally balanced sections.',
          detail: 'Low sentence count variance across sections'
        });
      }
    }

    const softSkillClusters = ['excellent communication', 'strong leadership', 'team player', 'problem-solving', 'critical thinking', 'time management', 'attention to detail', 'interpersonal skills'];
    let softSkillBullets = 0;
    for (const ss of softSkillClusters) {
      if (text.includes(ss)) softSkillBullets++;
    }
    if (softSkillBullets > 4) {
      authenticityScore -= 8;
      totalAiFlags++;
      fakeFlags.push({
        type: 'generic_content', severity: 'low',
        label: 'Soft Skill Overload',
        text: `Lists ${softSkillBullets} generic soft skills without specific evidence. AI tends to pad resumes with unverifiable soft skills.`,
        detail: `${softSkillBullets} generic soft skills listed`
      });
    }

    const targetedBuzzwords = ['results-driven', 'innovative', 'transformational', 'stakeholder engagement', 'operational excellence', 'customer-centric', 'strategic leadership'];
    let targetedBuzzwordCount = 0;
    const foundTargetedBuzzwords: string[] = [];
    for (const tb of targetedBuzzwords) {
      if (text.includes(tb)) { targetedBuzzwordCount++; foundTargetedBuzzwords.push(tb); }
    }
    if (targetedBuzzwordCount > 2) {
      authenticityScore -= 10;
      totalAiFlags++;
      fakeFlags.push({
        type: 'ai_generated', severity: 'medium',
        label: 'Corporate Buzzword Overload',
        text: `Heavy use of corporate jargon (${foundTargetedBuzzwords.join(', ')}). AI-generated resumes frequently overuse these buzzwords to inflate perceived impact.`,
        detail: `${targetedBuzzwordCount} corporate buzzwords`
      });
    } else if (targetedBuzzwordCount > 0) {
      authenticityScore -= 5;
      totalAiFlags++;
      fakeFlags.push({
        type: 'ai_generated', severity: 'low',
        label: 'Corporate Buzzwords Detected',
        text: `Contains corporate buzzwords such as ${foundTargetedBuzzwords.join(', ')}. Consider replacing with concrete achievements.`,
        detail: `${targetedBuzzwordCount} buzzwords`
      });
    }

    const genericAchievements = ['delivered business value', 'improved outcomes', 'enhanced effectiveness', 'drove innovation', 'drove business value', 'delivered value', 'improved efficiency', 'enhanced productivity', 'streamlined operations', 'optimized processes', 'maximized performance', 'achieved excellence'];
    let genericAchCount = 0;
    const foundGenericAch: string[] = [];
    for (const ga of genericAchievements) {
      if (text.includes(ga)) { genericAchCount++; foundGenericAch.push(ga); }
    }
    if (genericAchCount > 0) {
      const deduction = Math.min(15, genericAchCount * 5);
      authenticityScore -= deduction;
      totalAiFlags++;
      fakeFlags.push({
        type: 'generic_content', severity: deduction >= 15 ? 'high' : 'medium',
        label: 'Generic Achievement Language',
        text: `Uses ${genericAchCount} vague achievement phrases without specifics (${foundGenericAch.slice(0, 4).join(', ')}). AI generates generic "business value" claims instead of real accomplishments.`,
        detail: `${genericAchCount} generic achievement phrases`
      });
    }

    const hasPercentages = /(\d+\.?\d*%)/.test(text);
    const hasDollarAmounts = /(\$\d+[kKmMbB]?|\d+\s*(dollars|usd|eur|gbp))/.test(text);
    const hasMeasurableOutcomes = /\b(\d+[xX]|\d+%\s+(increase|decrease|reduction|growth|improvement)|reduced\s+\w+\s+by\s+\d+|increased\s+\w+\s+by\s+\d+)\b/.test(text);
    let metricScore = 0;
    if (!hasPercentages) metricScore += 7;
    if (!hasDollarAmounts) metricScore += 7;
    if (!hasMeasurableOutcomes) metricScore += 6;

    if (metricScore > 10) {
      authenticityScore -= metricScore;
      totalAiFlags++;
      fakeFlags.push({
        type: 'generic_content', severity: metricScore > 15 ? 'high' : 'medium',
        label: 'Missing Quantifiable Metrics',
        text: 'Resume lacks concrete metrics — no percentages, dollar amounts, or measurable outcomes. AI-generated content consistently avoids specific numbers because it does not have real data to reference.',
        detail: `Missing: ${!hasPercentages ? 'percentages ' : ''}${!hasDollarAmounts ? 'dollar amounts ' : ''}${!hasMeasurableOutcomes ? 'measurable outcomes' : ''}`
      });
    }

    const genericCerts = ['professional certification', 'industry certification', 'professional certificate', 'industry recognized', 'certified professional', 'accredited certification', 'certification in progress', 'pursuing certification'];
    let genericCertCount = 0;
    const foundGenericCerts: string[] = [];
    for (const gc of genericCerts) {
      if (text.includes(gc)) { genericCertCount++; foundGenericCerts.push(gc); }
    }
    if (genericCertCount > 0) {
      authenticityScore -= Math.min(10, genericCertCount * 5);
      totalAiFlags++;
      fakeFlags.push({
        type: 'generic_content', severity: 'medium',
        label: 'Generic / Unnamed Certifications',
        text: `Lists certifications without specifics (${foundGenericCerts.join(', ')}). AI frequently adds generic certification entries to pad credentials.`,
        detail: `${genericCertCount} generic certification references`
      });
    }

    const genericAwards = ['employee of the', 'award for excellence', 'recognition award', 'achievement award', 'leadership award', 'innovation award', 'performance award', 'outstanding achievement', 'employee recognition', 'spot award', 'above and beyond', 'award recipient'];
    let genericAwardCount = 0;
    const foundGenericAwards: string[] = [];
    for (const ga of genericAwards) {
      if (text.includes(ga)) { genericAwardCount++; foundGenericAwards.push(ga); }
    }
    if (genericAwardCount > 0) {
      const ded = Math.min(10, genericAwardCount * 4);
      authenticityScore -= ded;
      totalAiFlags++;
      fakeFlags.push({
        type: 'generic_content', severity: ded >= 8 ? 'medium' : 'low',
        label: 'Generic / Vague Awards',
        text: `Lists ${genericAwardCount} generic award references (${foundGenericAwards.join(', ')}). AI often fabricates or overstates awards using vague language.`,
        detail: `${genericAwardCount} generic award entries`
      });
    }

    const weakProjectPhrases = ['project involved', 'project focused on', 'project aimed at', 'goal of the project', 'objective was', 'purpose of the project', 'project to', 'initiative to', 'effort to', 'tasked with', 'assigned to', 'project scope', 'key project', 'major project', 'project deliverables'];
    let weakProjectCount = 0;
    const foundWeakProjects: string[] = [];
    for (const wp of weakProjectPhrases) {
      if (text.includes(wp)) { weakProjectCount++; foundWeakProjects.push(wp); }
    }
    if (weakProjectCount > 2) {
      const ded = Math.min(15, weakProjectCount * 4);
      authenticityScore -= ded;
      totalAiFlags++;
      fakeFlags.push({
        type: 'generic_content', severity: ded >= 12 ? 'high' : 'medium',
        label: 'Weak / Vague Project Descriptions',
        text: `${weakProjectCount} project descriptions use vague framing (${foundWeakProjects.slice(0, 4).join(', ')}). AI describes projects in abstract terms without actual implementation details.`,
        detail: `${weakProjectCount} vague project descriptions`
      });
    }

    if (totalAiFlags === 0) {
      fakeFlags.push({
        type: 'original', severity: 'none',
        label: 'Original Content',
        text: 'No obvious AI-generated patterns detected.',
        detail: 'Content appears human-written'
      });
    }

    const authenticityRisk = authenticityScore >= 80 ? 'Low' : (authenticityScore >= 60 ? 'Review' : 'High');

    let atsScore = 0;
    const atsChecks: any[] = [];

    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
    const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/.test(text);
    const hasLinkedIn = /linkedin\.com\/in\//.test(text);

    let contactScore = 0;
    if (hasEmail) contactScore += 10;
    if (hasPhone) contactScore += 5;
    if (hasLinkedIn) contactScore += 5;
    atsChecks.push({ name: 'Contact Info', score: contactScore, max: 20 });

    const checkDetails = [
      { name: 'Resume Length', max: 20 },
      { name: 'Skills Section', max: 20 },
      { name: 'Experience Section', max: 20 },
      { name: 'Education Section', max: 10 },
      { name: 'Keyword Density', max: 10 },
    ];

    if (wordCount >= 400 && wordCount <= 800) {
      atsScore += 20;
    } else if (wordCount >= 250 && wordCount <= 1000) {
      atsScore += 10;
    }
    atsChecks.push({ name: 'Resume Length', score: wordCount >= 400 && wordCount <= 800 ? 20 : (wordCount >= 250 && wordCount <= 1000 ? 10 : 5), max: 20 });

    const skillKeywords = ['javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'php', 'html', 'css', 'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'git', 'ci/cd', 'jenkins', 'rest', 'graphql', 'api', 'machine learning', 'ai', 'data', 'cloud', 'devops', 'agile', 'scrum'];
    const foundSkills = skillKeywords.filter(kw => text.includes(kw));
    const skillsScore = Math.min(20, foundSkills.length * 2);
    atsScore += skillsScore;
    atsChecks.push({ name: 'Skills Section', score: skillsScore, max: 20 });

    const hasExperience = /experience|work\s*history|employment|professional\s*experience/.test(text);
    const hasDates = /\b(19|20)\d{2}\b/.test(text);
    let expScore = 0;
    if (hasExperience) expScore += 10;
    if (hasDates) expScore += 10;
    atsScore += expScore;
    atsChecks.push({ name: 'Experience Section', score: expScore, max: 20 });

    const hasEducation = /education|degree|bachelor|master|phd|university|college/.test(text);
    let eduScore = 0;
    if (hasEducation) eduScore += 10;
    if (hasDates) eduScore += 5;
    atsScore += eduScore;
    atsChecks.push({ name: 'Education Section', score: eduScore, max: 10 });

    const resumeWords = [...new Set(words)];
    const commonWords = resumeWords.filter(w => w.length > 3).length;
    const keywordScore = Math.min(10, Math.round((commonWords / Math.max(1, resumeWords.length)) * 30));
    atsScore += keywordScore;
    atsChecks.push({ name: 'Keyword Density', score: keywordScore, max: 10 });

    atsScore = Math.min(100, atsScore);

    const overallScore = Math.round((authenticityScore + atsScore) / 2);

    const recommendations: string[] = [];
    if (!hasEmail) recommendations.push('Add your email address for recruiter contact.');
    if (!hasPhone) recommendations.push('Include a phone number so recruiters can reach you directly.');
    if (!hasLinkedIn) recommendations.push('Add your LinkedIn profile URL — most recruiters check it.');
    if (wordCount < 250) recommendations.push('Your resume is very short. Aim for 400-800 words to provide sufficient detail.');
    if (wordCount > 800) recommendations.push('Consider trimming your resume. Keep it concise and focused on relevant achievements.');
    if (foundSkills.length < 5) recommendations.push('List more relevant skills to improve ATS matching. Include both technical and soft skills.');
    if (!hasExperience) recommendations.push('Add a Work Experience section with job titles, companies, and dates.');
    if (!hasEducation) recommendations.push('Include an Education section with your degrees and institutions.');
    if (authenticityScore < 60) recommendations.push('Your resume shows strong AI-generation patterns. Replace generic phrases with specific, personal achievements and quantifiable metrics.');
    if (!hasPercentages) recommendations.push('Add percentages and statistics to your achievements (e.g., "Increased sales by 20%").');
    if (!hasDollarAmounts) recommendations.push('Include dollar amounts where relevant (e.g., "Managed $500K budget").');

    const analysisData = {
      resumeId,
      authenticityScore,
      atsScore,
      score: overallScore,
      fakeFlags: JSON.stringify(fakeFlags),
      atsChecks: JSON.stringify(atsChecks),
      findings: JSON.stringify(fakeFlags.filter((f: any) => f.severity !== 'none')),
      recommendations: JSON.stringify(recommendations),
    };

    const analysis = await prisma.analysis.create({ data: analysisData });

    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        score: overallScore,
        riskLevel: authenticityRisk
      }
    });

    res.status(201).json(analysis);
  } catch (error) {
    console.error('Analysis failed', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

router.get('/:resumeId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const resumeId = req.params.resumeId as string;
    const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    if (resume.userId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

    const analysis = await prisma.analysis.findFirst({
      where: { resumeId },
      orderBy: { id: 'desc' }
    });
    if (!analysis) return res.status(404).json({ error: 'No analysis found for this resume' });

    const result: any = {
      ...analysis,
      fakeFlags: analysis.fakeFlags ? JSON.parse(analysis.fakeFlags) : [],
      atsChecks: analysis.atsChecks ? JSON.parse(analysis.atsChecks) : [],
      findings: analysis.findings ? JSON.parse(analysis.findings) : [],
      recommendations: analysis.recommendations ? JSON.parse(analysis.recommendations) : []
    };
    delete result.score;
    res.json(result);
  } catch (error) {
    console.error('Error fetching analysis', error);
    res.status(500).json({ error: 'Failed to fetch analysis' });
  }
});

export default router;
