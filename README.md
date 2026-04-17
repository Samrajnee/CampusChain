# CampusChain

A unified platform for student–institution operations. CampusChain consolidates governance, identity, and campus management into a single system — replacing scattered tools, paper trails, and ad-hoc forms with a structured, auditable record for every student from enrollment to graduation.

> **Repository:** [github.com/Samrajnee/CampusChain](https://github.com/Samrajnee/CampusChain)  
> **Status:** Pre-MVP · Active Development

-----

## Table of Contents

- [What This Is](#what-this-is)
- [Feature Scope](#feature-scope)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Build Order](#build-order)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Background Jobs](#background-jobs)
- [Contributing](#contributing)

-----

## What This Is

Most institutions manage student life across 5–10 disconnected tools: Google Forms for complaints, Excel sheets for attendance, WhatsApp for announcements, paper certificates for achievements. None of these talk to each other. Nothing is searchable. Nothing is verifiable.

CampusChain replaces that with three interconnected layers:

|Layer                    |What it does                                        |
|-------------------------|----------------------------------------------------|
|**Governance**           |Elections, proposals, grievances, polls             |
|**Identity & Reputation**|Verified certificates, badges, XP, portfolio        |
|**Campus Operations**    |Events, clubs, attendance, announcements, mentorship|

Every action a student takes — attending an event, casting a vote, submitting a proposal, earning a badge — feeds into a permanent, tamper-evident record attached to their profile. That record is theirs to share with employers, institutions, or anyone with a verification link.

-----

## Feature Scope

### Governance

- Secure elections with voter eligibility verification and a tamper-evident audit log
- One-student-one-vote enforcement via unique voter tokens (anonymous mode supported)
- Public proposal portal with upvote/downvote prioritization
- Archived proposal history with soft-delete (records never destroyed)
- Grievance tracker: Submitted → Under Review → Resolved, with auto-escalation after a configurable timeout
- Quick polls with live results, separate from formal elections

### Identity & Reputation

- Email/password auth + Google OAuth2
- Digitally signed certificates with unique IDs and QR code verification
- Public `/verify/:certificateId` endpoint — no login required
- Student portfolio page: earned credentials, badges, activity timeline
- Privacy controls: students choose what is visible (CGPA, address, blood group, etc.)
- Achievement badges: unlocked automatically based on contribution thresholds
- XP ledger: every action earns points; level progression from Newbie → Leader
- Fun peer-assigned nametags (e.g., Best Speaker, Class Rep, Most Creative)
- Skill endorsements: peers vouch for each other’s abilities
- Auto-generated resume PDF from achievements, roles, and XP history
- Shareable portfolio link for employer or external use

### Campus Operations

- Event management: creation, committee assignment, RSVP, QR check-in
- Automatic badge issuance on confirmed event attendance
- Club profiles: member lists, upcoming events, past achievements
- Faculty advisor approval workflow for club activities
- Budget request and approval system for student bodies
- Attendance tracking for club meetings and campus events

### Communication

- Role-based announcements (principal → all; teacher → class; club head → members)
- In-app notifications with read receipts
- Weekly digest: auto-generated bulletin of new proposals, events, and announcements

### Social & Directory

- Student directory: searchable by department, year, badge, skill
- Semester-wise leaderboard based on participation, votes, and proposals
- Mentorship matching: senior students paired with juniors based on interests/skills

### Admin

- Admin dashboard: student search, voter turnout, popular proposals
- Export: CSV and PDF reports for institutional records
- Manual override with full audit log for edge cases
- Role hierarchy: Principal → HOD → Teacher → Lab Assistant / Librarian → Student

-----

## Architecture

```
┌─────────────────────────────────────────────────────┐
│          Client Layer (React SPA + Vite)            │
│       REST / WebSocket (Socket.IO)                  │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│        API Gateway (Express.js)                     │
│   Auth middleware · RBAC · Rate limiting            │
└──────────────────────┬──────────────────────────────┘
                       │ Domain Service Modules
     ┌─────────────────┼──────────────────────┐
     ▼                 ▼                      ▼
┌──────────┐    ┌────────────┐    ┌──────────────────┐
│ Identity │    │ Governance │    │  Campus Ops      │
│ auth     │    │ elections  │    │  events · clubs  │
│ certs    │    │ proposals  │    │  RSVP · budget   │
│ badges   │    │ grievances │    │  attendance      │
│ XP · CV  │    │ polls      │    │                  │
└──────────┘    └────────────┘    └──────────────────┘
     ▼                 ▼                      ▼
┌──────────┐    ┌────────────┐    ┌──────────────────┐
│Notifs    │    │ Social &   │    │ Admin &          │
│announce  │    │ Mentorship │    │ Reporting        │
│digest    │    │ directory  │    │ dashboard · CSV  │
│read recv │    │ leaderboard│    │ audit log        │
└──────────┘    └────────────┘    └──────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│      Background Jobs (BullMQ + Redis)               │
│  badge issuance · PDF gen · digest · escalation     │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│             Data & Infrastructure                   │
│  PostgreSQL · Redis · Cloudinary · Resend/SMTP      │
└─────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                 Utility Layer                       │
│  qrcode.js · Puppeteer/PDFKit · Node crypto (HMAC) │
└─────────────────────────────────────────────────────┘
```

The server is a **single Node.js process** organized into domain modules — not microservices. This keeps deployment simple (one server, one database) while maintaining clean separation between domains. Each module owns its own routes, controllers, and service logic. All modules share the same Prisma client and fire events to the XP ledger.

-----

## Tech Stack

|Layer            |Choice                |Reason                                                |
|-----------------|----------------------|------------------------------------------------------|
|Frontend         |React + Vite          |Fast build, HMR, widely understood                    |
|Styling          |TailwindCSS           |Utility-first, no CSS file sprawl                     |
|Data fetching    |TanStack Query        |Caching, background refetch, deduplication            |
|Global state     |Zustand               |Lightweight; avoids Redux overhead for this scale     |
|Routing          |React Router v6       |Standard, supports nested layouts                     |
|Realtime (client)|Socket.IO client      |Pairs with server for live polls and notifications    |
|Charts           |Recharts              |Simple React-native chart library                     |
|Backend          |Node.js + Express.js  |Minimal overhead, huge ecosystem                      |
|ORM              |Prisma + PostgreSQL   |Type-safe queries, auto-generated migrations          |
|Sessions / Cache |Redis                 |Sessions, pub/sub, job queues                         |
|Job queue        |BullMQ (on Redis)     |Reliable async processing with retries                |
|Auth             |Passport.js           |Handles JWT + Google OAuth2 in one library            |
|Anonymous voting |Short-lived signed JWT|Scoped per election, no user identity stored          |
|Certificates     |Node `crypto` (HMAC)  |No PKI needed at this scale                           |
|QR codes         |`qrcode` npm package  |Lightweight, no external service                      |
|PDF generation   |Puppeteer or PDFKit   |Resume + certificate PDF export                       |
|File storage     |Cloudinary            |Free tier sufficient; handles images/banners/templates|
|Email            |Resend (or Nodemailer)|Transactional email, OTP, weekly digest               |

-----

## Folder Structure

```
campuschain/
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/                   # API client, auth helpers
│   └── vite.config.js
│
├── server/                        # Express backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── identity/          # auth, profiles, certs, badges, XP, CV
│   │   │   ├── governance/        # elections, proposals, grievances, polls
│   │   │   ├── campus-ops/        # events, clubs, budget, attendance
│   │   │   ├── notifications/     # announcements, digest, read receipts
│   │   │   ├── social/            # directory, leaderboard, endorsements, mentorship
│   │   │   └── admin/             # dashboard, exports, audit log
│   │   ├── jobs/                  # BullMQ workers
│   │   │   ├── badgeWorker.js
│   │   │   ├── pdfWorker.js
│   │   │   ├── digestWorker.js
│   │   │   └── escalationWorker.js
│   │   ├── lib/                   # crypto, QR, PDF, email utilities
│   │   ├── middleware/            # auth, RBAC, rate limiting
│   │   └── app.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── docker-compose.yml             # Postgres + Redis for local dev
└── README.md
```

-----

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Docker + Docker Compose (for local Postgres and Redis)
- A Cloudinary account (free tier)
- A Resend or SMTP account for email

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/Samrajnee/CampusChain.git
cd CampusChain

# 2. Start Postgres and Redis
docker-compose up -d

# 3. Install server dependencies and run migrations
cd server
npm install
npx prisma migrate dev

# 4. Install client dependencies
cd ../client
npm install

# 5. Set environment variables (see below)
cp server/.env.example server/.env

# 6. Start both servers
# In one terminal:
cd server && npm run dev

# In another:
cd client && npm run dev
```

-----

## Build Order

Build in this order. Each phase depends on the one before it.

|Phase|What to build                                                  |Why first                                                  |
|-----|---------------------------------------------------------------|-----------------------------------------------------------|
|1    |Identity module (auth, profiles, roles, XP ledger schema)      |Every other module depends on this                         |
|2    |Governance module (elections, proposals, grievances)           |Most distinctive feature set; validates the core data model|
|3    |Campus Ops (events, clubs, attendance, budget)                 |Produces the activity data that feeds XP and badges        |
|4    |Notifications (announcements, digest, read receipts)           |Cross-cutting concern wired to all modules                 |
|5    |Social layer (directory, leaderboard, endorsements, mentorship)|Read aggregations of data already in the DB                |
|6    |Admin dashboard, reports, audit log                            |Last because it reads everything else                      |

**Wire the XP ledger in Phase 1** even if the front-end comes later. Every module simply emits an event; a BullMQ worker credits the student. Retrofitting this later requires touching every module.

-----

## Environment Variables

```env
# Server
DATABASE_URL=postgresql://user:password@localhost:5432/campuschain
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
JWT_ANON_SECRET=your_anonymous_voter_secret

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email
RESEND_API_KEY=

# Certificate signing
HMAC_CERT_SECRET=your_cert_signing_secret

# App
PORT=4000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

-----

## Database

PostgreSQL is the single source of truth. Prisma manages the schema and migrations.

Core tables (top-level):

- `users` — students and staff, with role and department
- `certificates` — issued certs with HMAC signature and unique ID
- `badges` — badge definitions and issuance records
- `xp_ledger` — append-only log of every XP event per user
- `elections` — election metadata and audit log
- `votes` — anonymized via voter token, linked to election not user
- `proposals` — community proposals with vote counts and status
- `grievances` — with status history and escalation timestamps
- `events` — with committee members and RSVP records
- `clubs` — with membership, advisor, and budget records
- `announcements` — with role-scoped visibility and read receipts

Run migrations:

```bash
cd server && npx prisma migrate dev --name init
```

View the schema interactively:

```bash
npx prisma studio
```

-----

## Background Jobs

BullMQ workers run in the same Node process (separate worker files) and process jobs from Redis queues.

|Queue                 |Trigger                            |Action                                                     |
|----------------------|-----------------------------------|-----------------------------------------------------------|
|`badge-issuance`      |Event check-in confirmed           |Check thresholds, issue badge if earned                    |
|`pdf-generation`      |Student requests resume/cert export|Generate PDF, upload to Cloudinary, email link             |
|`weekly-digest`       |Cron: every Monday 8am             |Aggregate new proposals, events, announcements; send email |
|`grievance-escalation`|Cron: every hour                   |Find grievances unresolved past configured SLA, bump status|

All jobs are idempotent — safe to retry on failure.

-----

## Contributing

This project is in early development. If you want to contribute:

1. Fork the repository
1. Create a feature branch: `git checkout -b feature/your-feature-name`
1. Follow the module structure in `server/src/modules/`
1. Write a brief description of what your PR changes and why
1. Open a pull request against `main`

Code style: ESLint + Prettier (config in repo root). Run `npm run lint` before pushing.

-----

## License

MIT