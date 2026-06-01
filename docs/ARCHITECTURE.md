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
- `barbers/` — GET (public) list active barbers, POST (protected/admin) create barber operational profile and linked User account
- `barbers/[barber_id]/` — PATCH (protected/admin) update operational profile, DELETE (protected/admin) soft-delete barber profile, deactivate associated login, and cancel pending appointments
- `services/` — GET (public) list active services, POST (protected/admin) create service
- `services/[service_id]/` — PATCH (protected/admin) update service fields partially, DELETE (protected/admin) soft-delete service
- `appointments/` — POST (public) create appointment, GET (protected) list appointments
- `appointments/availability/` — GET (public) calculate blocked timeslots for a barber on a specific date

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

### Architectural & Profile Separation

- **Barber** = operational scheduling profile.
- **User** = authentication/account record.
- **Independence of Changes**: Editing a `Barber` profile (via operational parameters) is not the same as editing the linked `User` account. A profile change MUST NOT touch authentication parameters.
- **Credentials and Access Limits**: Credential setup (e.g., username, email, password) occurs strictly upon Barber creation. When modifying a Barber profile via the dashboard, credential/password editing fields are hidden, and `PATCH /api/v1/barbers/[barber_id]` does not handle or allow updating User credentials (such as password resets).

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

## Services Management

This section documents the current implemented architecture for services management. Services represent the menu of procedures clients can select during booking.

### API Endpoint Routes & Roles

- `GET /api/v1/services` — **Public**. Needed by the public booking page to display available choices. Returns only active services.
- `POST /api/v1/services` — **Admin-Only**. Creates a new service.
- `PATCH /api/v1/services/[service_id]` — **Admin-Only**. Performs a partial update to an existing active service.
- `DELETE /api/v1/services/[service_id]` — **Admin-Only**. Soft-deletes a service.

### Technical & Product Behaviors

- **Partial Updates via PATCH**: Only fields supplied in the request body (`service_name`, `service_description`, `duration`, `price`) are updated; omitted fields are preserved. Empty request bodies yield a `400 ValidationError`.
- **Soft Deletion**: The `DELETE` endpoint is idempotent and implements soft deletion. It changes the state field `isActive` to `false` instead of physically removing the row. Inactive/soft-deleted services cannot be updated via the `PATCH` endpoint (yields `404 NotFoundError`).
- **Dashboard Integration**: Service creation and editing are handled on `/dashboard/services`. The left-side form handles both operations dynamically depending on whether a service is selected for editing.
- **Service Modification Guidelines**: Admins may edit service names for corrections or minor improvements.

> **Tip:** For a completely different service, creating a new service record and deactivating the old one is more appropriate to avoid corrupting historical analysis.
>
> Historical appointment data preserves the pricing snapshot at the booking time (`servicePrice` / `service_price` field in `appointment_services` table). Service name history, however, continues to depend on the linked `Service` record.

---

## Barber Management

Operational scheduling profiles are separated from login accounts to support maximum flexibility in system access.

### API Endpoint Routes & Roles

- `GET /api/v1/barbers` — **Public**. Needed by the public booking page to fetch active operational profiles.
- `POST /api/v1/barbers` — **Admin-Only**. Creates an operational `Barber` record and a linked `User` account with role `barber` within a single database transaction.
- `PATCH /api/v1/barbers/[barber_id]` — **Admin-Only**. Partially updates the operational profile.
- `DELETE /api/v1/barbers/[barber_id]` — **Admin-Only**. Soft-deletes the barber profile, deactivates the associated login, and cancels future bookings.

### Technical & Product Behaviors

- **Architectural Separation**: The `PATCH /api/v1/barbers/[barber_id]` endpoint updates _only_ operational scheduling profile fields:
  - `barber_name`
  - `phone_number`
  - `work_start` / `work_end` (both must be supplied together, formatted in 24h `HH:MM`, with start before end)
  - `lunch_start` / `lunch_end` (both must be supplied together, formatted in 24h `HH:MM`, with start before end, and must fall entirely inside the work schedule)
