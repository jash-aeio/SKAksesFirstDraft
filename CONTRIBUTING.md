# 🤝 Contributing to SK AKSES

Welcome to the **SK AKSES** project! This guide outlines the conventions, workflows, and standards that all team members must follow to keep the codebase clean, consistent, and easy to collaborate on.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Branch Naming Convention](#branch-naming-convention)
3. [Commit Message Convention](#commit-message-convention)
4. [Pull Request Workflow](#pull-request-workflow)
5. [Code Style & Linting](#code-style--linting)
6. [Folder Structure](#folder-structure)
7. [Sprint Task Workflow](#sprint-task-workflow)
8. [Do's and Don'ts](#dos-and-donts)

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Git** ≥ 2.x
- **SQLite** (currently) → will migrate to **PostgreSQL** in Sprint 3

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/<org>/sk-akses.git
cd sk-akses

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Set up environment variables
# Copy the example env files and fill in your local values
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 5. Run database migrations & seed
cd backend
node database/migrations.js
node database/seed.js

# 6. Start development servers
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## Branch Naming Convention

All branches must follow this pattern:

```
<type>/<sprint>-<task>/<short-description>
```

### Types

| Type       | When to Use                           | Example                                  |
| ---------- | ------------------------------------- | ---------------------------------------- |
| `feat`     | New feature or functionality          | `feat/s1-1.2/rename-frontend-branding`   |
| `fix`      | Bug fix                               | `fix/s2-2.5/error-handler-crash`         |
| `refactor` | Code restructure (no behavior change) | `refactor/s1-1.4/consolidate-migrations` |
| `chore`    | Tooling, CI, dependencies, configs    | `chore/s1-1.6/setup-eslint-prettier`     |
| `docs`     | Documentation only                    | `docs/s1-1.11/contributing-guide`        |
| `test`     | Adding or updating tests              | `test/s2-2.10/auth-route-tests`          |
| `style`    | Formatting, CSS, no logic changes     | `style/s1-1.9/design-tokens`             |
| `hotfix`   | Urgent production fix                 | `hotfix/login-jwt-expired`               |

### Rules

- **Always branch from `main`** (or `develop` if we adopt GitFlow later)
- **Lowercase only**, use hyphens for word separation
- **Include sprint and task number** for traceability
- **Keep descriptions short** (2–4 words max)

### Examples

```bash
# Good ✅
git checkout -b feat/s5-5.2/sk-messages-api
git checkout -b fix/s2-2.1/zod-validation-email
git checkout -b chore/s1-1.7/husky-lint-staged

# Bad ❌
git checkout -b my-branch
git checkout -b fix_stuff
git checkout -b Feature/Add-New-Thing
```

---

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

Same as branch types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`

### Scopes

| Scope      | Meaning                    |
| ---------- | -------------------------- |
| `backend`  | Backend changes            |
| `frontend` | Frontend changes           |
| `db`       | Database migrations/schema |
| `auth`     | Authentication system      |
| `forum`    | Forum module               |
| `skillup`  | SKill Up module            |
| `office`   | SK Virtual Office          |
| `services` | Services modules           |
| `ci`       | CI/CD pipeline             |
| `deps`     | Dependency updates         |

### Examples

```bash
# Good ✅
git commit -m "feat(backend): add SK council members CRUD API"
git commit -m "fix(auth): prevent JWT expiration on page refresh"
git commit -m "chore(ci): add ESLint step to GitHub Actions"
git commit -m "docs(frontend): update README with setup instructions"

# Bad ❌
git commit -m "fixed stuff"
git commit -m "update"
git commit -m "WIP"
```

---

## Pull Request Workflow

### Creating a PR

1. **Push your branch** to the remote
2. **Open a PR** against `main`
3. **Title format**: Same as commit message — `type(scope): description`
4. **Description must include**:
   - Sprint task reference (e.g., `Closes #1.6`)
   - What changed and why
   - Screenshots (for frontend changes)
   - Testing steps

### PR Template

```markdown
## Summary

<!-- What does this PR do? -->

## Sprint Task

<!-- e.g., Sprint 1 — Task 1.6 -->

## Changes

- [ ] Change 1
- [ ] Change 2

## Screenshots

<!-- If frontend change, add before/after -->

## Testing

<!-- How to verify this works -->

## Checklist

- [ ] Code follows project style guide
- [ ] Linting passes (`npm run lint`)
- [ ] No console.log left in code
- [ ] Tested locally
- [ ] PR title follows convention
```

### Review Rules

- **At least 1 approval** required before merging
- **PM reviews** all `chore`, `docs`, and `ci` PRs
- **BE1/BE2 cross-review** each other's backend PRs
- **FE1/FE2 cross-review** each other's frontend PRs
- **Squash merge** preferred to keep history clean

---

## Code Style & Linting

### ESLint + Prettier

Both backend and frontend use **ESLint** for code quality and **Prettier** for formatting. Configuration files are at the root of each sub-project.

```bash
# Check for lint errors
npm run lint

# Auto-fix lint errors
npm run lint:fix

# Format code
npm run format
```

### Key Rules

- **No `console.log`** in production code (use a logger or remove before PR)
- **No unused variables**
- **Prefer `const` over `let`**, never use `var`
- **Single quotes** for strings
- **Semicolons** always
- **2-space indentation**
- **Trailing commas** in multi-line structures

### Pre-Commit Hooks

Husky + lint-staged runs automatically on every commit:

- **Lints** all staged `.js` and `.css` files
- **Formats** with Prettier
- **Blocks commits** that fail lint checks

---

## Folder Structure

```
sk-akses/
├── backend/
│   ├── database/          # DB connection, migrations, seeds
│   │   ├── db.js          # Database connection
│   │   ├── migrations.js  # Schema migrations
│   │   └── seed.js        # Seed data
│   ├── middleware/         # Express middleware
│   │   ├── auth.js        # JWT authentication
│   │   └── safespace.js   # SafeSpace role guard
│   ├── routes/            # API route handlers
│   │   ├── auth.js        # /api/auth/*
│   │   ├── forum.js       # /api/forum/*
│   │   ├── skillup.js     # /api/skillup/*
│   │   └── ...            # Other route modules
│   ├── uploads/           # File uploads (gitignored)
│   ├── server.js          # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── app/               # Next.js App Router pages
│   │   ├── (portal)/      # Authenticated portal pages
│   │   │   ├── admin/     # Admin panel pages
│   │   │   ├── dashboard/ # User dashboard
│   │   │   ├── forum/     # Forum pages
│   │   │   ├── services/  # Service module pages
│   │   │   ├── skillup/   # SKill Up pages
│   │   │   └── profile/   # User profile
│   │   ├── login/         # Login page
│   │   ├── register/      # Registration page
│   │   └── layout.js      # Root layout
│   ├── components/        # Reusable React components
│   ├── lib/               # Utilities (API client, auth)
│   └── package.json
│
├── .gitignore
├── CONTRIBUTING.md         # ← You are here
└── README.md               # Project overview (to be updated)
```

---

## Sprint Task Workflow

### When You Pick Up a Task

1. **Create a branch** following the naming convention
2. **Work on the task** — commit often with proper messages
3. **Test locally** — make sure nothing is broken
4. **Push and open a PR** when done
5. **Request review** from the appropriate team member
6. **Address review comments** if any
7. **Merge** once approved
8. **Update the sprint board** — mark the task as Done

### Communication

- **Daily standup** (async or sync) — what you did, what you'll do, blockers
- **Blocked?** Ping the person whose task blocks yours
- **Found a bug?** Create an issue with the `bug` label before fixing

---

## Do's and Don'ts

### ✅ Do's

- Write descriptive commit messages
- Pull from `main` frequently to stay up-to-date
- Test your changes before pushing
- Ask for help when stuck (don't waste time)
- Document any API changes in the route file header comments
- Use meaningful variable and function names

### ❌ Don'ts

- Don't push directly to `main` — always use a PR
- Don't leave `console.log` or debug code in PRs
- Don't ignore lint errors — fix them
- Don't create massive PRs (keep them focused on one task)
- Don't hardcode secrets, URLs, or API keys
- Don't merge your own PR without at least 1 review

---

## Questions?

If something isn't covered here, ask the **Project Manager (PM)** or open a discussion in the team chat. This document will be updated as the project evolves.

**Happy coding! 🚀**
