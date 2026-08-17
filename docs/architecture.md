# 🏛️ SK AKSES — Architecture Document

> **Single Source of Truth** — This document defines the project's scope, goals, technology stack, and code structure.
> All contributors, AI models, and platforms must ground their work on this file.

**Last Updated:** 2026-08-17

---

## 1. Project Identity

| Field            | Value                                                              |
| ---------------- | ------------------------------------------------------------------ |
| **Project Name** | SK AKSES (Sangguniang Kabataan Access Portal)                      |
| **Codename**     | Katips (Katipunan Central Hub)                                     |
| **Repository**   | [github.com/jash-aeio/Katips](https://github.com/jash-aeio/Katips) |
| **Type**         | Full-Stack Web Application (local-first prototype → future SaaS)   |
| **License**      | ISC                                                                |

---

## 2. Main Goal

**Build a centralized digital platform for the Sangguniang Kabataan (SK) that empowers Filipino youth through community engagement, transparent governance, digital services, gamified events, and welfare programs — all consolidated into a single portal.**

The system unifies fragmented SK operations into one hub, giving youth constituents direct access to government services, community forums, event participation, eco-initiatives, educational resources, and confidential support systems.

---

## 3. Technology Stack

### 3.1 Core Stack

| Layer        | Technology                  | Version | Purpose                              |
| ------------ | --------------------------- | ------- | ------------------------------------ |
| **Runtime**  | Node.js                     | ≥ 18.x  | Server-side JavaScript runtime       |
| **Backend**  | Express.js                  | 5.x     | REST API framework                   |
| **Frontend** | Next.js (App Router)        | 16.x    | React-based SSR/CSR web framework    |
| **UI**       | React                       | 19.x    | Component-based UI library           |
| **Database** | SQLite (via better-sqlite3) | —       | Embedded relational database         |
| **Auth**     | JWT (jsonwebtoken)          | 9.x     | Stateless token-based authentication |

### 3.2 Backend Dependencies

| Package          | Purpose                                    |
| ---------------- | ------------------------------------------ |
| `express`        | HTTP server and routing                    |
| `better-sqlite3` | Synchronous SQLite3 bindings               |
| `bcryptjs`       | Password hashing                           |
| `jsonwebtoken`   | JWT creation and verification              |
| `cors`           | Cross-origin resource sharing              |
| `multer`         | Multipart file upload handling             |
| `uuid`           | Unique ID generation (tickets, references) |

### 3.3 Frontend Dependencies

| Package     | Purpose                         |
| ----------- | ------------------------------- |
| `next`      | React framework with App Router |
| `react`     | UI component library            |
| `react-dom` | React DOM rendering             |
| `recharts`  | Data visualization and charting |

### 3.4 Developer Tooling

| Tool        | Purpose                                           |
| ----------- | ------------------------------------------------- |
| ESLint      | Code quality linting (backend + frontend configs) |
| Prettier    | Code formatting                                   |
| Husky       | Git hooks automation                              |
| lint-staged | Pre-commit lint and format on staged files        |

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│              Next.js 16 — App Router (port 3000)         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │  Login   │ │  Portal  │ │  Admin   │ │  Register  │  │
│  │  /login  │ │ /(portal)│ │  Panel   │ │ /register  │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │  HTTP (REST API)
                        ▼
┌─────────────────────────────────────────────────────────┐
│                 SERVER (Express.js — port 3001)          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Middleware: CORS · JSON Parser · Static Uploads   │  │
│  ├────────────────────────────────────────────────────┤  │
│  │  Auth Middleware (JWT verify) · SafeSpace Guard    │  │
│  ├────────────────────────────────────────────────────┤  │
│  │  Route Modules (20 route files)                    │  │
│  │  ── Core: auth, users, forum, news, services,     │  │
│  │           skillup, rewards, transparency,          │  │
│  │           notifications                            │  │
│  │  ── Expansion: proposals, budget, hazards,         │  │
│  │           safespace, gigs, scholarships,            │  │
│  │           resources, exchange, eco-points,          │  │
│  │           agri-connect, volunteer                   │  │
│  └────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │  Synchronous queries
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  DATABASE (SQLite)                        │
│  ┌───────────────────┐  ┌────────────────────────────┐  │
│  │  V1 Migrations    │  │  V2 Migrations             │  │
│  │  (Core schema)    │  │  (Expansion modules)       │  │
│  └───────────────────┘  └────────────────────────────┘  │
│  ┌───────────────────┐  ┌────────────────────────────┐  │
│  │  V1 Seed Data     │  │  V2 Seed Data              │  │
│  └───────────────────┘  └────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Code Structure

```
Katips/
├── docs/                           # 📖 Project documentation (source of truth)
│   ├── architecture.md             #    ← You are here
│   ├── design.md                   #    UI/UX design language
│   ├── boundaries.md               #    Scope gates and constraints
│   └── status.md                   #    Progress tracking
│
├── backend/                        # 🖥️ Express.js API Server
│   ├── server.js                   #    Entry point — middleware, routes, boot
│   ├── package.json                #    Backend dependencies
│   ├── database/                   #    Database layer
│   │   ├── db.js                   #    SQLite connection singleton
│   │   ├── migrations.js           #    V1 schema (core tables)
│   │   ├── migrations_v2.js        #    V2 schema (expansion modules)
│   │   ├── seed.js                 #    V1 seed data
│   │   └── seed_v2.js              #    V2 seed data
│   ├── middleware/                  #    Express middleware
│   │   ├── auth.js                 #    JWT authentication guard
│   │   └── safespace.js            #    SafeSpace role-based access
│   ├── routes/                     #    API route handlers (20 files)
│   │   ├── auth.js                 #    POST /api/auth/login, /register
│   │   ├── users.js                #    GET/PUT /api/users/*
│   │   ├── forum.js                #    CRUD /api/forum/*
│   │   ├── news.js                 #    CRUD /api/news/*
│   │   ├── services.js             #    CRUD /api/services/*
│   │   ├── skillup.js              #    CRUD /api/skillup/*
│   │   ├── rewards.js              #    CRUD /api/rewards/*
│   │   ├── transparency.js         #    CRUD /api/transparency/*
│   │   ├── notifications.js        #    GET /api/notifications/*
│   │   ├── proposals.js            #    CRUD /api/proposals/* (E-Panukala)
│   │   ├── budget.js               #    CRUD /api/budget/* (Bantay-Pondo)
│   │   ├── hazards.js              #    CRUD /api/hazards/* (Bantay-Komunidad)
│   │   ├── safespace.js            #    CRUD /api/safespace/*
│   │   ├── gigs.js                 #    CRUD /api/gigs/*
│   │   ├── scholarships.js         #    CRUD /api/scholarships/*
│   │   ├── resources.js            #    CRUD /api/resources/*
│   │   ├── exchange.js             #    CRUD /api/exchange/*
│   │   ├── eco-points.js           #    CRUD /api/eco-points/*
│   │   ├── agri-connect.js         #    CRUD /api/agri-connect/*
│   │   └── volunteer.js            #    CRUD /api/volunteer/*
│   └── uploads/                    #    File uploads directory (gitignored)
│
├── frontend/                       # 🎨 Next.js Web Application
│   ├── package.json                #    Frontend dependencies
│   ├── next.config.mjs             #    Next.js configuration
│   ├── app/                        #    App Router pages
│   │   ├── layout.js               #    Root layout (HTML shell)
│   │   ├── globals.css             #    Global design system / tokens
│   │   ├── page.js                 #    Landing page (/)
│   │   ├── page.module.css         #    Landing page styles
│   │   ├── login/                  #    Login page (/login)
│   │   ├── register/               #    Registration page (/register)
│   │   └── (portal)/               #    Authenticated portal (route group)
│   │       ├── layout.js           #    Portal layout (sidebar + topbar)
│   │       ├── layout.module.css   #    Portal layout styles
│   │       ├── dashboard/          #    User dashboard
│   │       ├── forum/              #    Community forum
│   │       ├── news/               #    News and announcements
│   │       ├── skillup/            #    SKill Up events + points
│   │       ├── profile/            #    User profile + youth profiling
│   │       ├── transparency/       #    Transparency board
│   │       ├── admin/              #    Admin panel (role-gated)
│   │       │   ├── page.js         #    Admin dashboard
│   │       │   ├── forum/          #    Forum moderation
│   │       │   ├── news/           #    News management
│   │       │   ├── services/       #    Services management
│   │       │   ├── skillup/        #    SKill Up management
│   │       │   ├── rewards/        #    Rewards catalog management
│   │       │   ├── users/          #    User management
│   │       │   ├── safespace/      #    SafeSpace counselor panel
│   │       │   └── transparency/   #    Transparency doc management
│   │       └── services/           #    Service modules hub
│   │           ├── page.js         #    Services index page
│   │           ├── e-panukala/     #    E-Panukala (Proposals)
│   │           ├── bantay-pondo/   #    Bantay-Pondo (Budget)
│   │           ├── bantay-komunidad/ #  Bantay-Komunidad (Hazards)
│   │           ├── katips-gig-board/ #  Gig Board
│   │           ├── edu-hub/        #    Edu Hub (Scholarships + Resources)
│   │           ├── skill-share/    #    Skill Share (Resources + Tutoring)
│   │           ├── youth-exchange/ #    Youth Exchange Opportunities
│   │           ├── eco-points/     #    Eco-Points
│   │           ├── agri-connect/   #    Agri-Connect
│   │           ├── voluntinder/    #    VolunTinder
│   │           └── safespace/      #    SafeSpace (Confidential)
│   ├── components/                 #    Reusable React components
│   │   ├── Sidebar.js              #    Navigation sidebar
│   │   ├── Sidebar.module.css      #    Sidebar styles
│   │   ├── YouthProfilingForm.js   #    KYC/profiling form
│   │   └── YouthProfilingForm.module.css
│   ├── lib/                        #    Shared utilities
│   │   ├── api.js                  #    API client (fetch wrapper)
│   │   └── auth.js                 #    Auth context + JWT management
│   └── public/                     #    Static assets
│
├── .husky/                         #    Git hooks (pre-commit)
├── .gitignore                      #    Repository exclusions
├── CONTRIBUTING.md                 #    Contributor guidelines
├── katipsPlan.md                   #    Original project plan
└── package.json                    #    Root monorepo scripts + tooling
```

---

## 6. Module Inventory

### 6.1 Core Modules (V1)

| Module          | API Route            | Frontend Route        | Description                              |
| --------------- | -------------------- | --------------------- | ---------------------------------------- |
| Authentication  | `/api/auth`          | `/login`, `/register` | JWT login, registration, role management |
| User Management | `/api/users`         | `/profile`            | Profile, youth profiling, KYC            |
| Community Forum | `/api/forum`         | `/forum`              | Threaded discussions, replies, likes     |
| News & Events   | `/api/news`          | `/news`               | Announcements, events, posters           |
| Services        | `/api/services`      | `/services`           | Service catalog, request logging         |
| SKill Up        | `/api/skillup`       | `/skillup`            | Events, registrations, ticket system     |
| Rewards         | `/api/rewards`       | (within SKill Up)     | Points catalog, redemptions              |
| Transparency    | `/api/transparency`  | `/transparency`       | Financial reports, resolutions, minutes  |
| Notifications   | `/api/notifications` | (sidebar/topbar)      | System, forum, event, and points alerts  |

### 6.2 Expansion Modules (V2)

| #   | Module           | Filipino Name    | API Route           | Category                   |
| --- | ---------------- | ---------------- | ------------------- | -------------------------- |
| 1   | E-Panukala       | Proposals        | `/api/proposals`    | Governance & Transparency  |
| 2   | Bantay-Pondo     | Budget Tracker   | `/api/budget`       | Governance & Transparency  |
| 3   | Bantay-Komunidad | Hazard Reports   | `/api/hazards`      | Governance & Transparency  |
| 4   | Gig Board        | —                | `/api/gigs`         | Economic & Educational     |
| 5   | Scholarships     | —                | `/api/scholarships` | Economic & Educational     |
| 6   | Resource Bank    | Skill Share      | `/api/resources`    | Economic & Educational     |
| 7   | Exchange         | Youth Exchange   | `/api/exchange`     | Economic & Educational     |
| 8   | Eco-Points       | —                | `/api/eco-points`   | Environment & Volunteerism |
| 9   | Agri-Connect     | —                | `/api/agri-connect` | Environment & Volunteerism |
| 10  | VolunTinder      | —                | `/api/volunteer`    | Environment & Volunteerism |
| 11  | SafeSpace        | — (Confidential) | `/api/safespace`    | Privacy & Health           |

---

## 7. Database Schema Summary

### V1 Tables (Core)

| Table                 | Purpose                    | Key Relations           |
| --------------------- | -------------------------- | ----------------------- |
| `users`               | All user accounts          | Central FK target       |
| `forum_threads`       | Discussion threads         | → users                 |
| `forum_replies`       | Thread replies             | → forum_threads, users  |
| `thread_likes`        | Thread like tracking       | → users, forum_threads  |
| `news_events`         | News/announcements         | → users (admin)         |
| `services`            | Service catalog            | —                       |
| `service_logs`        | Service request logs       | → services, users       |
| `skillup_events`      | SKill Up events            | → users (admin)         |
| `event_registrations` | Event sign-ups             | → skillup_events, users |
| `points_ledger`       | Points transaction history | → users, skillup_events |
| `rewards`             | Rewards catalog            | —                       |
| `reward_redemptions`  | Reward claims              | → users, rewards        |
| `transparency_docs`   | Transparency documents     | → users (admin)         |
| `notifications`       | User notifications         | → users                 |

### V2 Tables (Expansion)

| Table                      | Module           | Purpose                       |
| -------------------------- | ---------------- | ----------------------------- |
| `app_config`               | System           | Key-value app configuration   |
| `proposals`                | E-Panukala       | Youth proposals               |
| `proposal_votes`           | E-Panukala       | Proposal upvotes              |
| `budget_categories`        | Bantay-Pondo     | Budget category definitions   |
| `budget_allocations`       | Bantay-Pondo     | Fiscal year allocations       |
| `budget_expenditures`      | Bantay-Pondo     | Spending records              |
| `hazard_reports`           | Bantay-Komunidad | Community hazard reports      |
| `gig_postings`             | Gig Board        | Job/gig listings              |
| `gig_applications`         | Gig Board        | Gig applications              |
| `scholarships`             | Scholarships     | Scholarship listings          |
| `scholarship_applications` | Scholarships     | Scholarship applications      |
| `resources`                | Resource Bank    | Shared learning resources     |
| `tutor_requests`           | Resource Bank    | Peer tutoring requests        |
| `exchange_opportunities`   | Exchange         | Exchange/summit opportunities |
| `eco_activities`           | Eco-Points       | Eco activity definitions      |
| `eco_point_transactions`   | Eco-Points       | Eco point history             |
| `agri_content`             | Agri-Connect     | Agricultural guides           |
| `seed_kit_requests`        | Agri-Connect     | Seed kit requests             |
| `seed_kit_inventory`       | Agri-Connect     | Seed kit stock                |
| `volunteer_opportunities`  | VolunTinder      | Volunteer event listings      |
| `volunteer_swipes`         | VolunTinder      | Swipe commit/skip actions     |
| `safespace_reports`        | SafeSpace        | Confidential reports          |
| `safespace_access_log`     | SafeSpace        | Counselor access audit trail  |

---

## 8. Authentication & Authorization

| Role        | Access Level                                           |
| ----------- | ------------------------------------------------------ |
| `youth`     | Standard user — portal, forum, services, event sign-up |
| `moderator` | Forum moderation, limited admin views                  |
| `admin`     | Full admin panel — CRUD all modules, user management   |
| `counselor` | SafeSpace-only — view/manage confidential reports      |

- **Mechanism**: JWT tokens issued at login, verified via `middleware/auth.js`
- **SafeSpace Guard**: Additional `middleware/safespace.js` restricts access to counselor/admin only with full audit logging

---

## 9. API Conventions

- **Base URL**: `http://localhost:3001/api`
- **Format**: JSON request/response
- **Auth Header**: `Authorization: Bearer <jwt_token>`
- **File Uploads**: `multipart/form-data` via Multer (stored in `/backend/uploads/`)
- **Error Shape**: `{ error: string }`
- **Health Check**: `GET /api/health` → `{ status: 'ok', name: 'Katips API', version: '1.0.0' }`

---

## 10. Development Commands

```bash
# From root
npm run dev:backend      # Start backend (port 3001)
npm run dev:frontend     # Start frontend (port 3000)
npm run lint             # Lint both backend + frontend
npm run format           # Format all files with Prettier

# Backend only
cd backend && npm run dev   # Start with --watch (auto-restart)
cd backend && npm run lint  # Lint backend

# Frontend only
cd frontend && npm run dev  # Start Next.js dev server
cd frontend && npm run build # Production build
```

---

> **⚠️ Change Protocol:** Any structural change to the codebase (new modules, renamed routes, added packages, schema changes) **must** be reflected in this document before or immediately after the code change.
