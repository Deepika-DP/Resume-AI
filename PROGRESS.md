# Progress Summary

## ✅ Solved: PDF Parsing (Root Cause)
- `pdf-parse` v2 requires `DOMMatrix` (browser API from `@napi-rs/canvas`) and pdfjs worker, which fail on Vercel serverless
- `pdf-parse` v1 has hardcoded `fs.readFileSync('./test/data/*.pdf')` at init that crashes when test files aren't present
- **Final fix**: `pdfjs-dist@2.5.207` (pre-worker era) — pure JS, no worker/DOMMatrix needed, works without any configuration
- Both `analysis.routes.ts` and `job.routes.ts` use `require('pdfjs-dist')` directly inside the handler

## ✅ All 6 Route Groups Load
- auth, resumes, analysis, jobs, reports, analytics — all return expected JSON on production

## ✅ File Parsing
- PDF: `pdfjs-dist@2.5.207` (pre-worker era) — pure JS, no worker/DOMMatrix needed
  - Worker preloaded via `globalThis.pdfjsWorker = require('pdfjs-dist/build/pdf.worker.js')` before `getDocument()` to avoid lazy `eval("require")` path on Vercel
  - Extracts text via `getDocument({data: Uint8Array}).promise`
- DOCX: `mammoth` via dynamic `import()` (lazy)
- Both parsers lazy-loaded inside route handler to avoid Vercel module-init crashes

## ✅ Infrastructure
- SQLite in `/tmp` with auto-created tables on cold start
- Single PrismaClient instance (shared across routes)
- CORS `{ origin: true, credentials: true }`
- `.vercelignore` excludes `frontend/.env` from deployment
- Lazy route init via `initModules()` promise middleware
- `vercel.json` uses `experimentalServices` with Express framework

## 🔜 Next
- Test full upload→analyze flow end-to-end on production
- Migrate from ephemeral SQLite to persistent DB (Turso/Neon)
- Remove deprecated `vercel.json` builds section
