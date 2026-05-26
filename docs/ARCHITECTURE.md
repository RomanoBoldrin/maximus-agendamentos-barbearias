# Architecture Guide: Maximus Agendamentos Barbearias

This document explains the structure, conventions, and design patterns in this barbershop appointment system. It's written for AI coding agents and human contributors who need to understand where logic belongs and how to implement new features consistently.

**Project Purpose**: Academic TCC project (barbershop appointment scheduling system) built with Next.js Pages Router, JavaScript, Prisma, and PostgreSQL.

**Core Principle**: Clear separation of concerns between infrastructure utilities (infra/), API routes (pages/api/), and frontend pages (pages/).

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

**Pattern**: Each handler is a separate async function with `(request, response)` signature. The router uses `controller.errorHandlers` for centralized error handling.

### `src/pages/`

Frontend pages using Next.js Pages Router with per-page layout composition.

**Layouts**:

- `AuthLayout` — For login/register pages (minimal)
- `DashboardLayout` — For authenticated user pages (sidebar, topbar)
- `MainLayout` — For public pages (header, footer)

Pages apply layouts via `getLayout` prop (see \_app.jsx). No client-side authentication middleware yet; backend API is the source of truth. Frontend checks (e.g., showing/hiding UI elements) are for UX only and must not be relied upon for security.

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

### `src/tests/`

Integration tests mirroring the API structure under `integration/api/v1/`.

**Key files**:

- `orchestrator/orchestrator.mjs` — Test helper functions (createUser, createSession, etc.)
- `orchestrator/wait-for-services.mjs` — Startup utility for test environment

**Setup flow**:

- `jest.globalSetup.js` — Runs once before all tests; clears database
- `jest.setup.js` — Runs before each test; cleans up Prisma connections

### `prisma/`

Database schema and migration history.

- `schema.prisma` — Database models, relationships, enums
- `migrations/` — Historical migrations tracked in version control

---

## API Layer: Route Design & Conventions

### Router Pattern

All API routes use `next-connect` for cleaner handler organization:

```javascript
// src/pages/api/v1/sessions/index.js
import { createRouter } from "next-connect";
import controller from "@/infra/controller";

const router = createRouter();

async function postHandler(request, response) {
  // handler logic
}

async function deleteHandler(request, response) {
  // handler logic
}

router.post(postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);
```

**Key points**:

- Each handler is a separate async function
- The final line always uses `router.handler(controller.errorHandlers)` for unified error handling
- Dynamic routes use Next.js pattern: `[username]/index.js` → accessible at `/api/v1/users/:username`

### Response Format: snake_case

All API response keys use `snake_case`. This is consistent across success and error responses.

