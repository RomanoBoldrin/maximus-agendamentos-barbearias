# Architecture Guide: Maximus Agendamentos Barbearias

This document explains the structure, conventions, and design patterns in this barbershop appointment system. It's written for AI coding agents and human contributors who need to understand where logic belongs and how to implement new features consistently.

**Project Purpose**: Academic TCC project (barbershop appointment scheduling system) built with Next.js Pages Router, JavaScript, Prisma, and PostgreSQL.

**Core Principle**: Clear separation of concerns between infrastructure utilities (`src/infra/`), API routes (`src/pages/api/`), and frontend pages (`src/pages/`).

---

## MVP Scope (Locked Decisions)

- Single-barbershop MVP: the current product is intentionally scoped to serve a single barbershop. There is no `Barbershop` model or tenant scoping in the schema or runtime. Future versions may introduce a `Barbershop` entity and tenant-scoped data to support multiple barbershops, but that is out-of-scope for the MVP.
- Admin accounts are intended to be internally provisioned (preferably via a seed/provisioning script). Public admin registration is not part of the active MVP.
- Clients are public (no login) and use the public appointment flow. Admins (and optionally barbers) sign in to manage the system.

These decisions are intentional product constraints for the MVP and must guide implementation choices across the codebase.

---

## Folder Structure & Responsibilities

### `src/pages/api/v1/`

Contains versioned API route handlers. Each endpoint is a module that exports a `next-connect` router instance.

**Current endpoints**:

- `sessions/` — User login, logout, session management
- `users/` — User CRUD operations, user profiles
- `status/` — App health checks
- `[username]/` — Dynamic routes for user lookups
- `barbers/` — GET (public) list active barbers
- `services/` — GET (public) list active services
- `appointments/` — POST (public) create appointment, GET (protected) list appointments

Note: The API surface is designed around the single-barbershop MVP; do not introduce tenant-scoped endpoints or a `Barbershop` table unless the product scope changes.

**Pattern**: Each handler is a separate async function with `(request, response)` signature. The router uses `controller.errorHandlers` for centralized error handling.

### `src/pages/`

Frontend pages using Next.js Pages Router with per-page layout composition.

**Layouts**:

- `AuthLayout` — For login/register pages (minimal)
- `DashboardLayout` — For authenticated user pages (sidebar, topbar)
- `MainLayout` — For public pages (header, footer)

Pages apply layouts via `getLayout` prop (see `_app.jsx`). No client-side authentication middleware yet; backend API is the source of truth. Frontend checks are for UX only and must not be relied upon for security.

### `src/infra/`

Shared utilities and helpers used by API routes. Each module has a single responsibility.

**Modules**:

- `authentication.js` — User credential validation, protected request handling
- `authorization.js` — Role-based and resource ownership checks (minimal RBAC)
- `session.js` — Session lifecycle (creation, validation, renewal, expiration)
- `password.js` — Password hashing and comparison
- `errors.js` — Custom error classes (public API errors)
- `controller.js` — Error handler middleware for next-connect routers
- `prisma.js` — Singleton PrismaClient instance (hot-reload safe)

### `src/components/`

React components split into:

- `layout/` — Page layouts (AuthLayout, DashboardLayout, MainLayout, Navbar, Footer)
- `ui/` — Reusable UI components and specialized components (InteractiveCalendar, DashboardSidebar)

### `src/features/`

Feature-specific helpers and components live under `src/features/<domain>/<feature>/`. For example, booking-specific frontend helpers and components were moved to `src/features/appointment/booking/`.

### `prisma/`

Database schema and migration history.

- `schema.prisma` — Database models, relationships, enums
- `migrations/` — Historical migrations tracked in version control

Important: The current Prisma schema intentionally does not define a `Barbershop` model because the product is scoped to a single shop for the MVP.

---

## API Layer: Route Design & Conventions

### Router Pattern

All API routes use `next-connect` for cleaner handler organization.

Key points:

- Each handler is a separate async function
- The final line uses `router.handler(controller.errorHandlers)` for unified error handling
- Dynamic routes use Next.js pattern: `[param]/index.js` → accessible at `/api/v1/:param`

### Response Format: snake_case

All API response keys use `snake_case`. This is enforced across success and error responses.

### Request Validation

Validation is done inline in API handlers with early returns on validation failure. Keep validation logic close to the route handler and avoid introducing heavy validation frameworks for MVP simplicity.

### API Security & Exposure Rules (MVP)

