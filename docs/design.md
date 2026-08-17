# 🎨 SK AKSES — Design Language

> **Single Source of Truth** — This document defines the visual identity, UI patterns, and UX principles for the entire SK AKSES platform.
> Every interface must be grounded in these specifications for a cohesive user experience.

**Last Updated:** 2026-08-17

---

## 1. Design Philosophy

SK AKSES targets **Filipino youth (ages 15–30)** in barangay-level communities. The design must feel:

- **Modern and Premium** — Not a generic government portal. It should feel like a polished consumer app.
- **Approachable and Friendly** — Warm gradients, rounded shapes, and conversational micro-copy.
- **Trustworthy** — Clean layouts, consistent spacing, and deliberate use of whitespace convey reliability.
- **Alive** — Subtle animations, hover effects, and transitions make the interface feel responsive and dynamic.

---

## 2. Color System

### 2.1 Primary Palette (Purple-Violet)

| Token               | Hex       | Usage                                       |
| ------------------- | --------- | ------------------------------------------- |
| `--primary`         | `#7C3AED` | Primary actions, active states, brand color |
| `--primary-light`   | `#A78BFA` | Hover highlights, secondary accents         |
| `--primary-lighter` | `#C4B5FD` | Subtle backgrounds, scrollbar, tags         |
| `--primary-dark`    | `#5B21B6` | Pressed states, strong emphasis             |
| `--primary-darker`  | `#4C1D95` | Sidebar gradient start, deep emphasis       |

### 2.2 Accent Palette (Pink)

| Token            | Hex       | Usage                             |
| ---------------- | --------- | --------------------------------- |
| `--accent`       | `#F472B6` | Call-to-action highlights, badges |
| `--accent-light` | `#F9A8D4` | Hover states on accent elements   |
| `--accent-dark`  | `#DB2777` | Pressed accent states             |

### 2.3 Background Palette

| Token            | Value                                                            | Usage                         |
| ---------------- | ---------------------------------------------------------------- | ----------------------------- |
| `--bg-primary`   | `#F5F3FF`                                                        | Page backgrounds              |
| `--bg-secondary` | `#EDE9FE`                                                        | Section backgrounds, alt rows |
| `--bg-card`      | `rgba(255, 255, 255, 0.85)`                                      | Card surfaces                 |
| `--bg-glass`     | `rgba(255, 255, 255, 0.6)`                                       | Glassmorphism overlays        |
| `--bg-dark`      | `#1E1B4B`                                                        | Dark surfaces, modals         |
| `--bg-sidebar`   | `linear-gradient(180deg, #4C1D95 0%, #5B21B6 50%, #7C3AED 100%)` | Sidebar gradient              |

### 2.4 Text Colors

| Token               | Hex       | Usage                         |
| ------------------- | --------- | ----------------------------- |
| `--text-primary`    | `#1E1B4B` | Headings, body text           |
| `--text-secondary`  | `#6B7280` | Supporting text, labels       |
| `--text-muted`      | `#9CA3AF` | Placeholders, disabled text   |
| `--text-white`      | `#FFFFFF` | Text on primary/dark surfaces |
| `--text-on-primary` | `#FFFFFF` | Text on primary color buttons |

### 2.5 Status Colors

| Status  | Color     | Light Variant | Usage                          |
| ------- | --------- | ------------- | ------------------------------ |
| Success | `#10B981` | `#D1FAE5`     | Approvals, completions, online |
| Warning | `#F59E0B` | `#FEF3C7`     | Pending, caution, deadlines    |
| Error   | `#EF4444` | `#FEE2E2`     | Errors, rejections, critical   |
| Info    | `#3B82F6` | `#DBEAFE`     | Informational, tips, links     |

### 2.6 Color Usage Rules

> [!IMPORTANT]
>
> - **Never** use raw hex values in CSS modules — always reference CSS custom properties (`var(--primary)`, etc.)
> - **Never** use generic browser colors (`red`, `blue`, `green`) directly
> - Status colors are **only** for their semantic purpose — don't reuse `--success` for decorative green elements
> - The primary-to-accent gradient (`135deg, var(--primary) → var(--accent)`) is the **signature gradient** used for hero sections, gradient text, and primary CTAs

---

## 3. Typography

### 3.1 Font Families