**Success response example**:

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "john_barber",
  "email": "john@example.com",
  "access_level": "barber",
  "linked_barber_id": "123e4567-e89b-12d3-a456-426614174000",
  "is_active": true,
  "created_at": "2026-05-25T10:30:00Z",
  "updated_at": "2026-05-25T10:30:00Z"
}
```

**Error response example**:

```json
{
  "name": "ValidationError",
  "message": "Email is required.",
  "action": "Provide a valid email address.",
  "status_code": 400
}
```

### Request Validation

Validation is done inline in API handlers. Early return on validation failure:

```javascript
async function postHandler(request, response) {
  const { email, password } = request.body;

  // Validate required fields
  if (!email || !password) {
    return response.status(400).json({
      name: "ValidationError",
      message: "Email and password are required.",
      action: "Send both email and password.",
      status_code: 400,
    });
  }

  // Normalize inputs
  const normalizedEmail = email.trim().toLowerCase();

  // Proceed with business logic
  // ...
}
```

**Convention**: Keep validation logic close to the route handler. Do not introduce validation frameworks (like Zod) unless explicitly required. Maintain simplicity.

---

## Authentication & Session Flow

### Session Model

Sessions are database records that track user login state:

```
Session {
  sessionId:     UUID (primary key)
  tokenHash:     STRING unique, NOT NULL (SHA256 hash of raw token)
  userId:        UUID (foreign key to User)
  expiresAt:     TIMESTAMP
  createdAt:     TIMESTAMP
}
```

### Session Lifecycle

**1. Creation (POST /api/v1/sessions)**

User provides `email` and `password`:

1. Validate inputs
2. Call `authentication.getAuthenticatedUser({ email, password })`
   - Normalizes email to lowercase
   - Uses a fake password hash for non-existent emails (timing attack prevention)
   - Compares provided password against user's `passwordHash` via bcryptjs
3. If valid, call `session.create(userId)`
   - Generates 48 bytes of random hex (raw token)
   - Hashes token with SHA256 → tokenHash (stored in DB)
   - Sets HttpOnly cookie with raw token: `session_id={rawToken}`
   - 30-day expiration
4. Return user object + set Set-Cookie header

**Important**: The raw session token is **never stored in the database**. Only the hash is stored. This means:

- Database breach does not expose active sessions
- Each session token must be kept secure in the HttpOnly cookie
- No recovery mechanism for forgotten tokens (by design)

**2. Validation (Protected Routes)**

Any endpoint that requires authentication:

1. Extracts raw token from `request.cookies.session_id`
2. Calls `session.findValidSessionbyToken(rawToken)`
   - Hashes the provided token
   - Looks up database record by tokenHash
   - Checks `expiresAt > now()`
   - Returns session object if valid, null otherwise
3. If invalid/expired, throw `UnauthorizedError`
4. Fetch user data using `sessionObject.userId`
5. Renew session (extend expiration)
6. Set new Set-Cookie header in response

**Cache Control**: Protected endpoints must include cache-control headers to prevent stale responses:

```javascript
response.setHeader("Cache-Control", "no-store, no-cache, max-age=0");
```

**3. Renewal (GET /api/v1/user)**

Called automatically on every user data fetch:

1. Validates current session
2. Calls `session.renew(sessionId, rawToken)`
   - Updates `expiresAt` to 30 days from now
   - Generates new Set-Cookie header
3. Sets Set-Cookie header in response

This keeps sessions alive as long as the user is active.

**4. Expiration (DELETE /api/v1/sessions)**

User logout:

1. Validates current session
2. Calls `session.expireById(sessionId)` — sets `expiresAt` to now
3. Calls `controller.clearSessionCookie(response)` — sets maxAge: -1 to remove cookie
4. Session is immediately invalid for future requests

### Frontend Authentication Flow

The backend API is the source of truth for authentication.

- **Initial page load**: Pages may not know if user is logged in (no client middleware)
- **First interaction**: Frontend calls an API endpoint
  - If 401 Unauthorized: user is not logged in; redirect to login page
  - If 200: user is authenticated
- **Ongoing checks**: Check endpoints (like GET /api/v1/user) to validate session
- **Frontend validation**: Showing/hiding UI elements based on login status is for UX only, not security
- **Security enforcement**: Happens only on the backend API

---

## Authorization (Intended Architecture)

**Current Status**: Basic role-based access is in place. Full resource ownership checks are being implemented progressively.

### Access Levels

The `User` model has an `access_level` enum:

- `admin` — Full system access, no restrictions
- `barber` — Limited permissions, checked per resource via `linkedBarberId`
- (clients are public/unauthenticated; no user account required)

### Authorization Pattern

**Admin users**: Bypass all resource restrictions.

**Barber users**: Have permissions only for their own resources via `linkedBarberId`:

```javascript
// Example: Barber can only view appointments for their linked barber profile
const userFound = await prisma.user.findUnique({
  where: { userId: validSessionObject.userId },
});

if (userFound.accessLevel === "admin") {
  // Admin sees all appointments
} else if (userFound.accessLevel === "barber") {
  // Barber sees only their own appointments (via linkedBarberId)
  const appointments = await prisma.appointment.findMany({
    where: { barberId: userFound.linkedBarberId },
  });
}
```

**Clients** (unauthenticated): Can view available services and create appointments without login.

### Future Direction

Authorization checks will be enforced consistently across all endpoints:

1. Validate user exists and is active (`isActive: true`)
2. Check role-based permissions (admin bypasses all checks)
3. For barbers, validate resource ownership via `linkedBarberId`
4. Throw `ForbiddenError(403)` if user lacks permission

---

## User vs Barber: Two Distinct Entities

The system distinguishes between authentication accounts and work profiles.

### User (Authentication Entity)

The `User` model represents an account in the system:

```
User {
  userId:         UUID
  username:       STRING unique
  email:          STRING unique
  passwordHash:   STRING (60 chars, bcryptjs)
  accessLevel:    ENUM [admin, barber] (no uppercase)
  linkedBarberId: UUID nullable (FK to Barber)
  isActive:       BOOLEAN
  createdAt:      TIMESTAMP
  updatedAt:      TIMESTAMP
}
```

- Created via signup or admin user creation
- Used for login (email + password)
- Tracks authentication state via sessions

### Barber (Domain Profile)

The `Barber` model represents a work profile in the system:

```
Barber {
  barberId:    UUID
  name:        STRING
  phone:       STRING
  workStart:   TIME
  workEnd:     TIME
  lunchStart:  TIME
  lunchEnd:    TIME
  linkedUser:  User nullable (relationship from linkedBarberId)
}
```

- Created by admins to represent a barbershop employee
- Can have a `linkedUser` (the barber's authentication account)
- Owns appointments (barberId is a foreign key in Appointment)

### Relationship

A barber user's `linkedBarberId` points to their `Barber` profile:

```javascript
// Barber user with their profile
const user = await prisma.user.findUnique({
  where: { userId: "..." },
  include: { linkedBarber: true } // Include Barber details
});

