# 💍 Wedding Planner App — CLAUDE.md

## Project Overview

A full-stack wedding planning application that helps couples manage every aspect of their big day: guest lists, budgets, vendor bookings, timelines, seating charts, and more. Built with React (frontend) + Node.js/Express (backend) + PostgreSQL (database).

---

## Tech Stack

| Layer        | Technology                              |
|--------------|------------------------------------------|
| Frontend     | React 18, React Router v6, Tailwind CSS  |
| State Mgmt   | Zustand                                  |
| Backend      | Node.js, Express.js                      |
| Database     | PostgreSQL + Prisma ORM                  |
| Auth         | JWT (access + refresh tokens)            |
| File Storage | Local `/uploads` (dev), S3-compatible (prod) |
| Email        | Nodemailer (SMTP)                        |
| Testing      | Vitest (unit), Playwright (e2e)          |

---

## Project Structure

```
wedding-planner/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level page components
│   │   ├── store/           # Zustand state slices
│   │   ├── hooks/           # Custom React hooks
│   │   ├── api/             # Axios API client + endpoints
│   │   ├── utils/           # Helpers, formatters, constants
│   │   └── assets/          # Static images, fonts, icons
│   └── public/
│
├── server/                  # Express backend
│   ├── src/
│   │   ├── routes/          # Express route handlers
│   │   ├── controllers/     # Business logic per resource
│   │   ├── middleware/       # Auth, validation, error handler
│   │   ├── services/        # DB queries via Prisma
│   │   ├── utils/           # Email, file, date helpers
│   │   └── prisma/
│   │       └── schema.prisma
│   └── uploads/             # Local file storage (dev only)
│
├── shared/                  # Shared TS types used by both sides
│   └── types.ts
│
├── .env.example
├── docker-compose.yml       # PostgreSQL for local dev
└── CLAUDE.md                # ← you are here
```

---

## Core Features & Modules

### 1. Authentication
- Register / Login / Logout
- JWT access token (15 min) + refresh token (7 days)
- Password reset via email link
- Each couple gets one `Wedding` record tied to their account

### 2. Dashboard
- Overview cards: guests RSVP'd, budget used, days until wedding
- Quick-add buttons for guests, expenses, tasks
- Upcoming vendor appointments timeline

### 3. Guest List Manager
- Add/edit/delete guests with: name, email, phone, dietary needs, plus-one
- RSVP status: Pending / Accepted / Declined
- Table/seating assignment field
- Bulk import via CSV upload
- Send RSVP reminder emails

### 4. Budget Tracker
- Set total wedding budget
- Add expense line items: category, vendor, estimated vs actual cost
- Visual breakdown by category (pie chart)
- Budget vs. actual spend bar chart
- Export to CSV

### 5. Vendor Manager
- Add vendors: name, category (catering, florist, photographer, etc.), contact, price, status
- Status: Inquiry / Booked / Paid / Cancelled
- Notes and file attachments per vendor
- Contract upload (PDF)

### 6. Timeline & Checklist
- Pre-built wedding checklist template (12+ months to wedding day)
- Custom task creation with due dates and assignee
- Mark tasks complete; progress bar per category
- Day-of timeline builder (draggable time blocks)

### 7. Seating Chart
- Drag-and-drop table layout builder
- Assign guests to tables
- Visual floor plan view
- Auto-suggest seating based on dietary/family groups

### 8. Inspiration Board (Moodboard)
- Upload images or paste URLs
- Tag images by category (dress, flowers, venue, etc.)
- Pinterest-style masonry grid layout

### 9. Countdown & Wedding Details
- Wedding date, venue name/address
- Ceremony and reception times
- Live countdown timer

---

## Database Schema (Prisma — key models)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  wedding   Wedding?
  createdAt DateTime @default(now())
}

model Wedding {
  id           String     @id @default(uuid())
  userId       String     @unique
  user         User       @relation(fields: [userId], references: [id])
  date         DateTime?
  venueName    String?
  venueAddress String?
  budget       Float      @default(0)
  guests       Guest[]
  vendors      Vendor[]
  tasks        Task[]
  expenses     Expense[]
  tables       Table[]
}

model Guest {
  id          String   @id @default(uuid())
  weddingId   String
  wedding     Wedding  @relation(fields: [weddingId], references: [id])
  firstName   String
  lastName    String
  email       String?
  phone       String?
  rsvpStatus  String   @default("PENDING") // PENDING | ACCEPTED | DECLINED
  dietaryNeeds String?
  plusOne     Boolean  @default(false)
  tableId     String?
  table       Table?   @relation(fields: [tableId], references: [id])
}

model Vendor {
  id        String  @id @default(uuid())
  weddingId String
  wedding   Wedding @relation(fields: [weddingId], references: [id])
  name      String
  category  String
  contact   String?
  price     Float?
  status    String  @default("INQUIRY")
  notes     String?
  files     File[]
}