| Role         | Font                                                                 | Weight Range | Usage                             |
| ------------ | -------------------------------------------------------------------- | ------------ | --------------------------------- |
| **Headings** | `'Poppins', 'Inter', sans-serif`                                     | 400–800      | h1–h6, page titles, modal headers |
| **Body**     | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` | 300–700      | Paragraphs, labels, UI text       |

### 3.2 Type Scale

| Element | Font Size   | Weight | Line Height | Font Family |
| ------- | ----------- | ------ | ----------- | ----------- |
| h1      | 2rem        | 700    | 1.3         | Poppins     |
| h2      | 1.5rem      | 700    | 1.3         | Poppins     |
| h3      | 1.25rem     | 600    | 1.3         | Poppins     |
| h4      | 1.125rem    | 600    | 1.3         | Poppins     |
| Body    | 1rem (16px) | 400    | 1.6         | Inter       |
| Small   | 0.875rem    | 400    | 1.5         | Inter       |
| Caption | 0.75rem     | 600    | 1.4         | Inter       |

### 3.3 Typography Rules

- Base font size is `16px` on `html`
- All headings use `font-weight: 700` by default via Poppins
- Body copy uses `line-height: 1.6` for readability
- Font smoothing is enabled (`-webkit-font-smoothing: antialiased`)
- **Gradient text** (`.gradient-text`) uses the signature gradient with `background-clip: text`

---

## 4. Spacing & Sizing

### 4.1 Border Radius

| Token           | Value    | Usage                           |
| --------------- | -------- | ------------------------------- |
| `--radius-sm`   | `8px`    | Small elements, chips, tags     |
| `--radius-md`   | `12px`   | Buttons, inputs, small cards    |
| `--radius-lg`   | `16px`   | Cards, modals, panels           |
| `--radius-xl`   | `24px`   | Large containers, hero sections |
| `--radius-full` | `9999px` | Avatars, pills, circular badges |

### 4.2 Layout Dimensions

| Token                 | Value   | Usage                       |
| --------------------- | ------- | --------------------------- |
| `--sidebar-width`     | `260px` | Sidebar (desktop, expanded) |
| `--sidebar-collapsed` | `72px`  | Sidebar (collapsed)         |
| `--topbar-height`     | `64px`  | Top navigation bar          |

### 4.3 Spacing Guidelines

- Use multiples of `4px` for all spacing: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`
- Card padding: `20px–24px`
- Section gaps: `24px–32px`
- Element gaps within cards: `8px–16px`

---

## 5. Elevation & Shadows

| Token            | Value                                  | Usage                       |
| ---------------- | -------------------------------------- | --------------------------- |
| `--shadow-sm`    | `0 1px 3px rgba(124, 58, 237, 0.06)`   | Subtle lift (inputs, chips) |
| `--shadow-md`    | `0 4px 12px rgba(124, 58, 237, 0.08)`  | Cards at rest               |
| `--shadow-lg`    | `0 8px 30px rgba(124, 58, 237, 0.12)`  | Cards on hover, dropdowns   |
| `--shadow-xl`    | `0 16px 48px rgba(124, 58, 237, 0.16)` | Modals, floating panels     |
| `--shadow-glass` | `0 8px 32px rgba(31, 38, 135, 0.12)`   | Glassmorphic cards          |

> [!NOTE]
> Shadows use the **primary purple** tint instead of black/gray. This is a deliberate design choice that keeps shadows cohesive with the brand palette. The only exception is `--shadow-glass` which uses a deeper blue-indigo for frosted-glass elements.

---

## 6. Glassmorphism

The project uses glassmorphism as a signature visual motif. The `.glass-card` utility class implements:

```css
.glass-card {
  background: var(--bg-card); /* rgba(255,255,255,0.85) */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border); /* rgba(124,58,237,0.1) */
  border-radius: var(--radius-lg); /* 16px */
  box-shadow: var(--shadow-glass);
}
```

### When to Use Glassmorphism

| ✅ Use For               | ❌ Don't Use For                  |
| ------------------------ | --------------------------------- |
| Content cards            | Navigation (sidebar is opaque)    |
| Modal/dialog backgrounds | Data-dense tables                 |
| Floating action panels   | Text-heavy reading areas          |
| Dashboard stat cards     | Form containers (use solid white) |

---

## 7. Component Patterns

### 7.1 Buttons

| Class            | Appearance                                 | Usage                          |
| ---------------- | ------------------------------------------ | ------------------------------ |
| `.btn-primary`   | Purple gradient + white text + glow shadow | Primary actions (Submit, Save) |
| `.btn-secondary` | White bg + purple text + border            | Secondary actions (Cancel)     |
| `.btn-accent`    | Pink gradient + white text + glow shadow   | Special CTAs (Sign Up, Join)   |
| `.btn-ghost`     | Transparent + gray text                    | Tertiary actions (Dismiss)     |
| `.btn-sm`        | Smaller padding (6px 16px)                 | Inline actions                 |
| `.btn-lg`        | Larger padding (14px 32px)                 | Hero CTAs                      |