// Returns:
{
  userId: "user-uuid",
  username: "joao_barbeiro",
  accessLevel: "barber",
  linkedBarberId: "barber-uuid",
  linkedBarber: {
    barberId: "barber-uuid",
    name: "João Silva",
    workStart: "09:00",
    workEnd: "18:00",
    // ...
  }
}
```

**Key point**: Not every barber has a user account. Admins manage barber profiles independently. Only when a barber needs to login (access their appointment dashboard) is a user account created and linked.

---

## Infra Layer: Shared Utilities

### authentication.js

User credential validation during login and session-based protected request handling.

**Exports**:

- `getAuthenticatedUser({ email, password })` — Validate user credentials
  - Normalizes email to lowercase
  - Queries database for user by email
  - If not found, uses a fake password hash (prevents timing attacks)
  - Compares provided password against stored hash via bcryptjs
  - Throws `UnauthorizedError` if invalid
  - Returns user object with fields: userId, username, email, accessLevel, linkedBarberId, isActive, createdAt, updatedAt

- `getAuthenticatedUserFromRequest(request)` — Extract and validate authenticated user from request
  - Reads `request.cookies.session_id`
  - Validates session via `session.findValidSessionbyToken()`
  - Loads user and checks `isActive: true`
  - Throws `UnauthorizedError` if session missing/invalid/expired
  - Throws `NotFoundError` if user record not found
  - Returns `{ user, session }` object (caller can access both for session renewal)

**Design**: Always compare against a hash, even for non-existent users, to prevent timing-based email enumeration attacks.

**Usage**: `getAuthenticatedUserFromRequest()` is the recommended helper for protected endpoints; it centralizes session validation and user lookup.

### authorization.js

Minimal role-based access control and resource ownership checks. Does NOT perform authentication; caller must authenticate first.

**Exports**:

- `isAdmin(user)` — Check if user has admin access (returns boolean)
- `ensureAdmin(user)` — Throw `ForbiddenError` if user is not admin
- `ensureOwnerOrAdmin(user, resourceOwnerBarberId)` — Throw `ForbiddenError` if user is not admin AND linkedBarberId doesn't match resourceOwnerBarberId

**Design**:

- Admin users bypass all resource restrictions (`isAdmin(user)` returns true)
- Barber users have access only to resources where `linkedBarberId === resourceOwnerId`
- Functions throw `ForbiddenError` on permission denial (authenticated but unpermitted)
- No database queries; purely role/ownership checks against in-memory user object

**Usage**:

```javascript
const { user } = await authentication.getAuthenticatedUserFromRequest(request);

// For admin-only endpoints
authorization.ensureAdmin(user); // Throws ForbiddenError if not admin

// For resource owner checks
authorization.ensureOwnerOrAdmin(user, appointment.barberId); // Only owner or admin can access
```

### session.js

Session lifecycle management.

**Key constants**:

```javascript
SESSION_DURATION_IN_MILLISECONDS = 60 * 60 * 24 * 30 * 1000; // 30 days
SESSION_COOKIE_NAME = "session_id";
```

**Exports**:

- `create(userId)` — Generate token, hash it, store in DB, return session object + cookie header
- `findValidSessionbyToken(rawToken)` — Validate and retrieve session (checks expiration)
- `renew(sessionId, rawToken)` — Extend expiration, return new cookie header
- `expireById(sessionId)` — Mark session as expired (logout)
- `hashSessionToken(token)` — Utility to hash tokens (SHA256)

### password.js

Password hashing and comparison.

**Bcrypt configuration**:

- **Production**: 14 rounds (high cost, slower)
- **Test/Development**: 1 round (low cost, faster tests)
- **Override**: Set `BCRYPT_ROUNDS` environment variable to force a specific value

**Exports**:

- `hash(plainPassword)` — Hash password with configured rounds
- `compare(plainPassword, storedHash)` — Verify password (returns boolean)

**Hash length**: Bcryptjs always produces 60-character hashes. This is enforced in the Prisma schema (`passwordHash` is VARCHAR(60)).

### errors.js

Custom error classes for public API responses. All errors are thrown in handlers; `controller.errorHandlers` catches and serializes them.

**Error classes** (all return `status_code` in response):

- `ValidationError(400)` — Input validation failures
- `UnauthorizedError(401)` — Auth failures, invalid/expired sessions, wrong credentials
- `ForbiddenError(403)` — User account is inactive, lacks permission
- `NotFoundError(404)` — Resource not found
- `InternalServerError(500)` — Unexpected failures (server errors, uncaught exceptions)

**Structure**: Each error has `.toJSON()` returning `{ name, message, action, status_code }`.

**Convention**: Always include an `action` field telling the user what to do next.

```javascript
throw new UnauthorizedError({
  message: "Invalid email or password.",
  action: "Check your credentials and try again.",
});
```

### controller.js

Central error handler for next-connect routers.

**Exports**:

- `errorHandlers` — next-connect middleware object:
  - `onNoMatch(req, res)` — Returns 405 Method Not Allowed
  - `onError(error, req, res)` — Catches all thrown errors, serializes to JSON
- `clearSessionCookie(response)` — Sets HttpOnly session cookie to be deleted (maxAge: -1)

**Error handling logic**:

1. `ValidationError` and `NotFoundError` — Return with appropriate 4xx status code
2. `UnauthorizedError` — Return 401 AND clear session cookie (user is not authenticated)
3. `ForbiddenError` — Return 403 WITHOUT clearing cookie (user is authenticated but lacks permission)
4. Unexpected errors — Return `InternalServerError` (status 500) without exposing details
5. Never expose stack traces through public API responses

**Key distinction**: `UnauthorizedError` clears the session cookie (log user out), while `ForbiddenError` does not (keep user logged in but deny access).

### prisma.js

Singleton PrismaClient instance.

**Pattern** (prevents connection pool exhaustion during hot-reload):

```javascript
let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient();
  }
  prisma = globalThis.prisma;
}

