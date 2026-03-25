# Startup Seeker (MERN)

Startup Seeker is a market-intelligence web app that helps users discover where startup/business ideas have the highest opportunity in India.

This project is now fully MERN + JavaScript:

- Frontend: React + Vite + Tailwind + Framer Motion + Leaflet
- Backend: Node + Express + Mongoose
- Database: MongoDB Atlas (or local MongoDB)

## Product Flow

1. User lands on India map dashboard.
2. User picks mode: Startup or Business.
3. User enters one required idea input.
4. Optional refinement input updates analysis dynamically.
5. Right panel shows opportunity score, trend signals, competition, reasoning.
6. User can open Courses popup from top button and view premium mock courses.

The overlay input auto-hides after analysis and can be reopened via Edit Query.

## Current Features

- Fullscreen map-first landing screen
- Startup/Business mode switch
- Heat-style region markers with stable animations
- AI-backed analysis with deterministic fallback
- Mongo cache + query history persistence
- In-page Courses popup with mock paid courses
- Razorpay-ready checkout backend stub

## Folder Structure

```text
startup-seeker/
	backend/
		api/index.js                  # Vercel serverless entry
		src/
			app.js
			server.js                   # local dev server bootstrap
			controllers/
				analyzeController.js
				courseController.js
			routes/
				analyze.js
				courses.js
			models/
				AnalysisCache.js
				AnalysisRequest.js
				Course.js
			services/
				llmService.js
				razorpayService.js
			utils/
				db.js
				scoring.js
				regions.js
				mockFallback.js
		vercel.json

	frontend/
		src/
			App.jsx
			main.jsx
			styles/globals.css
			components/
				map/IndiaMap.jsx
				insights/InsightPanel.jsx
				ui/IdeaInput.jsx
				ui/ModeToggle.jsx
				ui/CoursesButton.jsx
				courses/CoursesModal.jsx
				courses/CourseCard.jsx
			services/
				analyzeService.js
				courseService.js
			lib/
				scoring.js
				regions.js
				mockFallback.js
```

## API Endpoints

Base URL (local): `http://localhost:5000/api`

### Analysis

- `POST /analyze`
- `GET /history`

### Courses (new)

- `GET /courses` -> returns mock seeded premium courses
- `POST /courses/checkout` -> returns mock/live Razorpay checkout payload

## Environment Variables

Create root `.env.local`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/startup-seeker
FRONTEND_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=http://localhost:5000/api
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Fix For The Warning You Saw

If backend crashes with:

`MONGO_URI is missing. Set it in .env.local`

it means root `.env.local` does not have `MONGO_URI`.

Add it and restart:

```bash
npm run dev
```

## Local Setup

1. Install dependencies:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

2. Add `.env.local` as above.
3. Run app:

```bash
npm run dev
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Build

```bash
npm run build
```

## Deploy: Frontend + Backend Both On Vercel (Mongo Atlas)

You should create **two Vercel projects** from the same repo.

### 1. Frontend Project (Vercel)

- Root directory: `frontend`
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Env var:
	- `VITE_API_BASE_URL=https://<your-backend-vercel-domain>/api`

### 2. Backend Project (Vercel)

- Root directory: `backend`
- Uses `backend/vercel.json` and `backend/api/index.js`
- Runtime: Node serverless function
- Env vars:
	- `MONGO_URI=<atlas-connection-string>`
	- `FRONTEND_ORIGIN=https://<your-frontend-vercel-domain>`
	- `GROQ_API_KEY=...`
	- `GEMINI_API_KEY=...`
	- `RAZORPAY_KEY_ID=...`
	- `RAZORPAY_KEY_SECRET=...`

### 3. Mongo Atlas

- Use Atlas URI in backend `MONGO_URI`.
- Add Atlas network access for Vercel (or temporary allow all `0.0.0.0/0` for testing).
- Ensure database user credentials are correct.

## Razorpay Integration (Current + Future)

Current state:

- Courses popup is implemented.
- Checkout endpoint exists and returns:
	- mock order if Razorpay keys are absent
	- live order if keys are present

Future production flow:

1. User selects premium course.
2. Backend creates Razorpay order (`/courses/checkout`).
3. Frontend opens Razorpay checkout widget.
4. Backend verifies signature with `RAZORPAY_KEY_SECRET`.
5. Store successful purchases in an Enrollment collection.
6. Gate premium course content by purchase status.

## Suggested Product Updates

1. Add auth + user profiles and bind purchased courses to users.
2. Add webhooks for payment confirmation and retries.
3. Add downloadable report (PDF) for each analysis.
4. Add region drill-down (state -> city cluster) for advanced plans.
5. Add personalized course recommendations based on top opportunity states.

## Security Notes

- Never commit real API keys.
- Keep `.env.local` private.
- Rotate previously exposed keys immediately.
# StartNow
