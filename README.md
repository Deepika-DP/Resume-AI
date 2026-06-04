# ResumeShield AI API Documentation

## Auth Endpoints
- `POST /auth/register`: Register a new recruiter
- `POST /auth/login`: Login recruiter
- `GET /auth/me`: Get current user profile

## Resume Endpoints
- `POST /resumes/upload`: Upload PDF or DOCX file (multipart/form-data)
- `GET /resumes`: List all resumes
- `GET /resumes/:id`: Get resume details
- `DELETE /resumes/:id`: Delete a resume

## Analysis Endpoints
- `POST /analysis/:resumeId`: Trigger authenticity and fake check on resume

## Job Match Endpoints
- `POST /jobs`: Create a new job description
- `POST /jobs/match/:resumeId`: Calculate match score between resume and job

## Report Endpoints
- `GET /reports/:resumeId`: Generate and download candidate report PDF

## Analytics Endpoints
- `GET /analytics/dashboard`: Retrieve recruiter dashboard statistics

# Deployment Configuration
- **Database**: Host PostgreSQL on Supabase. Update `DATABASE_URL` in `.env`.
- **Backend**: Deploy `backend/` to Render. Provide `DATABASE_URL`, `JWT_SECRET`.
- **Frontend**: Deploy `frontend/` to Vercel. Set `VITE_API_URL` to Render backend URL.
