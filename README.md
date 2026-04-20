# 🏆 RMU Sports Games 2024

University Sports Event Management System — Full MVP

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **Tailwind CSS v4**
- **pdf-lib** (certificate PDF generation)

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy and edit `.env`:

```env
DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"
```

### 3. Push schema & seed database

```bash
npx prisma db push
npx prisma db seed
```

Or with migrate dev (interactive):

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Accounts

| Email | Role |
|-------|------|
| admin@rmu.ac.th | ADMIN |
| athlete1@rmu.ac.th | ATHLETE |
| athlete2@rmu.ac.th | ATHLETE |
| manager@rmu.ac.th | MANAGER |
| staff@rmu.ac.th | STAFF |
| visitor@rmu.ac.th | VISITOR |

> No password required — just enter the email and click login.

---

## Modules

| Module | Path | Description |
|--------|------|-------------|
| Login | `/login` | Mock auth with role selection |
| Dashboard | `/dashboard` | Overview + stats + live matches |
| Tournament | `/tournament` | Sports, tournament list, single-elim bracket |
| Match Detail | `/match/[id]` | Live score, set scores, staff controls |
| Live Stream | `/live` | Live / Upcoming / Finished match tabs |
| Voting | `/vote` | Parade vote (1 per user) + leaderboard |
| Events | `/event` | Event list + RSVP registration |
| Map | `/map` | Location cards with Google Maps links |
| Gallery | `/gallery` | Albums + photo grid + lightbox + download |
| Certificate | `/certificate` | My certificates + PDF download |
| Notifications | `/notifications` | In-app notifications |
| Support | `/support` | LINE OA + contact info + FAQ |
| Admin | `/admin` | Manage sports, tournaments, teams, certs, notifs |

---

## Roles

| Role | Permissions |
|------|-------------|
| ADMIN | Full access, admin panel |
| ATHLETE | View matches, download own certs |
| MANAGER | View tournaments |
| STAFF | Update match scores |
| PERSONNEL | View all |
| VISITOR | View all, vote, register events |

---

## Score Types

| Sport | Type | Description |
|-------|------|-------------|
| Football | SIMPLE | Manual score entry |
| Basketball | POINT | Increment/decrement buttons |
| Volleyball | SET | Per-set score entry |

---

## Project Structure

```
src/
├── app/
│   ├── (main)/           # Authenticated pages with Navbar
│   │   ├── dashboard/
│   │   ├── tournament/
│   │   ├── match/[id]/
│   │   ├── live/
│   │   ├── vote/
│   │   ├── event/
│   │   ├── map/
│   │   ├── gallery/
│   │   ├── certificate/
│   │   ├── notifications/
│   │   ├── support/
│   │   └── admin/
│   ├── api/              # REST API routes
│   │   ├── auth/
│   │   ├── sports/
│   │   ├── tournaments/
│   │   ├── teams/
│   │   ├── matches/
│   │   ├── events/
│   │   ├── votes/
│   │   ├── locations/
│   │   ├── gallery/
│   │   ├── certificates/
│   │   └── notifications/
│   └── login/
├── components/
│   ├── ui/               # Button, Card, Badge, Input, etc.
│   └── layout/           # Navbar
└── lib/
    ├── prisma.ts
    ├── auth.ts
    └── utils.ts
prisma/
├── schema.prisma
└── seed.ts
```

---

## Database Scripts

```bash
npm run db:push     # Push schema to DB (no migration history)
npm run db:seed     # Run seed file
npm run db:studio   # Open Prisma Studio
```
