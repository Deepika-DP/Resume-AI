# ResumeShield AI - Project Flow & Architecture

## Overview
A recruiter-focused AI-powered resume analysis and job matching platform. Analyzes resume authenticity, detects AI-generated content, and matches candidates to job descriptions.

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Frontend    | Vue 3 (Composition API, `<script setup>`), TypeScript, Vite |
| State Mgmt  | Pinia                                           |
| Routing     | Vue Router (web history mode)                   |
| Styling     | Tailwind CSS                                    |
| HTTP Client | Axios                                           |
| Charts      | Chart.js + vue-chartjs                          |
| Backend     | Express.js, TypeScript                          |
| ORM         | Prisma (SQLite dev, PostgreSQL prod)            |
| Auth        | JWT (bcryptjs for hashing)                      |
| File Upload | Multer                                          |
| PDF Parsing | pdf-parse                                       |
| Containers  | Docker, Docker Compose                          |

---

## Project Structure

```
Resumne-AI/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # DB schema (User, Resume, Analysis, Job, Report)
│   │   ├── dev.db           # SQLite dev database
│   │   └── seed.ts
│   ├── src/
│   │   ├── index.ts         # Express app entry - mounts all route groups
│   │   ├── routes/
│   │   │   ├── auth.routes.ts       # POST /register, /login, GET /me
│   │   │   ├── resume.routes.ts     # POST /upload, GET /, GET /:id, DELETE /:id
│   │   │   ├── analysis.routes.ts   # POST /:resumeId - runs authenticity checks
│   │   │   ├── job.routes.ts        # POST / (create job), POST /match/:resumeId
│   │   │   ├── report.routes.ts     # GET /, GET /:resumeId (generate PDF)
│   │   │   └── analytics.routes.ts  # GET /dashboard
│   │   ├── controllers/    # (empty - logic lives in routes)
│   │   ├── middleware/      # (empty)
│   │   ├── services/        # (empty)
│   │   ├── types/           # (empty)
│   │   └── utils/           # (empty)
│   ├── uploads/             # Uploaded resume files (Multer destination)
│   ├── Dockerfile
│   ├── .env                 # DATABASE_URL, JWT_SECRET, PORT
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.ts              # App bootstrap: Vue + Pinia + Router
│   │   ├── App.vue              # Root component (dark layout shell)
│   │   ├── index.css / style.css
│   │   ├── router/
│   │   │   └── index.ts         # Route definitions
│   │   ├── pages/
│   │   │   ├── Landing.vue          # Welcome page (/) → Login / Register
│   │   │   ├── Login.vue            # Mock login → /dashboard
│   │   │   ├── Register.vue         # Mock register → /dashboard
│   │   │   ├── Dashboard.vue        # Main hub: stats, recent uploads table
│   │   │   ├── ResumeUpload.vue     # Drag-drop upload → auto-analysis → candidate detail
│   │   │   ├── ResumeAnalysis.vue   # Hardcoded mock analysis display page
│   │   │   ├── CandidateDetail.vue  # Single candidate view with score & findings
│   │   │   ├── JobMatch.vue         # Select resume + paste JD → match score
│   │   │   ├── Reports.vue          # Resume list with status + generate PDF
│   │   │   ├── Comparison.vue       # WIP
│   │   │   ├── Settings.vue         # WIP
│   │   │   └── NotFound.vue         # 404 page
│   │   ├── components/
│   │   │   ├── Common/              # (empty)
│   │   │   ├── Dashboard/           # (empty)
│   │   │   ├── Job/                 # (empty)
│   │   │   ├── Resume/              # (empty)
│   │   │   └── HelloWorld.vue
│   │   ├── services/
│   │   │   ├── auth.service.ts      # Axios wrappers for /auth/*
│   │   │   ├── resume.service.ts    # Axios wrappers for /resumes/*
│   │   │   ├── job.service.ts       # Axios wrappers for /jobs/*
│   │   │   └── analytics.service.ts # Axios wrappers for /analytics/*
│   │   ├── stores/
│   │   │   ├── auth.store.ts        # User, token, isAuthenticated state
│   │   │   ├── resume.store.ts      # Resumes list, current resume, upload state
│   │   │   ├── job.store.ts         # Current job, match results
│   │   │   ├── analytics.store.ts   # Dashboard data
│   │   │   └── ui.store.ts          # Sidebar toggle, theme
│   │   ├── types/                   # (empty)
│   │   └── utils/
│   │       ├── constants.ts         # API_URL, MAX_FILE_SIZE, SUPPORTED_FORMATS
│   │       ├── formatting.ts        # formatCurrency, formatDate
│   │       ├── helpers.ts           # debounce
│   │       └── validation.ts        # validateEmail, validatePassword
│   ├── Dockerfile (multi-stage build → nginx)
│   ├── vite.config.ts
│   └── .env
│
└── docker-compose.yml               # PostgreSQL + Backend + Frontend
```

