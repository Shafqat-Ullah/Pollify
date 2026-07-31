# Pollify

A modern polling and community voting platform built on the MERN stack.

## Stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router, TanStack Query, React Hook Form + Zod, Framer Motion, Recharts
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, Helmet, express-rate-limit
- **Database:** MongoDB Atlas
- **Deployment:** Frontend → Vercel · Backend → Render · Database → MongoDB Atlas

## Project structure

```
pollify/
├── backend/
│   ├── controllers/     # request handlers
│   ├── routes/           # route definitions
│   ├── models/           # Mongoose schemas
│   ├── middlewares/       # auth, error handling, rate limiting, uploads
│   ├── services/          # business logic helpers (tokens, hashing)
│   ├── validators/        # express-validator rule sets
│   ├── config/            # db.js, cloudinary.js
│   ├── utils/              # ApiError, asyncHandler, token helpers
│   ├── app.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/    # ui/, layout/, poll/
│       ├── pages/          # route-level views
│       ├── layouts/        # MainLayout, AuthLayout
│       ├── contexts/       # AuthContext
│       ├── services/       # api.js (axios), *Service.js
│       ├── routes/         # ProtectedRoute, AdminRoute
│       └── App.jsx
├── render.yaml
└── README.md
```

## Local setup

### 1. Backend

```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT secrets, Cloudinary keys
npm install
npm run dev                # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173, proxies /api to :5000
```

Register a user, then in MongoDB Atlas manually set that user's `role` field to
`"admin"` to access `/admin`.

## Environment variables

**backend/.env**

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | random long strings, keep secret |
| `JWT_ACCESS_EXPIRES` / `JWT_REFRESH_EXPIRES` | e.g. `15m`, `7d` |
| `CLIENT_URL` | frontend origin, used for CORS |
| `CLOUDINARY_*` | avatar/image upload credentials |
| `SMTP_*`, `EMAIL_FROM` | for verification/reset emails (wire up nodemailer in `auth.controller.js`) |

**frontend/.env** — only needed if not using the Vite dev proxy; see `.env.example`.

## API overview

All routes are prefixed `/api`.

- `POST /auth/register` · `POST /auth/login` · `POST /auth/logout` · `POST /auth/refresh`
- `POST /auth/forgot-password` · `POST /auth/reset-password` · `GET /auth/verify-email/:token`
- `GET /polls` (search/sort/paginate) · `POST /polls` · `GET/PUT/DELETE /polls/:id`
- `PATCH /polls/:id/status` · `POST /polls/:id/vote` · `GET /polls/:id/results`
- `GET/POST /polls/:id/comments` · `DELETE /polls/:id/comments/:commentId`
- `POST /polls/:id/like` · `POST /polls/:id/bookmark` · `POST /polls/:id/report`
- `GET /users/me/dashboard` · `PUT /users/me` · `PUT /users/me/avatar` · `PUT /users/me/password`
- `GET /users/:username` · `POST /users/:id/follow`
- `GET /categories` (admin: `POST/PUT/DELETE`)
- `GET /notifications` · `PATCH /notifications/:id/read` · `PATCH /notifications/read-all`
- `/admin/*` — dashboard stats, user/poll/report management (admin role only)

## Deployment

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Add a database user and allow network access from `0.0.0.0/0` (or Render's IPs).
3. Copy the connection string into `MONGO_URI`.

### Backend → Render
1. Push this repo to GitHub.
2. In Render, "New Web Service" → connect the repo → it will pick up `render.yaml`.
3. Set the `sync: false` env vars in the Render dashboard (Mongo URI, JWT secrets, client URL, Cloudinary keys).
4. Deploy. Note the resulting URL (e.g. `https://pollify-api.onrender.com`).

### Frontend → Vercel
1. Import the repo in Vercel, set **root directory** to `frontend`.
2. Framework preset: Vite.
3. Add a rewrite for `/api/*` to your Render backend URL (via `vercel.json` or an environment-based axios baseURL), or set `VITE_API_URL` and update `src/services/api.js` to use it in production.
4. Deploy.

### Post-deploy
- Update the backend's `CLIENT_URL` to the live Vercel URL (for CORS).
- Update Cloudinary/Atlas network rules if needed.

## What's implemented vs. stubbed

Implemented end-to-end: auth (register/login/refresh/logout/password reset/email verify),
poll CRUD + publish/draft/close, single/multiple/text poll voting with duplicate-vote
prevention, live results, comments, likes, bookmarks, follow system, notifications,
admin dashboard (users/polls/reports), dashboard stats with a chart, explore feed with
search/sort/infinite scroll, responsive glassmorphism UI in the specified color system.

Stubbed for you to finish: outbound email sending (verification/reset tokens are
generated but not emailed — wire up `nodemailer` in `auth.controller.js` using the
`SMTP_*` env vars), image poll options (schema supports it, UI doesn't yet upload
images for options), and scheduled poll auto-publish (a cron job or Render scheduled
job hitting a "publish due polls" endpoint would close the loop).