**Button Behavior:**

- All buttons transition smoothly (`var(--transition-base)`)
- Primary and accent buttons lift on hover (`translateY(-2px)`) with enhanced shadow
- Ghost buttons gain a subtle background tint on hover
- Disabled buttons reduce to `opacity: 0.5` with `cursor: not-allowed`

### 7.2 Badges

| Class            | Colors                         | Usage              |
| ---------------- | ------------------------------ | ------------------ |
| `.badge-primary` | Purple text on light purple bg | Categories, tags   |
| `.badge-success` | Green text on light green bg   | Active, approved   |
| `.badge-warning` | Amber text on light amber bg   | Pending, deadline  |
| `.badge-error`   | Red text on light red bg       | Rejected, critical |
| `.badge-info`    | Blue text on light blue bg     | Informational      |

### 7.3 Input Fields

- All inputs use `.input-field` class
- Rounded corners (`var(--radius-md)`)
- On focus: purple border ring (`0 0 0 3px rgba(124, 58, 237, 0.12)`)
- Placeholder text uses `--text-muted`
- Textareas are vertically resizable with `min-height: 100px`

### 7.4 Cards

- Default card pattern: `.glass-card` with `padding: 20px–24px`
- Hover: lift `translateY(-2px)` with shadow upgrade to `--shadow-lg`
- Cards should never have sharp corners — minimum `--radius-md`

---

## 8. Animation System

### 8.1 Transitions

| Token               | Value                               | Usage                      |
| ------------------- | ----------------------------------- | -------------------------- |
| `--transition-fast` | `0.15s ease`                        | Micro-interactions (hover) |
| `--transition-base` | `0.25s ease`                        | Standard transitions       |
| `--transition-slow` | `0.4s cubic-bezier(0.4, 0, 0.2, 1)` | Layout shifts, page enters |

### 8.2 Keyframe Animations

| Animation      | Effect                     | Duration | Class                  |
| -------------- | -------------------------- | -------- | ---------------------- |
| `fadeIn`       | Fade up from 10px below    | 0.5s     | `.animate-fade-in`     |
| `slideInLeft`  | Slide in from 20px left    | 0.4s     | `.animate-slide-left`  |
| `slideInRight` | Slide in from 20px right   | 0.4s     | `.animate-slide-right` |
| `scaleIn`      | Scale up from 95%          | 0.3s     | `.animate-scale-in`    |
| `pulse`        | Gentle pulse scale         | —        | (Use inline)           |
| `shimmer`      | Loading shimmer effect     | —        | (Use inline)           |
| `float`        | Gentle up-down float (8px) | —        | (Use inline)           |

### 8.3 Stagger System

Use `.stagger-1` through `.stagger-5` to create cascading entrance animations for card lists:

```
.stagger-1 → 50ms delay
.stagger-2 → 100ms delay
.stagger-3 → 150ms delay
.stagger-4 → 200ms delay
.stagger-5 → 250ms delay
```

### 8.4 Animation Rules

> [!TIP]
>
> - **Page loads**: Use `fadeIn` for main content, `slideInLeft` for sidebars
> - **Card lists**: Apply staggered `fadeIn` for a cascading reveal effect
> - **Modals**: Use `scaleIn` for dialog boxes
> - **Hover effects**: Keep to `translateY(-2px)` lift — never more than `-4px`
> - **Never** animate width/height directly — use `transform` and `opacity` for performance
> - **Respect `prefers-reduced-motion`** — all animations should degrade gracefully

---

## 9. Layout Patterns

### 9.1 Portal Layout

```
┌──────────────────────────────────────────────────┐
│                    Topbar (64px)                   │
├──────────┬───────────────────────────────────────┤
│          │                                       │
│ Sidebar  │         Main Content Area             │
│ (260px)  │    padding: 24px–32px                 │
│          │    max-width: responsive               │
│ gradient │    scroll: vertical                    │
│ bg       │                                       │
│          │                                       │
└──────────┴───────────────────────────────────────┘
```

- Sidebar uses the `--bg-sidebar` gradient (purple vertical gradient)
- Sidebar text and icons are always white (`--text-white`)
- Active nav item has a subtle `rgba(255,255,255,0.15)` background
- On mobile (`≤ 768px`): sidebar collapses to `0px` (hidden or overlay)

### 9.2 Page Structure

Every content page should follow:

1. **Page Header** — Title (h1, gradient text) + subtitle + optional action button
2. **Filter/Search Bar** (if applicable) — Sticky or inline
3. **Content Grid/List** — Cards in CSS Grid or Flexbox
4. **Empty States** — Friendly illustration + message when no data exists