export default prisma;
```

**Usage**: Import and use throughout the application:

```javascript
import prisma from "@/infra/prisma";

const user = await prisma.user.findUnique({ ... });
```

---

## Database & Prisma Conventions

### Naming Conventions

**Model names** (PascalCase):

- User, Barber, Client, Service, Appointment, Session

**Database field names** (snake_case with @map):

```prisma
model User {
  userId        String   @id @default(uuid())  @map("user_id")
  username      String   @unique
  email         String   @unique
  passwordHash  String   @map("password_hash")
  accessLevel   String   @map("access_level") // enum: admin, barber
  linkedBarberId String? @map("linked_barber_id")
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")
}
```

**Enum values** (mixed case, not all uppercase):

- `AccessLevel`: `admin`, `barber` (lowercase)
- `AppointmentStatus`: `AGENDADO`, `CANCELADO`, `CONCLUIDO`, `FALTOU` (uppercase)

### Query Patterns

**Always use `select()` to control response shape**. Never return all fields by default:

```javascript
const user = await prisma.user.findFirst({
  where: { email: normalizedEmail },
  select: {
    userId: true,
    username: true,
    email: true,
    passwordHash: true,
    accessLevel: true,
    linkedBarberId: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  },
});
```

Benefits:

- Prevents overfetching sensitive data (e.g., passwordHash in responses)
- Explicit control over serialized output
- Type safety with TypeScript (if migrated)

**Case-insensitive lookups** (for username/email):

```javascript
const user = await prisma.user.findFirst({
  where: {
    email: { equals: normalizedEmail, mode: "insensitive" },
  },
});
```

### Error Handling: Unique Constraint Violations

Prisma throws `PrismaClientKnownRequestError` with code `P2002` for unique constraint violations. Catch and convert to `ValidationError`:

```javascript
try {
  const createdUser = await prisma.user.create({
    data: { username, email, passwordHash, accessLevel },
  });
} catch (error) {
  if (error.code === "P2002") {
    const field = error.meta?.target?.[0]; // e.g., "email"
    throw new ValidationError({
      message: `The ${field} is already in use.`,
      action: `Try a different ${field}.`,
    });
  }
  throw error; // Let controller.errorHandlers handle unexpected errors
}
```

---

## Code Conventions & Style Guide

### Casing Rules

| Context                         | Style      | Example                                                |
| ------------------------------- | ---------- | ------------------------------------------------------ |
| JavaScript variables, functions | camelCase  | `userId`, `createUser()`, `emailNotFound`              |
| Database field names            | snake_case | `user_id`, `password_hash`, `created_at`               |
| API response keys               | snake_case | `user_id`, `status_code`, `expires_at`                 |
| Enum values (AccessLevel)       | lowercase  | `admin`, `barber`                                      |
| Enum values (AppointmentStatus) | UPPERCASE  | `AGENDADO`, `CANCELADO`, `CONCLUIDO`, `FALTOU`         |
| React components                | PascalCase | `AuthLayout`, `DashboardLayout`, `InteractiveCalendar` |

### File Naming

- API handlers: `index.js` or `[param]/index.js`
- Components: `.jsx`
- Utilities: `.js` (ES modules)
- Tests: `*.test.js` or `*.test.mjs`

### Error Handling Flow

1. **Validate inputs** — Return early with `response.status(400).json({...})`
2. **Throw custom errors** — Let `controller.errorHandlers` catch them
3. **Never throw uncaught errors** — Always let `controller.errorHandlers` serialize them

```javascript
async function postHandler(request, response) {
  // 1. Validate
  if (!request.body.email) {
    return response.status(400).json(new ValidationError({...}).toJSON());
  }

  // 2. Throw custom error (controller will catch)
  if (someCheck) {
    throw new UnauthorizedError({...});
  }

  // 3. Unexpected error (controller will catch as InternalServerError)
  const result = await someAsyncOperation();
}
```

---

## Protected Route Pattern (Template)

Use this pattern for any endpoint requiring authentication. The `getAuthenticatedUserFromRequest()` helper abstracts session validation and user loading:

```javascript
import { createRouter } from "next-connect";
import controller from "@/infra/controller";
import { getAuthenticatedUserFromRequest } from "@/infra/authentication";
import { UnauthorizedError } from "@/infra/errors";

const router = createRouter();