- **Authentication Safeguards**: The profile PATCH endpoint explicitly ignores and **MUST NOT** allow editing linked `User` credentials or metadata fields, such as:
  - `username`
  - `email`
  - `password`
  - `access_level`
  - `linked_barber_id`
  - `is_active` (for the user model)
- **Soft Deletion Cascade**: When an administrator deactivates/deletes a barber:
  1. The `Barber.isActive` field is set to `false`.
  2. The associated `User.isActive` field is set to `false` (if linked).
  3. All future `AGENDADO` appointments for that barber are automatically cancelled (`status` set to `CANCELADO`).
- **Dashboard Integration**: Management is located on `/dashboard/employees`. In edit mode, the left-side form hides user account creation fields (username, email, password, confirm_password) because Barber profile editing is isolated from User credential management. Admin-initiated barber password resets are treated as a separate future feature.

---

## Appointment Availability Endpoint

Clients must be prevented from selecting invalid or double-booked slots on the public scheduling page.

### Endpoint Route & Security Guardrails

`GET /api/v1/appointments/availability?barber_id=<barber_id>&date=<YYYY-MM-DD>` — **Public**.

> **Caution:** Because this is a public, unauthenticated endpoint, it **MUST NOT** expose sensitive customer, administrative, or operational data.
>
> - **Allowed fields in response**: `barber_id`, `date`, and `blocked_slots`.
> - **Strictly Prohibited fields**: client name, client phone, full appointment objects, user records, or session data.

### Availability & Duration Rules

- **Blocked Slots Format**: Returns `blocked_slots` as an array of 24h `HH:MM` time strings (e.g., `["13:00", "13:15", "13:30"]`).
- **Full-Duration Range Blocking**: Existing appointments block the _entire duration range_ they occupy, not just the exact start time. Blocked units are tracked in 15-minute steps.
- **Exclusive End Boundary**: The appointment end time is exclusive.
  - _Example_: An appointment scheduled for `17:00–17:45` blocks `17:00`, `17:15`, and `17:30`. The slot `17:45` is **not** blocked by this appointment.
- **Status Ignorance**: Appointments with status `CANCELADO` or `FALTOU` **MUST NOT** block slots, allowing clients to rebook them immediately.
- **Timezone Safety**: Local day boundaries are computed using the server's local/configured timezone rather than UTC offset math to automatically handle Daylight Saving Time (DST) transitions safely.
- **Authoritative Source of Truth**: The backend appointment creation endpoint (`POST /api/v1/appointments`) remains the final, authoritative source of truth against race conditions or stale frontend availability.

---

## Public Booking Time-Slot Behavior

The client-facing scheduler `/appointment/emperor-barbershop` orchestrates time-slot generation.

### Rules & Operations

1. **24-Hour Time Conventions**: The UI and scheduling logic exclusively use the 24h `HH:MM` format. AM/PM formatting is avoided.
2. **Lunch Break Exclusion**: Selectable slots are generated by `generateTimeSlots` using barber work hours and service duration. Slots overlapping a barber's lunch break interval are automatically filtered out.
3. **Past-Slot Blocking**: Slots occurring in the past relative to the current local browser time are disabled.
4. **Invalid Time Deselection**: If the active calendar day is updated or a previously selected time becomes invalid (e.g. now blocked or in the past), the state variable `selectedTime` is immediately cleared.
5. **Auto-Skip Empty Days**: When a client selects a day that has no available slots, the page automatically runs `searchNextAvailableDate` (looping up to 30 days ahead) to find the first day with at least one free slot. If found, it navigates to that date and displays a user-facing notice: _"A agenda desta data está completa. Mostramos o próximo dia disponível para você."_
6. **Agenda Full Notice**: If no slots are found in the next 30 days, or a manually selected day is full, the scheduler shows an explicit notice (_"Não há horários disponíveis para esta data"_ or _"Não encontramos horários disponíveis nos próximos 30 dias"_).