---

## Database Schema (Prisma)

| Model    | Fields                                                                 |
|----------|------------------------------------------------------------------------|
| User     | id (uuid), name, email (unique), passwordHash, createdAt, resumes[]    |
| Resume   | id (uuid), userId, user (relation), fileName, fileUrl, score?, riskLevel?, createdAt, analyses[], reports[] |
| Job      | id (uuid), title, description                                          |
| Analysis | id (uuid), resumeId, resume (relation), score, riskLevel, findings (JSON string), **authenticityScore?** (Int), **atsScore?** (Int), **recommendations?** (String - JSON) |
| Report   | id (uuid), resumeId, resume (relation), pdfUrl                         |

---

## API Endpoints

| Method | Path                          | Description                                      |
|--------|-------------------------------|--------------------------------------------------|
| POST   | /auth/register                | Register new user (no password hashing)          |
| POST   | /auth/login                   | Login user (plain text password comparison)      |
| GET    | /auth/me                      | Get first user in DB (no JWT middleware)         |
| POST   | /resumes/upload               | Upload resume file (multipart, Multer)           |
| GET    | /resumes                      | List all resumes (newest first)                  |
| GET    | /resumes/:id                  | Get single resume by ID                          |
| DELETE | /resumes/:id                  | Delete a resume                                  |
| POST   | /analysis/:resumeId           | Run authenticity + ATS analysis on uploaded resume |
| GET    | /analysis/:resumeId           | Get latest analysis for a resume                  |
| POST   | /jobs                         | Create a job description                         |
| POST   | /jobs/match/:resumeId         | Match resume against job description             |
| GET    | /reports                      | List all reports (with resume data)              |
| GET    | /reports/:resumeId            | Generate report record for a resume              |
| GET    | /analytics/dashboard          | Get dashboard statistics                         |

---

## User Flow (End-to-End)

```
Landing (/) → Login/Register → Dashboard
                                  │
                                  ├── Upload Resume → auto-trigger Analysis → Candidate Detail
                                  │
                                  ├── Job Match (select resume + paste JD → match score)
                                  │
                                  ├── Reports (list resumes + generate PDF)
                                  │
                                  └── Candidate Detail (click from dashboard table)

Upload → Analysis flow (Two-Track):
  1. User selects file (drag-drop or click)
  2. POST /resumes/upload (Multer saves to uploads/, Resume row created)
  3. POST /analysis/:resumeId (backend runs TWO analysis tracks)
     - **Track 1 (Authenticity)**: PDF parsed → checks AI buzzwords, skill stuffing,
       exaggerated experience, inconsistencies → authenticityScore (0-100) + fakeFlags[]
     - **Track 2 (ATS)**: Evaluates length, sections, bullet points, contact info,
       keywords → atsScore (0-100) + atsChecks[] + recommendations[]
  4. Analysis record created (stores both scores + findings JSON), Resume updated
  5. Router navigates to /candidate/:id

Candidate Detail Page (Two-Panel View):
  - **Left Panel - Authenticity Check**: Lists all fake flags with severity (high/medium/low)
    - High severity (red) → "AI-Generated Content Detected", "Exaggerated Experience Claims"
    - Medium severity (amber) → "Potential Skill Stuffing", "Experience Level Inconsistency"
    - Low severity (blue) → "Possible AI Assistance"
    - Clean (green) → "Original Content"
    - Shows authenticity score out of 100 + final verdict (Genuine / Needs Review / Suspected Fake)
  - **Right Panel - ATS Score**: Progress bars for each ATS check category
    - Resume Length, Section Completeness, Bullet Point Usage, Contact Info, Keywords
    - Overall ATS score out of 100
    - Actionable recommendations list to improve score

Job Match flow:
  1. User selects a resume from dropdown (fetched from GET /resumes)
  2. User pastes/publishes job description text
  3. POST /jobs/match/:resumeId with description
  4. Backend uses dummy random scoring (skills 50%, experience 30%, education 20%)
  5. Match results displayed in circular gauge + progress bars

Dashboard:
  - GET /analytics/dashboard → totalResumes, averageScore, highRiskCandidates, recentUploads (5) + analyses[]
  - GET /auth/me → current user (first user in DB)
  - Stats cards: Total Resumes, Avg Authenticity Score, Suspected Fake count, Avg ATS Score
  - Table columns: Candidate Name, Uploaded Date, **Authenticity** (score), **ATS Score**, **Verdict** (Genuine/Review/Suspected Fake), Action
```

