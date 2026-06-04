import type { Buffer } from 'buffer';

export async function tryOcrFallback(dataBuffer: Buffer, existingText: string): Promise<string> {
  if (existingText.trim().length >= 50) return existingText;
  try {
    const { createWorker } = require('tesseract.js');
    const worker = await createWorker('eng');
    const { data } = await worker.recognize(dataBuffer);
    await worker.terminate();
    const ocrText = data.text || '';
    if (ocrText.trim().length > existingText.trim().length) {
      console.log(`OCR extracted ${ocrText.trim().length} chars (was ${existingText.trim().length})`);
      return ocrText;
    }
    return existingText;
  } catch (ocrErr) {
    console.warn('OCR fallback failed:', (ocrErr as Error).message);
    return existingText;
  }
}