- API responses MUST use `snake_case` keys.
- Internal JavaScript variable/function names MUST use `camelCase`.
- Use explicit Prisma `select` to avoid leaking sensitive fields (for example, never expose `passwordHash`).
- Public errors should use the classes in `src/infra/errors.js` and include an `action` field describing the next step.
- Never include raw session tokens in JSON responses; session tokens are set via HttpOnly cookies only.

---

## Authentication & Session Flow

Sessions are stored as hashed tokens in the database; raw tokens are delivered only in HttpOnly cookies. This reduces risk if the database is leaked.

Key lifecycle points:

- `POST /api/v1/sessions` — validates credentials, creates a session record (stores token hash), sets an HttpOnly cookie with the raw token, and returns session metadata.
- Protected endpoints validate the cookie token by hashing and comparing against the database, and renew sessions on protected reads.
- `DELETE /api/v1/sessions` — expire session record and clear cookie.

Important security rules:

- Do not store raw session tokens in the DB.
- Renew sessions on protected reads and set `Cache-Control: no-store` on protected endpoints to avoid caching sensitive responses.

---

## Authorization (Intended Architecture)

### Access Levels

The `User` model exposes an `access_level` with values used by authorization helpers:

- `admin` — Full system access
- `barber` — Limited permissions, usually scoped to a `Barber` profile

**MVP role rules**:

- `admin`: internally provisioned owner/manager account. Admins manage barbers, services, and appointments via the protected dashboard.
- `barber`: a work account. A `Barber` domain record exists, and a `User` with `access_level = "barber"` may be linked to it via `linkedBarberId` when the admin creates a login for the barber.
- Client: public user, does not log in; creates appointments through the public appointment flow.

Authorization helpers in `src/infra/authorization.js` provide `isAdmin()`, `ensureAdmin()` and `ensureOwnerOrAdmin()` convenience functions. Use them after authentication succeeds.

---

## User vs Barber: Two Distinct Entities

The system separates authentication accounts (`User`) from operational profiles (`Barber`).

- `User` — authentication/account model (email, passwordHash, accessLevel, linkedBarberId)
- `Barber` — domain profile used for scheduling (name, phone, work hours)

Not every barber has a `User`. Admins create and link `User` accounts for barbers when they need login access. Do not expose a public barber self-registration flow.

---

## Appointment Flow (Public)

This section documents the current public booking flow used by clients (no login required):

- Public booking page: `/appointment/emperor-barbershop`
  - Loads services from `GET /api/v1/services`
  - Loads barbers from `GET /api/v1/barbers`
  - Posts new appointment to `POST /api/v1/appointments`
  - On successful creation the UI redirects to `/appointment/summary/[appointment_id]` where `[appointment_id]` is the canonical identifier for the created appointment

- Summary page: `/appointment/summary/[appointment_id]`
  - Fetches appointment details from `GET /api/v1/appointments/[appointment_id]`
  - Summary must be derived from the database/API response; do not rely on client-side state, cookies, or query parameters to determine which appointment is shown

The appointment record in the database is the single source of truth for confirmation and summary pages.

---

## Dynamic summary route

- `/appointment/summary/[appointment_id]` is a dynamic SSR route. `/appointment/summary` is not a valid fixed summary page for a created appointment.
- Invalid or nonexistent appointment IDs should cause a real 404 (server-side `notFound: true`).
- Cancelled appointments remain valid summary records and should still render on the summary route.
- Do not use cookies or query parameters as the source of appointment ownership — the URL `appointment_id` + API/db response is authoritative.

---

## Appointment edit / cancel (MVP decision)

- `DELETE /api/v1/appointments/[appointment_id]` cancels the appointment by setting `Appointment.status = CANCELADO`.
- The appointment row is not physically deleted from the database.
- Cancelled appointments remain visible in `/appointment/summary/[appointment_id]` and in dashboard appointment lists.
- Dashboard UI should visually distinguish cancelled appointments, for example by showing status `Cancelado` and muting/graying out the row/card.
- Cancelled appointments should not block the same barber/date/time slot from being booked again.
- Full PATCH-based appointment editing is not implemented in the current MVP.
- For the MVP, the UI "edit" flow is implemented as cancel + recreate: the client cancels the current appointment (soft-cancel) and is guided to create a new appointment. This is a deliberate MVP decision; PATCH-based editing may be implemented in future iterations when product needs evolve.

---

## Admin dashboard responsibilities

- `/dashboard/employees` — intended to manage barber profiles
- `/dashboard/services` — intended to manage services (documented as the intended management page; describe as intended if a fully implemented page is not present)
- `/dashboard/appointments` — intended to list and filter appointments

Notes:

- Dashboard routes must be protected by session-based authentication and role checks.
- Admins see all appointments.
- Cancelled appointments remain visible in dashboard lists and should be clearly marked with status `Cancelado` and muted/grayed styling.
- Barber users (when linked) should only see appointments where `User.linkedBarberId === Appointment.barberId`.

