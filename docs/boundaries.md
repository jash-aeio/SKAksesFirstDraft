# 🚧 SK AKSES — Project Boundaries

> **Hard Gates & Guardrails** — This document defines the non-negotiable constraints, scope limits, and decision boundaries for the SK AKSES project.
> Reference this file to prevent scope creep, drifting ideas, and unauthorized changes.

**Last Updated:** 2026-08-17

---

## 1. Purpose

This file exists to:

1. **Prevent scope creep** — New feature ideas must be evaluated against these boundaries before any work begins
2. **Ground decision-making** — When debating "should we add X?", this file is the arbiter
3. **Maintain focus** — The project has a defined finish line; this file keeps everyone running toward it
4. **Combat idea drift** — Excitement about new features must not derail current sprint work

---

## 2. Project Scope Definition

### 2.1 What SK AKSES IS

| ✅ In Scope                                                              |
| ------------------------------------------------------------------------ |
| A **web-based portal** for Sangguniang Kabataan operations               |
| A **local-first prototype** running on localhost (SQLite + Express)      |
| A **single-barangay** deployment (one SK council, one set of youth)      |
| A platform for **youth engagement**: forum, events, services, rewards    |
| A **transparency tool**: budget tracking, proposals, document publishing |
| A **gamified participation** system via SKill Up points and rewards      |
| A **confidential support** system (SafeSpace) for at-risk youth          |
| A **service hub** for gig boards, scholarships, eco-activities           |
| An **admin panel** for SK council members to manage all modules          |

### 2.2 What SK AKSES IS NOT

| ❌ Out of Scope                                                                    |
| ---------------------------------------------------------------------------------- |
| A **mobile app** — web-only for now (no React Native/Flutter development)          |
| A **multi-tenant SaaS platform** — single deployment only in the prototype phase   |
| A **payment processing system** — no real money, e-wallet, or GCash integration    |
| A **real-time chat application** — no WebSocket/Socket.io messaging                |
| An **e-government system** — not connected to DILG, COMELEC, or any government API |
| A **social media platform** — the forum is for structured discussion, not feeds    |
| A **data analytics / BI tool** — dashboards are simple stat displays only          |
| A **production-deployed cloud service** — no AWS, Vercel, or cloud deployment yet  |

---

## 3. Technology Boundaries

### 3.1 Locked Stack (Do Not Change Without Team Consensus)

| Layer    | Locked Technology       | Reason                                       |
| -------- | ----------------------- | -------------------------------------------- |
| Runtime  | Node.js                 | Team expertise, single-language stack        |
| Backend  | Express.js              | Lightweight, well-understood by the team     |
| Frontend | Next.js (App Router)    | SSR/CSR flexibility, file-based routing      |
| Database | SQLite (better-sqlite3) | Zero-config, embedded, prototype-appropriate |
| Auth     | JWT (jsonwebtoken)      | Stateless, simple implementation             |
| Styling  | Vanilla CSS + Modules   | Full control, no framework dependency        |

### 3.2 Forbidden Technologies

| ❌ Technology                          | Reason                                                        |
| -------------------------------------- | ------------------------------------------------------------- |
| Tailwind CSS                           | Project uses custom design system in `globals.css`            |
| CSS-in-JS (styled-components, emotion) | Conflicts with CSS Modules architecture                       |
| TypeScript                             | Not adopted for the prototype phase (may revisit post-launch) |
| GraphQL                                | REST API is established; no need for added complexity         |
| ORM (Prisma, Sequelize)                | Direct SQL with better-sqlite3 is intentional                 |
| Docker (for dev)                       | Local-first approach — no containerization needed yet         |
| WebSockets / Socket.io                 | No real-time features in current scope                        |
| External Auth (OAuth, Firebase Auth)   | JWT-based auth is sufficient for prototype                    |
| AI/ML libraries                        | No AI features planned in scope                               |

### 3.3 Conditional Technologies (Require Discussion)

