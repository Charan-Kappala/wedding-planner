# 💍 Wedding Planner

A full-stack wedding planning app — guests, budget, vendors, tasks, seating chart, and inspiration board.

**Stack:** React 18 + Vite · Node.js + Express · PostgreSQL + Prisma · Zustand · Tailwind CSS

---

## Local Development

### Prerequisites
- Node.js 20+
- Docker (for PostgreSQL)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd wedding-planner

# Install all deps
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 2. Environment variables

```bash
cp .env.example server/.env
# Edit server/.env — fill in JWT_SECRET, JWT_REFRESH_SECRET
```

### 3. Start PostgreSQL

```bash
docker-compose up -d
```

### 4. Run database migrations

```bash
cd server
npx prisma migrate dev --name init
```

### 5. (Optional) Seed demo data

```bash
cd server
npx tsx src/prisma/seed.ts
# Demo login: demo@weddingplanner.com / password123
```

### 6. Start the app

```bash
# Terminal 1 — backend (port 4000)
cd server && npm run dev

# Terminal 2 — frontend (port 5173)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Production Deployment (Vercel + Render + Supabase)

### Step 1 — Supabase (database)

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection string → URI** and copy the **Transaction pooler** URL
3. It looks like: `postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

### Step 2 — Render (backend API)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New → Blueprint** → connect your repo
   - Render will detect `render.yaml` and create the web service automatically
3. In the Render dashboard → your service → **Environment**, add:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Your Supabase Transaction pooler URL + `?pgbouncer=true&connection_limit=1` |
   | `JWT_SECRET` | Run `openssl rand -base64 32` |
   | `JWT_REFRESH_SECRET` | Run `openssl rand -base64 32` |
   | `CLIENT_URL` | `https://your-app.vercel.app` (fill in after Vercel deploy) |

4. Deploy — Render will build the Docker image and run `prisma migrate deploy` on start

5. Copy your Render service URL (e.g. `https://wedding-planner-api.onrender.com`)

### Step 3 — Vercel (frontend)

```bash
cd client
npm install -g vercel
vercel
```

Or connect via [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo:
- **Root directory:** `client`
- **Build command:** `npm run build`
- **Output directory:** `dist`

Add this environment variable in Vercel:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-render-service.onrender.com/api/v1` |

Redeploy after setting the env var.

### Step 4 — Update CORS

Go back to Render and update `CLIENT_URL` to your actual Vercel URL.

---

## API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/auth/register` | — | Create account |
| POST | `/api/v1/auth/login` | — | Login |
| POST | `/api/v1/auth/refresh` | — | Refresh token |
| POST | `/api/v1/auth/logout` | — | Logout |
| GET | `/api/v1/auth/me` | ✓ | Get current user |
| GET | `/api/v1/wedding` | ✓ | Get wedding details |
| PUT | `/api/v1/wedding` | ✓ | Update wedding details |
| GET | `/api/v1/guests` | ✓ | List guests |
| POST | `/api/v1/guests` | ✓ | Add guest |
| PUT | `/api/v1/guests/:id` | ✓ | Update guest |
| DELETE | `/api/v1/guests/:id` | ✓ | Delete guest |
| POST | `/api/v1/guests/import` | ✓ | Bulk CSV import |
| POST | `/api/v1/guests/:id/remind` | ✓ | Send RSVP reminder |
| GET | `/api/v1/vendors` | ✓ | List vendors |
| POST | `/api/v1/vendors` | ✓ | Add vendor |
| PUT | `/api/v1/vendors/:id` | ✓ | Update vendor |
| DELETE | `/api/v1/vendors/:id` | ✓ | Delete vendor |
| POST | `/api/v1/vendors/:id/files` | ✓ | Upload contract PDF |
| GET | `/api/v1/tasks` | ✓ | List tasks |
| POST | `/api/v1/tasks` | ✓ | Create task |
| POST | `/api/v1/tasks/bulk` | ✓ | Bulk create tasks |
| PUT | `/api/v1/tasks/:id` | ✓ | Update task |
| DELETE | `/api/v1/tasks/:id` | ✓ | Delete task |
| GET | `/api/v1/expenses` | ✓ | List expenses |
| POST | `/api/v1/expenses` | ✓ | Add expense |
| PUT | `/api/v1/expenses/:id` | ✓ | Update expense |
| DELETE | `/api/v1/expenses/:id` | ✓ | Delete expense |
| GET | `/api/v1/tables` | ✓ | Get seating tables |
| POST | `/api/v1/tables` | ✓ | Create table |
| PUT | `/api/v1/tables/:id` | ✓ | Update table / position |
| DELETE | `/api/v1/tables/:id` | ✓ | Delete table |
| GET | `/api/v1/mood` | ✓ | Get inspiration images |
| POST | `/api/v1/mood/upload` | ✓ | Upload image file |
| POST | `/api/v1/mood/url` | ✓ | Add image by URL |
| PUT | `/api/v1/mood/:id` | ✓ | Update image tag/order |
| DELETE | `/api/v1/mood/:id` | ✓ | Delete image |

---

## Features

- **Auth** — JWT access + refresh tokens, persistent login
- **Dashboard** — stats cards, countdown, upcoming tasks
- **Guest List** — CRUD, RSVP tracking, CSV import, reminders
- **Budget Tracker** — expense line items, charts, CSV export
- **Vendor Manager** — cards grid, contract PDF upload
- **Task Checklist** — template, categories, progress bars, overdue tracking
- **Seating Chart** — drag-and-drop floor plan, auto-assign
- **Inspiration Board** — masonry grid, image upload, lightbox, drag-to-reorder
- **Settings** — update wedding date, venue, partner names, budget