---

## Two-Track Analysis System (Backend: `analysis.routes.ts`)

The analysis now produces **two separate scores** when a resume is analyzed.

### Track 1: Authenticity Score (Fake Detection)
Detects if a resume is AI-generated, inflated, or fabricated. Score starts at **100** and deducts for flags.

| Check                          | Penalty     | Description                                              |
|--------------------------------|-------------|----------------------------------------------------------|
| AI Buzzword Detection          | -30 or -10  | Scans for ChatGPT phrases: "delve", "testament to", "synergy", "leverage", "game-changer", etc. |
| Skill Stuffing (long resume)   | -15         | If resume > 800 words, flag as potential stuffing        |
| Exaggerated Experience         | -20         | Regex match "Expert.*months/weeks" pattern               |
| Experience Inconsistency       | -10         | Both "entry level"/"junior" and "senior"/"lead" claims   |
| **Result**                     | ≥80 = Low Risk (Genuine), ≥60 = Review, <60 = High Risk (Suspected Fake) |

### Track 2: ATS Score (Resume Quality)
Evaluates how well a resume would perform with Applicant Tracking Systems. Max **100 points**.

| Check                    | Weight  | Description                                              |
|--------------------------|---------|----------------------------------------------------------|
| Resume Length            | 30 pts  | Ideal range 300-800 words                                |
| Section Completeness     | 25 pts  | Checks for education, experience, skills, summary, etc.  |
| Bullet Point Usage       | 15 pts  | ATS systems prefer bullet-pointed content                |
| Contact Information      | 15 pts  | Email + phone presence                                   |
| Keyword Optimization     | 15 pts  | Industry-relevant keywords (tech, soft skills)           |
| **Recommendations**      | —       | Actionable suggestions to improve ATS compatibility      |

### Overall Score
The `score` field on the Resume is the average of both tracks: `(authenticityScore + atsScore) / 2`.

> **Note**: All checks are heuristic/dummy. PDF parsing has fallback to mock text. No real AI/ML model is used.

---

## Current State / Limitations

- **Two-track analysis implemented**: Authenticity (fake detection) and ATS (resume quality) scores are produced separately with detailed flags and recommendations
- **Auth is insecure**: Passwords stored as plain text, no JWT validation middleware, `/auth/me` returns the first user in DB
- **Analysis is heuristic-based**: Scores deduct for keyword/regex pattern matches; PDF parsing may fail and fall back to hardcoded text. No real AI/ML model is used
- **Job matching is random**: Scores are generated with `Math.random()` in ranges, no actual skill extraction or comparison
- **Report generation is a stub**: Creates a DB record with a fake `pdfUrl`, no actual PDF file is generated
- **Empty directories**: `controllers/`, `middleware/`, `services/`, `types/` in backend and `components/*` directories in frontend are empty placeholders
- **PDF parsing fallback**: If PDF reading fails, the analysis falls back to analyzing the string `"mock text with delve synergy and proactive approach"`
- **All services create separate Axios instances** instead of sharing one configured instance
- **Components directories are empty** — all UI logic lives directly in page files
- **No auth guards** on routes — any user can access any page