| Technology        | Condition for Adoption                                  |
| ----------------- | ------------------------------------------------------- |
| PostgreSQL        | Only when migrating from prototype to production        |
| Redis             | Only if session management becomes a bottleneck         |
| Cloud deployment  | Only after stakeholder demo and approval (Phase 4)      |
| External icon lib | Only if adopted project-wide (Lucide or Heroicons only) |
| Testing framework | When Sprint backlog explicitly includes test tasks      |

---

## 4. Feature Boundaries

### 4.1 Module Freeze

The following **11 expansion modules** are the complete feature set. **No new modules** should be added without formal stakeholder approval:

| #   | Module           | Status  |
| --- | ---------------- | ------- |
| 1   | E-Panukala       | Defined |
| 2   | Bantay-Pondo     | Defined |
| 3   | Bantay-Komunidad | Defined |
| 4   | Gig Board        | Defined |
| 5   | Scholarships     | Defined |
| 6   | Resource Bank    | Defined |
| 7   | Youth Exchange   | Defined |
| 8   | Eco-Points       | Defined |
| 9   | Agri-Connect     | Defined |
| 10  | VolunTinder      | Defined |
| 11  | SafeSpace        | Defined |

> [!CAUTION]
> **Adding a new module (Module 12+) requires:**
>
> 1. Written justification with clear user need
> 2. Confirmation it doesn't overlap with existing modules
> 3. Approval from the Project Manager
> 4. Addition to `architecture.md` before any code is written

### 4.2 Feature Depth Limits

Each module has a defined scope. Do not exceed these depths:

| Module           | Allowed Depth                             | NOT Allowed                                    |
| ---------------- | ----------------------------------------- | ---------------------------------------------- |
| Forum            | Threads, replies, likes, categories       | Direct messaging, threads with attachments     |
| SKill Up         | Events, registration, attendance, tickets | Live streaming, video conferencing             |
| E-Panukala       | Proposals, upvotes, mandatory agenda      | Formal voting systems, ballot elections        |
| Bantay-Pondo     | Categories, allocations, expenditures     | Invoice generation, payment processing         |
| Bantay-Komunidad | Reports, severity, status tracking        | GPS tracking, IoT sensor integration           |
| Gig Board        | Postings, applications, status            | Payment escrow, ratings/reviews system         |
| Scholarships     | Listings, applications, status            | Document verification, automated eligibility   |
| Resource Bank    | File sharing, tutor matching              | Video courses, LMS features                    |
| Exchange         | Opportunity listings                      | Application processing, travel booking         |
| Eco-Points       | Activities, QR scanning, point tracking   | Carbon footprint calculation, IoT integration  |
| Agri-Connect     | Content guides, seed kit requests         | E-commerce, crop monitoring IoT                |
| VolunTinder      | Swipe UI, commit/skip, point awarding     | Volunteer hour verification, GPS check-in      |
| SafeSpace        | Reports, counselor assignment, audit log  | Chat therapy, video calls, AI crisis detection |

### 4.3 Admin Panel Limits

The admin panel provides **CRUD operations** for all modules. It does NOT include:

- ❌ Complex analytics dashboards with charts and graphs (beyond basic stat cards)
- ❌ User behavior tracking or heatmaps
- ❌ Automated report generation (PDF exports, etc.)
- ❌ Bulk import/export via CSV/Excel
- ❌ Role creation (roles are hardcoded: `youth`, `moderator`, `admin`)

---

## 5. Data Boundaries

### 5.1 Storage Limits

| Constraint          | Limit                                                   |
| ------------------- | ------------------------------------------------------- |
| Database            | Single SQLite file per deployment                       |
| File uploads        | Local `/uploads` directory only                         |
| Upload size limit   | 10MB per request (Express JSON limit)                   |
| Image formats       | Accept what Multer receives — no server-side processing |
| No external storage | No S3, Cloudinary, or CDN integration                   |

### 5.2 Data Handling Rules

- **No PII encryption at rest** in the prototype (SQLite is local-only)
- **SafeSpace data** follows the same storage model but with **audit logging** via `safespace_access_log`
- **No data export features** — admin views data in-app only
- **No data retention policies** — all data persists until manual deletion
- **No backup system** — SQLite file is backed up via Git ignore (the `.db` files are gitignored)

---

## 6. Design Boundaries

### 6.1 Locked Design Decisions

