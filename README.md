# Pollify

> A modern polling & community voting platform — ask, vote, discuss, and decide in real time.

Pollify lets anyone create a poll in seconds, collect votes instantly, and discover what their community
truly thinks. Built on the MERN stack with a dark glassmorphism UI, JWT auth, live results, comments,
likes, follows, and a full admin dashboard.

## Live demo

- **Frontend:** [pollify-live-frontend.vercel.app](https://pollify-live-frontend.vercel.app)
- **Backend API:** `https://<your-render-service>.onrender.com/api`

## Features

- 🔐 **Auth** — register, login, logout, access/refresh tokens (httpOnly cookies), OTP email verification, password reset
- 📊 **Polls** — single, multiple, and text polls; publish/draft/close; anonymous mode; scheduled expiry
- 🗳️ **Live voting** — real-time percentage results with animated bars and duplicate-vote prevention
- 💬 **Engagement** — comments, likes, bookmarks, reports, follow system, and notifications
- 🔍 **Explore** — search, sort (newest/trending/most voted), pagination, infinite scroll
- 🛡️ **Admin** — dashboard stats, user management (ban/unban), poll moderation, report handling
- 🎨 **UI** — dark glassmorphism, Framer Motion animations, Recharts analytics, fully responsive

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router, TanStack Query, React Hook Form + Zod, Framer Motion, Recharts |
| Backend | Node.js, Express, MongoDB (Mongoose), JWT auth, Helmet, express-rate-limit |
| Database | MongoDB Atlas |
| Uploads | Cloudinary |
| Deployment | Frontend → Vercel · Backend → Render · Database → MongoDB Atlas |

## Project structure

```
pollify/
├── backend/                  # Express REST API
│   ├── controllers/          # request handlers
│   ├── routes/               # route definitions
│   ├── models/               # Mongoose schemas
│   ├── middlewares/          # auth, error handling, rate limiting, uploads
│   ├── services/             # business logic (tokens, hashing, email)
│   ├── validators/           # express-validator rule sets
│   ├── config/               # db.js, cloudinary.js
│   ├── utils/                # ApiError, asyncHandler, token helpers
│   ├── app.js
│   └── server.js
├── frontend/                 # React + Vite SPA
│   └── src/
│       ├── components/       # ui/, layout/, poll/
│       ├── pages/            # route-level views (incl. auth/)
│       ├── layouts/          # MainLayout
│       ├── contexts/         # AuthContext
│       ├── services/         # api.js (axios), pollService, authService
│       ├── routes/           # ProtectedRoute, AdminRoute
│       └── App.jsx
├── render.yaml               # Render blueprint (backend)
└── README.md
```

## Getting started

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster
- (optional) Cloudinary account for avatar uploads
- (optional) SMTP credentials for transactional email

### 1. Backend

```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT secrets, Cloudinary keys
npm install
npm run dev               # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173 (proxies /api to :5000)
```

To make a user an admin, open MongoDB Atlas and set that user's `role` field to `"admin"`.

## Environment variables

### backend/.env

| Variable | Description |
|---|---|
| `PORT` | server port (default `5000`) |
| `NODE_ENV` | `development` \| `production` |
| `MONGO_URI` | MongoDB Atlas connection string (required) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | long random strings — keep secret |
| `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` | e.g. `15m`, `7d` |
| `CLIENT_URL` | frontend origin (CORS) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | avatar upload credentials |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | OTP verification / password reset emails |

### frontend/.env

Only needed if not using the Vite dev proxy.

| Variable | Description |
|---|---|
| `VITE_API_URL` | backend base URL, e.g. `https://pollify-api.onrender.com/api` |

## API overview

All routes are prefixed with `/api`.

- **Auth** — `POST /auth/register` · `POST /auth/login` · `POST /auth/logout` · `POST /auth/refresh`
  · `POST /auth/forgot-password` · `POST /auth/reset-password` · `GET /auth/verify-email/:token`
- **Polls** — `GET /polls` (search/sort/paginate) · `POST /polls` · `GET/PUT/DELETE /polls/:id`
  · `PATCH /polls/:id/status` · `POST /polls/:id/vote` · `GET /polls/:id/results`
  · `GET/POST /polls/:id/comments` · `DELETE /polls/:id/comments/:commentId`
  · `POST /polls/:id/like` · `POST /polls/:id/bookmark` · `POST /polls/:id/report`
- **Users** — `GET /users/me/dashboard` · `PUT /users/me` · `PUT /users/me/avatar` · `PUT /users/me/password`
  · `GET /users/:username` · `POST /users/:id/follow`
- **Categories** — `GET /categories` (admin: `POST/PUT/DELETE`)
- **Notifications** — `GET /notifications` · `PATCH /notifications/:id/read` · `PATCH /notifications/read-all`
- **Admin** — `GET /admin/dashboard` · user/poll/report management

Health check: `GET /api/health`

## Deployment

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Add a database user and allow network access from `0.0.0.0/0` (or your host IPs).
3. Copy the connection string into `MONGO_URI`.

### Backend → Render

1. Push this repo to GitHub.
2. In Render: **New +** → **Blueprint** and select the repo — it picks up `render.yaml`.
3. Fill in the `sync: false` env vars in the dashboard:
   `MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `CLOUDINARY_*`.
4. Deploy, then note the service URL, e.g. `https://pollify-api.onrender.com`.

### Frontend → Vercel

1. Import the repo in Vercel and set **root directory** to `frontend`.
2. Framework preset: **Vite**.
3. Set `VITE_API_URL` to your Render backend URL, or add a `/api/*` rewrite.
4. Deploy, then update the backend's `CLIENT_URL` to the live Vercel URL (CORS).

## Roadmap

- [ ] Wire up real SMTP delivery for verification/reset emails
- [ ] Image upload for poll options (schema already supports it)
- [ ] Scheduled auto-publish of due polls (cron / Render scheduled job)

## License

MIT © Pollify