model Task {
  id          String   @id @default(uuid())
  weddingId   String
  wedding     Wedding  @relation(fields: [weddingId], references: [id])
  title       String
  dueDate     DateTime?
  completed   Boolean  @default(false)
  category    String?
  assignee    String?
}

model Expense {
  id          String  @id @default(uuid())
  weddingId   String
  wedding     Wedding @relation(fields: [weddingId], references: [id])
  category    String
  description String
  estimated   Float   @default(0)
  actual      Float?
  vendorId    String?
}

model Table {
  id        String  @id @default(uuid())
  weddingId String
  wedding   Wedding @relation(fields: [weddingId], references: [id])
  name      String
  capacity  Int     @default(8)
  guests    Guest[]
  posX      Float   @default(0)
  posY      Float   @default(0)
}

model File {
  id        String  @id @default(uuid())
  vendorId  String?
  vendor    Vendor? @relation(fields: [vendorId], references: [id])
  url       String
  filename  String
  mimeType  String
}
```

---

## API Conventions

- Base URL: `/api/v1`
- All protected routes require: `Authorization: Bearer <token>`
- Standard response shape:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "Human-readable message" }
```
- HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Server Error

### Key Endpoints

| Method | Path                          | Description              |
|--------|-------------------------------|--------------------------|
| POST   | /auth/register                | Create account           |
| POST   | /auth/login                   | Login                    |
| GET    | /wedding                      | Get couple's wedding     |
| PUT    | /wedding                      | Update wedding details   |
| GET    | /guests                       | List all guests          |
| POST   | /guests                       | Add guest                |
| PUT    | /guests/:id                   | Update guest             |
| DELETE | /guests/:id                   | Delete guest             |
| POST   | /guests/import                | Bulk CSV import          |
| GET    | /vendors                      | List vendors             |
| POST   | /vendors                      | Add vendor               |
| GET    | /tasks                        | List tasks               |
| POST   | /tasks                        | Create task              |
| GET    | /expenses                     | List expenses            |
| POST   | /expenses                     | Add expense              |
| GET    | /tables                       | Get seating chart        |
| POST   | /tables                       | Create table             |

---

## Code Style & Standards

- **Language**: TypeScript throughout (strict mode)
- **Linting**: ESLint + Prettier (run before every commit)
- **Naming**: camelCase variables/functions, PascalCase components/types, UPPER_SNAKE for constants
- **Components**: Functional only, no class components
- **Hooks**: Prefix all custom hooks with `use`
- **Error handling**: All async functions wrapped in try/catch; use centralized Express error middleware
- **Validation**: Zod schemas on both client (form validation) and server (request body validation)
- **No magic strings**: Use constants/enums for status values like RSVP statuses, vendor statuses, etc.

---

## Design System

- **Primary color**: Rose/blush (`#E8A0BF` / `rose-300`)
- **Accent**: Champagne gold (`#D4AF37`)
- **Background**: Warm cream (`#FAF7F2`)
- **Text**: Deep charcoal (`#2C2C2C`)
- **Font**: Cormorant Garamond (headings) + Lato (body) via Google Fonts
- **Radius**: `rounded-xl` for cards, `rounded-full` for buttons/pills
- **Shadows**: Soft, layered (`shadow-md` with warm tones)
- **Icons**: Lucide React

Component library lives in `client/src/components/ui/` — always use shared components before creating new ones.

---

## Environment Variables

```env
# Server
DATABASE_URL=postgresql://user:pass@localhost:5432/wedding_planner
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret
PORT=4000

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=yourpassword
FROM_EMAIL=noreply@weddingplanner.com

# Client
VITE_API_URL=http://localhost:4000/api/v1
```

---

## Development Commands

```bash
# Start PostgreSQL (Docker)
docker-compose up -d

# Run database migrations
cd server && npx prisma migrate dev

# Seed initial data
cd server && npx prisma db seed

# Start backend (port 4000)
cd server && npm run dev

# Start frontend (port 5173)
cd client && npm run dev

# Run all tests
npm run test

# Lint + format
npm run lint && npm run format
```

---

## Key Development Principles

1. **Mobile-first**: Every component must work on 375px screens and up
2. **Optimistic UI**: Update local state immediately, sync with server async
3. **Loading states**: Every async action needs a loading indicator
4. **Empty states**: Every list view must have a meaningful empty state with a CTA
5. **Confirmations**: Destructive actions (delete guest, cancel vendor) require a confirmation modal
6. **Accessibility**: All interactive elements need ARIA labels; maintain keyboard navigation
7. **Graceful errors**: Toast notifications for all errors; never expose raw error messages to the user

---

## What NOT To Do

- Do not use `any` type in TypeScript — use proper types or `unknown`
- Do not fetch data directly in components — use custom hooks or Zustand actions
- Do not store sensitive data (JWT secret, DB passwords) in the codebase
- Do not skip input validation on the server — always validate with Zod
- Do not use inline styles — use Tailwind utility classes
- Do not create new UI primitives when shared components already exist