### 9.3 Responsive Breakpoints

| Breakpoint | Width      | Behavior                                  |
| ---------- | ---------- | ----------------------------------------- |
| Desktop    | > 1024px   | Full sidebar, multi-column grid           |
| Tablet     | 769–1024px | Collapsed sidebar, 2-column grid          |
| Mobile     | ≤ 768px    | No sidebar, single column, stacked layout |

---

## 10. Iconography

- **Primary Icon Set**: Emoji-based icons for service modules (e.g., 📋, 🖨️, 🏋️)
- **Inline Icons**: Unicode characters and CSS-rendered shapes where appropriate
- **No external icon library** is currently used — if one is adopted, prefer **Lucide React** or **Heroicons** for consistency with the design language

---

## 11. UX Principles

### 11.1 Core Principles

1. **Feedback on Every Action** — Buttons show loading states, forms display success/error toasts, clicks have visual responses
2. **Confirmation on Destructive Actions** — Deletes, status changes, and profile edits require a confirmation modal
3. **Progressive Disclosure** — Show overviews first (cards), details on click (modals or sub-pages)
4. **Consistent Navigation** — Sidebar is always visible on desktop; breadcrumbs or back buttons on detail pages
5. **Accessibility First** — All interactive elements must have clear focus indicators and proper ARIA labels

### 11.2 Loading States

- Use the `.shimmer` animation for skeleton loading screens
- Never show a blank page — always show at least a skeleton or spinner
- Data fetching should show optimistic UI where safe

### 11.3 Empty States

- Every list/table view must have an empty state
- Empty states include: relevant emoji/icon + descriptive message + CTA if applicable
- Example: "🎯 No events yet — check back soon or ask your SK to post one!"

### 11.4 Toast Notifications

- Positioned top-right
- Auto-dismiss after 3–5 seconds
- Color-coded by status (success/warning/error/info)
- Include a close button for manual dismissal

### 11.5 Modal Patterns

- Use `scaleIn` animation on open
- Dark overlay: `rgba(0, 0, 0, 0.5)`
- Close on overlay click and Escape key
- Always include a visible close button (top-right ✕)
- Max-width: `600px` for forms, `800px` for detail views

---

## 12. Styling Architecture

### 12.1 File Organization

| File Type            | Location                    | Purpose                          |
| -------------------- | --------------------------- | -------------------------------- |
| Design system tokens | `frontend/app/globals.css`  | CSS custom properties, utilities |
| Page styles          | `*.module.css` (co-located) | Scoped per-page styles           |
| Component styles     | `*.module.css` (co-located) | Scoped per-component styles      |

### 12.2 CSS Methodology

- **CSS Modules** for component/page scoping (`.module.css` files)
- **CSS Custom Properties** for all design tokens (defined in `globals.css`)
- **Utility classes** for common patterns (`.glass-card`, `.btn-*`, `.badge-*`, `.gradient-text`, `.animate-*`)
- **No CSS-in-JS** — all styles are authored in vanilla CSS files
- **No Tailwind CSS** — the project uses a custom design system

### 12.3 Naming Conventions

- CSS module classes: `camelCase` (e.g., `styles.pageHeader`, `styles.cardGrid`)
- Utility classes: `kebab-case` (e.g., `glass-card`, `btn-primary`)
- CSS custom properties: `--kebab-case` (e.g., `--primary`, `--bg-card`)

---

## 13. Scrollbar Design

Custom styled scrollbar that matches the brand:

- Width: `6px`
- Track: transparent
- Thumb: `--primary-lighter` (`#C4B5FD`)
- Thumb hover: `--primary-light` (`#A78BFA`)

---

## 14. Do's and Don'ts

### ✅ Do

- Use the design tokens from `globals.css` for every color, shadow, radius, and transition
- Apply `.glass-card` for content containers
- Add micro-animations (hover lifts, fade-ins) to interactive elements
- Test responsiveness at all three breakpoints
- Use Poppins for headings and Inter for body text
- Maintain the purple-pink gradient as the brand signature

### ❌ Don't

- Hardcode hex colors in module CSS files
- Use sharp corners (border-radius: 0) anywhere in the portal
- Create new utility classes in module files — add them to `globals.css`
- Use heavy animations (>0.5s) or animations that block interaction
- Mix styling approaches (no Tailwind, no CSS-in-JS, no inline styles for layout)
- Override the design tokens with `!important` unless absolutely necessary

---

> **⚠️ Change Protocol:** Any change to design tokens, color palette, typography, or component patterns **must** be documented here first or immediately after implementation. All team members and AI tools should reference this file before writing any UI code.