---

## Admin Dashboard Responsibilities

The protected dashboard provides full visibility and control over resources, staff, and appointments.

### Main Views & Operations

- `/dashboard/overview`:
  - Displays real-time operational metrics.
  - Shows total, concluded, and cancelled/no-show counters, alongside revenue metrics (Total and Today's) derived from active API appointments data.
- `/dashboard/appointments`:
  - Lists all appointments with filtering tabs (`Hoje`, `Próximos`, `Anteriores`).
  - Offers dynamic frontend search matching input against **client name**, **service name**, or **barber name**.
  - Allows admins to cancel an active appointment (triggers `DELETE /api/v1/appointments/[id]` under the hood, updating its status to `CANCELADO` and visually muting/graying out the row).
- `/dashboard/services`:
  - Admin form for service CRUD. Implements POST for creation, PATCH for partial updates, and DELETE for soft deletion.
- `/dashboard/employees`:
  - Admin form for employees CRUD. Implements POST for barber profile and system account provisioning. Implements PATCH for partial operational profile updates and DELETE for soft deactivation.

---

## API Conventions (summary)

- API responses use `snake_case`.
- Internal JS variables and helpers use `camelCase`.
- Use explicit `select` in Prisma queries to avoid leaking sensitive fields.
- Format decimal `price` values to two decimal places in JSON responses.
- Public errors should be instances of the classes in `src/infra/errors.js` and include `action` guidance.
- Do not expose `passwordHash` or raw session tokens in JSON.

### PATCH vs PUT Conventions

- **PATCH** is reserved for partial resource updates. The server updates only the fields provided in the body and preserves all omitted fields.
- **PUT** is reserved strictly for full resource replacement semantics.
- **HTTP Method**: Custom verbs like `UPDATE` are never used as HTTP methods.

### Time & Timezone Formatting

- Barber work schedules and client-facing interfaces must use the 24h `HH:MM` format.
- For Brazilian localized displays, `HHhMM` (e.g., `08h00`) may be used when visually appropriate.
- **Timezone Shifts Avoidance**: Avoid using methods like `toISOString().slice(0, 10)` for local calendar-day representation because it can cause timezone shifts depending on the environment offset. Always format dates using calendar-local components.

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

### Integration Test Scenarios

Developers must maintain and execute the following test suites to verify system boundaries:

1. **Services PATCH Integration Tests** (`services/patch.test.js`):
   - Verifies 401 Unauthorized for anonymous users.
   - Verifies 403 Forbidden for barber users attempting to modify services.
   - Verifies admin users can partially update any service parameter (`service_name`, `service_description`, `duration`, `price`) independently, checking that omitted fields remain fully preserved.
   - Verifies deactivation prevents subsequent updates (404).
   - Verifies validation errors trigger 400 Bad Request for empty payloads or invalid values.
2. **Barbers PATCH Integration Tests** (`barbers/patch.test.js`):
   - Verifies admin users can modify operational parameters.
   - Verifies system ignores and protects account credential fields (`username`, `email`, `password`, etc.) from being modified via the Barber profile PATCH flow.
   - Verifies validation checks: pairing of schedule bounds, and ensuring lunch breaks are strictly nested within working hours.
3. **Availability GET Integration Tests** (`availability/get.test.js`):
   - Verifies that public GET does not expose sensitive customer names, phones, or full appointment records, returning _only_ active blockages.
   - Verifies `CANCELADO` and `FALTOU` status appointments do not block availability.
   - Verifies full duration-range blocking and exclusive end boundaries.

---

## Where new logic goes (reminder)

- 1. New API endpoint: `src/pages/api/v1/<resource>/index.js` or `src/pages/api/v1/<resource>/<id>/index.js` using next-connect and infra helpers.
- 2. Shared infra helper: `src/infra/`.
- 3. Feature-specific frontend helpers/components: `src/features/<domain>/<feature>/`.
- 4. Route pages: `src/pages/`.

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