async function getHandler(request, response) {
  // Extract and validate authenticated user (throws UnauthorizedError if invalid)
  const { user, session } = await getAuthenticatedUserFromRequest(request);

  // Optional: Check authorization roles
  if (user.accessLevel !== "admin") {
    throw new ForbiddenError({
      message: "Admin access required.",
      action: "Contact an administrator.",
    });
  }

  // Proceed with business logic
  // ... fetch data, process, return response

  response.setHeader("Cache-Control", "no-store, no-cache, max-age=0");
  return response.status(200).json({
    user_id: user.userId,
    username: user.username,
    email: user.email,
    access_level: user.accessLevel,
    linked_barber_id: user.linkedBarberId,
    is_active: user.isActive,
  });
}

router.get(getHandler);

export default router.handler(controller.errorHandlers);
```

**What `getAuthenticatedUserFromRequest()` does**:

1. Reads session cookie from request
2. Validates session via database lookup
3. Loads user record and checks `isActive: true`
4. Returns `{ user, session }` or throws `UnauthorizedError` with 401

**Note**: For authorization checks (role/permission validation), use helpers from `authorization.js` after authentication succeeds.

---

## Public Endpoints (No Authentication Required)

### GET /api/v1/barbers

List all active barbers.

**Behavior**:

- No authentication required
- Returns only barbers where `isActive: true`
- Ordered by `createdAt` ascending
- Response: JSON array of barber objects

**Response fields** (snake_case):

```json
[
  {
    "barber_id": "uuid",
    "barber_name": "string",
    "phone_number": "string|null",
    "work_start": "HH:MM",
    "work_end": "HH:MM",
    "lunch_start": "HH:MM|null",
    "lunch_end": "HH:MM|null",
    "is_active": true,
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
]
```

### GET /api/v1/services

List all active services.

**Behavior**:

- No authentication required
- Returns only services where `isActive: true`
- Ordered by `createdAt` ascending
- Prices serialized as strings with two decimal places

**Response fields** (snake_case):

```json
[
  {
    "service_id": "uuid",
    "service_name": "string",
    "service_description": "string|null",
    "duration": 30,
    "price": "50.00",
    "is_active": true,
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
]
```

---

## Appointment Flow

### POST /api/v1/appointments (Create Appointment)

Public endpoint for clients to book appointments. Always creates a new Client record.

**Request body**:

```json
{
  "barber_id": "uuid (required)",
  "appointment_datetime": "ISO8601 (required)",
  "service_ids": ["uuid", "uuid"] (required, non-empty array),
  "client_name": "string (required, non-empty)",
  "client_phone": "string (optional)"
}
```

**Validations**:

1. All required fields present
2. `appointment_datetime` is valid ISO8601 date
3. `appointment_datetime` not in the past
4. `service_ids` is non-empty array with no duplicates
5. Barber exists and `isActive: true`
6. All services exist and `isActive: true`
7. No appointment already exists for barber at exact same `appointment_datetime` (unique constraint)

**Business logic**:

1. Create Client with provided `client_name` and `client_phone` (always new, no reuse)
2. Calculate `totalDuration` as sum of all service durations
3. Calculate `appointmentEndDatetime` as `appointment_datetime + totalDuration minutes`
4. Use transaction (`db.$transaction()`) to ensure atomic creation:
   - Create Appointment with status `AGENDADO`
   - Create AppointmentService records with servicePrice and serviceDuration snapshots from Service
5. Catch Prisma `P2002` unique constraint violation and return `ValidationError 400`

**Response** (201 Created):

```json
{
  "appointment_id": "uuid",
  "appointment_datetime": "ISO8601",
  "appointment_end_datetime": "ISO8601",
  "total_duration": 60,
  "status": "AGENDADO",
  "client_id": "uuid",
  "barber_id": "uuid",
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "services": [
    {
      "service_id": "uuid",
      "service_name": "string",
      "service_price": "50.00",
      "service_duration": 30
    }
  ]
}
```

**Errors**:

- 400 ValidationError: missing/invalid fields, past datetime, duplicate appointment time, inactive barber/service
- 404 NotFoundError: barber or service not found

### GET /api/v1/appointments (List Appointments)

Protected endpoint to list appointments with role-based filtering.

**Authentication**: Required via `authentication.getAuthenticatedUserFromRequest(request)`

**Authorization**:

- Admin users: See all appointments
- Barber users: See only appointments where `barberId === user.linkedBarberId`
- Barber without `linkedBarberId`: Throw `ForbiddenError 403`

**Response** (200 OK):

```json
[
  {
    "appointment_id": "uuid",
    "appointment_datetime": "ISO8601",
    "appointment_end_datetime": "ISO8601",
    "total_duration": 60,
    "status": "AGENDADO",
    "created_at": "ISO8601",
    "updated_at": "ISO8601",
    "client": {
      "client_id": "uuid",
      "client_name": "string",
      "client_phone": "string|null"
    },
    "barber": {
      "barber_id": "uuid",
      "barber_name": "string"
    },
    "services": [
      {
        "service_id": "uuid",
        "service_name": "string",
        "service_price": "50.00",
        "service_duration": 30
      }
    ]
  }
]
```

**Errors**:

- 401 UnauthorizedError: missing/invalid/expired session
- 403 ForbiddenError: barber without linkedBarberId

**Implementation example**:

```javascript
async function getHandler(request, response) {
  const { user } =
    await authentication.getAuthenticatedUserFromRequest(request);

  // Barber must be linked to a profile
  if (!authorization.isAdmin(user) && !user.linkedBarberId) {
    throw new ForbiddenError({
      message: "Barber profile not linked.",
      action: "Contact an administrator.",
    });
  }

  // Build filter based on role
  const whereClause = authorization.isAdmin(user)
    ? {} // Admin sees all
    : { barberId: user.linkedBarberId }; // Barber sees only own

  const appointments = await db.appointment.findMany({
    where: whereClause,
    select: {
      /* ... */
    },
    orderBy: { appointmentDatetime: "asc" },
  });

  return response.status(200).json(appointments.map(serialize));
}
```

---

## Testing Strategy

### Test Structure

Tests are organized to mirror the API structure:

```
src/tests/
  integration/
    api/
      v1/
        sessions/
          delete.test.js
          post.test.js
        users/
          get.test.js
          post.test.js
        [username]/
          get.test.js
```

### Test Setup

**Global setup** (`jest.globalSetup.js` — runs once before all tests):

```javascript
// Clear database
await orchestrator.clearDatabase(); // Calls: prisma migrate reset --force
await prisma.$disconnect();
```

**Per-test setup** (`jest.setup.js` — runs before each test):

```javascript
afterAll(async () => {
  await prisma.$disconnect();
});
```

### Orchestrator Helpers

The orchestrator provides factory functions for test data:

```javascript
// Create a user with optional overrides
const user = await orchestrator.createUser({
  username: "custom_username",
  email: "custom@example.com",
  accessLevel: "barber", // optional
  linkedBarberId: null, // optional
  isActive: true, // optional
});

// Create a session for a user
const sessionObject = await orchestrator.createSession(user.userId);
// Returns: { session, token, sessionCookie }

// Create a barber with optional overrides
const barber = await orchestrator.createBarber({
  barberName: "João Silva",
  phoneNumber: "123456789",
  workStart: "08:00",
  workEnd: "18:00",
  isActive: true,
});

// Create a service with optional overrides
const service = await orchestrator.createService({
  serviceName: "Haircut",
  serviceDescription: "Professional haircut",
  duration: 30,
  price: 50,
  isActive: true,
});

// Create a client
const client = await orchestrator.createClient({
  clientName: "John Doe",
  clientPhone: "987654321",
  isActive: true,
});

// Create an appointment
const appointment = await orchestrator.createAppointment({
  barberId: barber.barberId,
  clientId: client.clientId,
  appointmentDatetime: new Date(),
  appointmentEndDatetime: new Date(),
  totalDuration: 30,
  status: "AGENDADO",
});

// Link a user to a barber profile
await orchestrator.linkUserToBarber(user.userId, barber.barberId);
```

### Integration Test Pattern

Test only the endpoint under test. Use `fetch()` for HTTP calls; use orchestrator/Prisma for setup:

```javascript
describe("DELETE /api/v1/sessions", () => {
  test("With valid session, should invalidate and return 200", async () => {
    // Setup: Create test data via orchestrator/Prisma
    const createdUser = await orchestrator.createUser();
    const sessionObject = await orchestrator.createSession(createdUser.userId);

    // Test: Call the endpoint under test via fetch()
    const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session_id=${sessionObject.token}`,
      },
    });

    // Assert: Check response
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.session_id).toEqual(sessionObject.session.sessionId);

    // Verify side effects: Check database state
    const expiredSession = await prisma.session.findUnique({
      where: { sessionId: sessionObject.session.sessionId },
    });
    expect(expiredSession.expiresAt).toBeLessThan(new Date());

    // Verify cascade: Try using the expired session
    const doubleCheckResponse = await fetch(`${webserver.origin}/api/v1/user`, {
      headers: { Cookie: `session_id=${sessionObject.token}` },
    });
    expect(doubleCheckResponse.status).toBe(401);
  });
});
```

**Key principles**:

- Use `fetch()` to call the endpoint under test (HTTP-level testing)
- Use orchestrator/Prisma to set up prerequisite data (not via API calls)
- Test one endpoint per test file; do not chain endpoint calls for setup
- Verify side effects (database changes) to ensure logic works correctly

---

## What NOT to Do

### 1. Don't Skip Backend Validation

Frontend checks are for UX only. Backend API must always validate:

- Required fields
- Data types
- Unique constraints
- Authorization/permissions

```javascript
// BAD: Trust frontend validation
async function postHandler(request, response) {
  const user = await prisma.user.create({ data: request.body });
}

// GOOD: Validate on backend
async function postHandler(request, response) {
  const { email, password } = request.body;
  if (!email || !password) {
    return response.status(400).json(new ValidationError({...}).toJSON());
  }
  // ... proceed with safe data
}
```

### 2. Don't Store Raw Session Tokens in the Database

Only store the hashed token. Raw tokens must live only in HttpOnly cookies.

```javascript
// BAD: Storing raw token in database
const sessionRecord = await prisma.session.create({
  data: { userId, token: rawToken, expiresAt }, // ❌ WRONG
});

// GOOD: Hash the token before storing
const tokenHash = hashSessionToken(rawToken);
const sessionRecord = await prisma.session.create({
  data: { userId, tokenHash, expiresAt }, // ✅ CORRECT
});
```

### 3. Don't Skip Cache-Control Headers on Protected Endpoints

Prevent browsers from caching sensitive data:

```javascript
// BAD: User data cached by browser
response.status(200).json({ user_id, username });

// GOOD: Prevent caching
response.setHeader("Cache-Control", "no-store, no-cache, max-age=0");
response.status(200).json({ user_id, username });
```

### 4. Don't Normalize Case Only on the Client

Normalize email/username on the server before storing:

```javascript
// BAD: Normalize only in frontend
const email = request.body.email; // "User@EXAMPLE.COM"
const user = await prisma.user.findFirst({ where: { email } }); // No match!

// GOOD: Normalize on server
const normalizedEmail = request.body.email.trim().toLowerCase();
const user = await prisma.user.findFirst({ where: { email: normalizedEmail } });
```

### 5. Don't Skip the `action` Field in Error Responses

Always tell users what to do next:

```javascript
// BAD: No guidance
throw new UnauthorizedError({
  message: "Invalid credentials.",
});

// GOOD: Clear action
throw new UnauthorizedError({
  message: "Invalid email or password.",
  action: "Check your credentials and try again.",
});
```

### 6. Don't Mix Pages Router and App Router

This project uses Pages Router (`src/pages/`). Do not create App Router directories (`src/app/`).

### 7. Don't Assume Tests Run Against Empty Database

Tests may run in parallel and share database state. Use `expect.arrayContaining()` and `expect.objectContaining()` instead of exact equality checks:

```javascript
// BAD: Assumes empty database
expect(barbers).toHaveLength(1);

// GOOD: Tolerates pre-existing data
expect(barbers).toEqual(
  expect.arrayContaining([
    expect.objectContaining({
      barber_name: "João Silva",
      is_active: true,
    }),
  ]),
);
```

### 8. Don't Return Decimal Prices Unformatted

Prices stored as `Decimal` type must be formatted to two decimal places in API responses:

```javascript
// BAD: Unpredictable decimal places
response.json({
  price: service.price, // "50" or "50.00" unpredictably
});

// GOOD: Always two decimal places
response.json({
  price: Number(service.price).toFixed(2), // "50.00"
});
```

Apply this formatting in:

- Services GET endpoint
- Appointments POST/GET endpoints (in services arrays)

### 9. Don't Create New Client Records During Appointment Update

Clients are always created fresh during appointment creation. Do not implement client reuse/lookup yet (reserved for Phase 5). Always create new Client on POST /appointments.

### 10. Don't Access `linkedBarberId` for Non-Barber Users

Barber users have `linkedBarberId` set; other access levels have `null`. Always check both:

```javascript
// BAD: Assumes all non-admin are barbers
if (!authorization.isAdmin(user)) {
  return user.linkedBarberId;
}

// GOOD: Check both conditions
if (!authorization.isAdmin(user) && !user.linkedBarberId) {
  throw new ForbiddenError({ message: "Barber profile not linked." });
}
return user.linkedBarberId;
```

### 7. Don't Create Client-Side API Wrapper Middleware Yet

Fetch API endpoints directly from components. No API layer abstraction yet.

```javascript
// BAD: Creating a wrapper
const api = {
  user: () => fetch("/api/v1/user").then((r) => r.json()),
};

// GOOD: Direct fetch in component
const response = await fetch("/api/v1/user");
const data = await response.json();
```

---

## Common Mistakes to Avoid

### 1. Forgetting to Renew Session on Protected Reads

Session expiration must be extended on every successful authentication check:

```javascript
// BAD: Forgot to renew
const validSession = await session.findValidSessionbyToken(rawToken);
if (!validSession) throw new UnauthorizedError(...);
return response.status(200).json(userData);

// GOOD: Renew session
const validSession = await session.findValidSessionbyToken(rawToken);
if (!validSession) throw new UnauthorizedError(...);
const { sessionCookie } = await session.renew(validSession.sessionId, rawToken);
response.setHeader("Set-Cookie", sessionCookie);
return response.status(200).json(userData);
```

### 2. Not Setting Set-Cookie Header in Response

Session renewal is useless if the new cookie isn't sent:

```javascript
// BAD: Renewed but not sent
const { sessionCookie } = await session.renew(sessionId, rawToken);
return response.status(200).json(userData); // Cookie not sent!

// GOOD: Set the header
const { sessionCookie } = await session.renew(sessionId, rawToken);
response.setHeader("Set-Cookie", sessionCookie);
return response.status(200).json(userData);
```

### 3. Not Using `select()` in Prisma Queries

Overfetching sensitive data (like `passwordHash`) exposes it via API responses:

```javascript
// BAD: Returns all fields
const user = await prisma.user.findUnique({
  where: { userId },
});
// passwordHash is included! Could leak to API response.

// GOOD: Explicit select
const user = await prisma.user.findUnique({
  where: { userId },
  select: { userId: true, username: true, email: true }, // Only safe fields
});
```

### 4. Not Checking `isActive` for User Accounts

Active status is a soft-delete mechanism. Always verify:

```javascript
// BAD: User could be inactive but still access the system
const user = await prisma.user.findUnique({
  where: { userId },
  select: { /* ... */ }
});

// GOOD: Verify active status
const user = await prisma.user.findUnique({
  where: { userId },
  select: { isActive: true, /* ... */ }
});
if (!user || !user.isActive) {
  throw new UnauthorizedError({...});
}
```

### 5. Mixing camelCase and snake_case Inconsistently

Be consistent:

```javascript
// BAD: Mixed casing in response
return response.json({
  user_id: "...", // snake_case
  username: "...", // camelCase ❌
  access_level: "...", // snake_case
  createdAt: "...", // camelCase ❌
});

// GOOD: Consistent snake_case
return response.json({
  user_id: "...",
  username: "...",
  access_level: "...",
  created_at: "...",
});
```

### 6. Not Catching P2002 Duplicate Key Errors

Let Prisma unique constraint errors propagate uncaught and you'll return a 500 instead of 400:

```javascript
// BAD: P2002 becomes InternalServerError
const user = await prisma.user.create({
  data: { email, username /* ... */ },
});

// GOOD: Catch and convert to ValidationError
try {
  const user = await prisma.user.create({
    data: { email, username /* ... */ },
  });
} catch (error) {
  if (error.code === "P2002") {
    const field = error.meta?.target?.[0];
    throw new ValidationError({
      message: `The ${field} is already in use.`,
      action: `Try a different ${field}.`,
    });
  }
  throw error;
}
```

### 7. Not Normalizing Email/Username Before Storing

Duplicate lookups fail if you don't normalize:

```javascript
// BAD: Store as-is
const user = await prisma.user.create({
  data: {
    email: request.body.email, // "User@Example.COM"
    username: request.body.username, // "  JohnDoe  "
  },
});

// GOOD: Normalize before storing
const user = await prisma.user.create({
  data: {
    email: request.body.email.trim().toLowerCase(),
    username: request.body.username.trim(),
  },
});
```

---

## Where New Logic Goes

**New API endpoint?**

1. Create handler function(s) in `src/pages/api/v1/[resource]/index.js` or `[param]/index.js`
2. Use next-connect router pattern
3. Import infra utilities (authentication, session, errors)
4. Use Prisma for database operations
5. End with `router.handler(controller.errorHandlers)`

**New utility/helper?**

1. Add to `src/infra/` if it's used by multiple endpoints (like caching, external API calls)
2. Or add to the existing infra module if it extends an existing responsibility (like adding a session function)

**New page/component?**

1. Add to `src/pages/` for Pages Router pages
2. Add to `src/components/` for reusable components
3. Use layout composition pattern (getLayout)

**New database model?**

1. Add to `prisma/schema.prisma`
2. Run `npm run prisma:migrate` to create migration
3. Update Prisma client: `npm run prisma:generate`

**New test?**

1. Mirror the API structure: `src/tests/integration/api/v1/[resource]/[method].test.js`
2. Use orchestrator helpers for setup
3. Use `fetch()` for endpoint under test
4. Verify database side effects

---

## Summary: The Five Layers

1. **Frontend** (Pages Router) — User interface, layout composition, UX validation only
2. **API** (pages/api/v1/) — HTTP endpoints, request validation, error handling
3. **Infra** (infra/) — Shared utilities: authentication, sessions, password, errors, Prisma client
4. **Database** (Prisma) — Schema, migrations, data persistence
5. **Tests** — Integration tests using orchestrator helpers and fetch()

Each layer has a clear responsibility. Don't mix concerns.

---

## Key Files Reference

- [src/infra/authentication.js](src/infra/authentication.js) — User credential validation
- [src/infra/session.js](src/infra/session.js) — Session lifecycle
- [src/infra/password.js](src/infra/password.js) — Password hashing
- [src/infra/errors.js](src/infra/errors.js) — Error classes
- [src/infra/controller.js](src/infra/controller.js) — Error handler middleware
- [src/infra/prisma.js](src/infra/prisma.js) — PrismaClient singleton
- [prisma/schema.prisma](prisma/schema.prisma) — Database schema
- [src/pages/api/v1/sessions/index.js](src/pages/api/v1/sessions/index.js) — Login/logout example
- [src/pages/api/v1/user/index.js](src/pages/api/v1/user/index.js) — Protected endpoint example
- [src/tests/orchestrator/orchestrator.mjs](src/tests/orchestrator/orchestrator.mjs) — Test helpers