| Decision         | Locked Value                     | Do Not Change To               |
| ---------------- | -------------------------------- | ------------------------------ |
| Primary color    | Purple (`#7C3AED`)               | Any other brand color          |
| Design motif     | Glassmorphism + purple gradients | Material Design, flat design   |
| Heading font     | Poppins                          | Any other heading font         |
| Body font        | Inter                            | Any other body font            |
| CSS architecture | CSS Modules + globals.css tokens | Tailwind, CSS-in-JS            |
| Sidebar style    | Fixed left, purple gradient      | Top nav, hamburger-only mobile |
| Dark mode        | NOT implemented                  | —                              |

### 6.2 Design Change Protocol

Any change to the visual identity requires:

1. Update `design.md` **first**
2. Modify `globals.css` design tokens
3. Ensure all existing pages render correctly with the new tokens
4. Update any screenshots in documentation

---

## 7. Process Boundaries

### 7.1 Development Rules

| Rule                                            | Enforced By              |
| ----------------------------------------------- | ------------------------ |
| All code changes go through Pull Requests       | GitHub branch protection |
| Commits follow Conventional Commits format      | Team convention          |
| Pre-commit linting via Husky + lint-staged      | Git hooks (automated)    |
| No direct pushes to `main`                      | Team convention          |
| Sprint tasks are the only authorized work items | Project Manager          |

### 7.2 Scope Change Request Process

When someone proposes a new feature or significant change:

```
1. STOP   → Do not write any code yet
2. CHECK  → Does it conflict with anything in boundaries.md?
3. ASK    → Discuss with PM and document the justification
4. PLAN   → If approved, add to architecture.md and next sprint backlog
5. BUILD  → Only then begin implementation
```

### 7.3 AI/Model Usage Boundaries

When using AI coding assistants (any model, any platform):

| Rule                                                                  |
| --------------------------------------------------------------------- |
| Always load `docs/architecture.md` for project structure context      |
| Always load `docs/design.md` before writing any UI/CSS code           |
| Always load `docs/boundaries.md` to verify the request is in scope    |
| Always load `docs/status.md` to understand current phase              |
| Do **not** introduce new packages without checking Section 3 above    |
| Do **not** add features beyond the defined module depth (Section 4.2) |
| Do **not** change the technology stack (Section 3.1)                  |
| Do **not** alter the design language without updating `design.md`     |

---

## 8. Performance Boundaries

| Metric             | Target                    | Notes                            |
| ------------------ | ------------------------- | -------------------------------- |
| API response time  | < 500ms for all endpoints | SQLite is synchronous, fast      |
| Frontend page load | < 3s on localhost         | Next.js dev server               |
| Bundle size        | No hard limit (prototype) | Optimize only if noticeably slow |
| Database queries   | No N+1 query issues       | Use JOINs or batch queries       |
| Concurrent users   | 1–10 (local demo)         | Not designed for production load |

---

## 9. Known Future Items (Post-Prototype)

These are acknowledged future needs that are **explicitly NOT in the current scope**:

| Item                         | Phase              | Notes                                 |
| ---------------------------- | ------------------ | ------------------------------------- |
| Multi-tenant (SaaS)          | Post-demo          | Domain-based routing per SK           |
| PostgreSQL migration         | Production prep    | Replace SQLite                        |
| Cloud deployment             | Production         | Vercel (frontend) + Railway (backend) |
| Mobile app (React Native)    | Phase 2            | After web prototype is approved       |
| Real-time notifications      | Production         | WebSocket or SSE                      |
| Email/SMS notifications      | Production         | Transactional emails                  |
| File storage (S3/Cloudinary) | Production         | Replace local uploads                 |
| Dark mode                    | Post-launch polish | Design tokens exist, needs toggle     |
| Internationalization (i18n)  | Post-launch        | Filipino + English                    |
| Testing suite                | Sprint 3+          | Jest + React Testing Library          |
| CI/CD pipeline               | Sprint 3+          | GitHub Actions                        |

---

> **⚠️ This document is a hard gate.** If a request, feature, or change conflicts with anything written here, it is **rejected by default** until this document is formally amended. No exceptions.
