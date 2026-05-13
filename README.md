# GetHired - Career Path Tracker & Gap Analyzer

GetHired is a full-stack application designed to help students track their professional progress and bridge the gap to their dream roles.

## Features

- **Profile Tracing**: Connect GitHub and LinkedIn to see your public activity and profile strength.
- **Resume Alignment**: Upload your resume and a Job Description to see how well you match and what's missing.
- **DSA Tracker**: Track your DSA progress against requirements of top companies like Google, Amazon, and Meta.
- **Gap Analysis**: Identify exactly where you are lagging (skills, projects, or DSA).
- **Interactive Roadmap**: Get a step-by-step roadmap to increase your hiring probability.

## Tech Stack

- **Backend**: Spring Boot 3.3, Spring Security, Spring Data JPA, JWT Authentication
- **Frontend**: React (Vite), Framer Motion, Recharts, Lucide React
- **Database**: PostgreSQL (production), H2 (local development)
- **Design**: Modern Dark Mode with Glassmorphism

## How to Run Locally

### Backend
1. Navigate to `server/`
2. Run `mvn spring-boot:run` (or use your IDE)
3. The API starts at `http://localhost:8080`
4. H2 Console available at `http://localhost:8080/h2-console`

### Frontend
1. Navigate to `client/`
2. Run `npm install`
3. Run `npm run dev`
4. Open `http://localhost:5173`

## Deployment

### Backend → Render (Docker)

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New → Blueprint** and connect your GitHub repo
4. Render will auto-detect `render.yaml` and create:
   - A **PostgreSQL database** (`gethired-db`)
   - A **Web Service** (`gethired-api`) built from the `server/Dockerfile`
5. After deployment, note your backend URL (e.g. `https://gethired-api.onrender.com`)
6. **Update `ALLOWED_ORIGINS`** in Render's environment variables with your actual Vercel frontend URL

### Frontend → Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New → Project** and import the same GitHub repo
3. Set **Root Directory** to `client`
4. Set **Framework Preset** to `Vite`
5. Add environment variable:
   - `VITE_API_BASE_URL` = `https://<your-render-service>.onrender.com/api`
6. Deploy!

### Post-Deployment Checklist

- [ ] Update `ALLOWED_ORIGINS` in Render env vars with your actual Vercel URL
- [ ] Verify signup/login works (tests CORS + JWT)
- [ ] Verify LeetCode/GitHub profile sync works
- [ ] Verify resume analysis works