---

## API Conventions (summary)

- API responses use `snake_case`.
- Internal JS variables and helpers use `camelCase`.
- Use explicit `select` in Prisma queries to avoid leaking sensitive fields.
- Format decimal `price` values to two decimal places in JSON responses.
- Public errors should be instances of the classes in `src/infra/errors.js` and include `action` guidance.
- Do not expose `passwordHash` or raw session tokens in JSON.

---

## Deletion conventions

- Prefer soft deletion for business/domain records that may be referenced by historical data.
- Soft deletion means changing a state field such as `status` or `isActive`, instead of physically removing the row.
- Hard deletion should only be used for temporary/lifecycle records or when explicitly approved.
- Appointments use soft cancellation through `status = CANCELADO`; cancelled appointments remain visible and do not block rebooking.
- Services should be soft-deleted by setting `isActive = false`.
- Barbers should be soft-deleted by setting `isActive = false`.
- Sessions may be expired or removed as lifecycle/authentication records.

---

## Feature folder convention

- `src/components/` — shared/global UI components
- `src/features/<domain>/<feature>/` — feature-specific helpers and components (for example `src/features/appointment/booking/`)
- `src/pages/` — route entrypoints
- `src/infra/` — backend/shared infrastructure

Note: Booking-specific helpers/components were moved under `src/features/appointment/booking/` to scope them to the appointment domain. `emperor-barbershop.jsx` is in the process of being refactored to a more orchestrated component decomposition; the refactor is ongoing.

---

## What NOT to do (strict guidelines for contributors)

- Do NOT implement multi-tenancy or add a `Barbershop` table while the project is scoped to the single-barbershop MVP. Multi-tenancy is a future improvement.
- Do NOT re-enable or treat `/register` as part of the active admin onboarding flow. The `/register` page exists in the repo but is not part of the MVP; it should redirect users to `/featureUnavailable` (and then to `/login`) until an explicit product decision reintroduces public registration.
- Do NOT depend on cookies or query parameters to assert appointment ownership for the summary page — rely on `appointment_id` and the API/db record.
- Do NOT treat appointment cancellation as hard deletion, or assume cancelled appointments disappear from summary/dashboard views.
- Do NOT allow public signup to create `admin` or `barber` accounts. Barber `User` accounts must be created by an `admin` and linked to a `Barber` profile.
- Do NOT expose sensitive fields (password hashes, raw session tokens) via API responses.
- Avoid major stack rewrites (TypeScript migration, App Router adoption, or heavy new packages) during MVP work unless explicitly approved.

---

## Testing, Seeds & Provisioning (notes)

- Admin provisioning is intended to be performed via an internal provisioning process (seed script or manual DB provisioning). If a seed script is not present, do not assume it exists — document the intended approach and add an explicit seeding implementation as a separate task.
- Tests use the orchestrator helpers under `src/tests/orchestrator/` to create users, sessions, barbers, services, clients, and appointments for integration testing.

---

## Where new logic goes (reminder)

1. New API endpoint: `src/pages/api/v1/<resource>/index.js` or `src/pages/api/v1/<resource>/<id>/index.js` using next-connect and infra helpers.
2. Shared infra helper: `src/infra/`.
3. Feature-specific frontend helpers/components: `src/features/<domain>/<feature>/`.
4. Route pages: `src/pages/`.

---

## Summary

This document scopes the project as a single-barbershop MVP with an internally provisioned admin login. The public booking flow is the primary client-facing experience, and the API/db record is the source of truth for appointment summaries. The doc also captures conventions (snake_case responses, explicit Prisma selects), security rules (hashed sessions, no token leaks), and contributor guardrails to prevent premature multi-tenant or public-registration changes.

**Key files to reference**

- [src/infra/authentication.js](src/infra/authentication.js)
- [src/infra/session.js](src/infra/session.js)
- [src/infra/errors.js](src/infra/errors.js)
- [src/infra/controller.js](src/infra/controller.js)
- [prisma/schema.prisma](prisma/schema.prisma)
- [src/pages/api/v1/appointments/index.js](src/pages/api/v1/appointments/index.js)
- [src/pages/api/v1/appointments/\[appointment_id\]/index.js](src/pages/api/v1/appointments/[appointment_id]/index.js)
- [src/pages/appointment/emperor-barbershop.jsx](src/pages/appointment/emperor-barbershop.jsx)
- [src/pages/appointment/summary/\[appointment_id\].jsx](src/pages/appointment/summary/[appointment_id].jsx)
