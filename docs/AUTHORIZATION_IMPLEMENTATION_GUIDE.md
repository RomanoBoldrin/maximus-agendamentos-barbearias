# Authorization Implementation Guide

## Project context

This project is a barbershop appointment system built with:

- Next.js Pages Router (`src/pages`)
- JavaScript
- Prisma ORM
- PostgreSQL
- Session-based authentication using database-backed sessions
- API routes under `src/pages/api/v1/...`

Authentication is already mostly implemented through:

- `src/infra/authentication.js`
- `src/infra/session.js`
- `src/pages/api/v1/sessions/index.js`
- `src/pages/api/v1/user/index.js`

The next step is to implement authorization.

Authorization must answer:

> The user is authenticated, but is this user allowed to perform this action?

---

## User categories

### Admin

Admins have full access.

Rules:

- Admin can access every authenticated feature.
- Admin can manage users, barbers, services, appointments, and clients.
- Admin bypasses ownership checks.

In Prisma, this is represented by:

```prisma
enum AccessLevel {
  admin
  barber
}
```

### Barber

Barbers are authenticated users with limited permissions.

Rules:

- Barbers can access dashboard features intended for them.
- Barbers can only access or modify resources related to their own barber profile.
- Ownership is determined through `User.linkedBarberId`.

Example:

```js
user.linkedBarberId === appointment.barberId;
```

### Client

Clients do not log in.

Rules:

- Clients only access public features.
- Public features include the appointment maker page `src/pages/appointment/emperor-barbershop.jsx` and appointment summary `src/pages/appointment/summary.jsx`.
- Client-facing routes should not require authentication unless explicitly changed later.

---

## Authorization strategy

Use a simple hybrid model:

```txt
Role-based permissions
+
Resource ownership checks
```

Do not create database permission tables yet.

This project only has two authenticated roles (`admin` and `barber`), so static permissions in code are simpler, clearer, and easier to test.

---

## Recommended authorization flow

For protected API routes:

```txt
1. Request arrives.

2. Is the route public?
   - yes → allow without authentication.
   - no → require authenticated user.

3. Is the authenticated user admin?
   - yes → allow.

4. Does the user have permission for this feature/action?
   - no → throw ForbiddenError.

5. If this is a resource-specific action, does the user own the resource?
   - yes → allow.
   - no → throw ForbiddenError.
```

Admin should be checked early because admin has global access.

---

## New file to create

Create:

```txt
src/infra/authorization.js
```

This file should contain authorization-only logic.

Do not put authorization logic directly inside API routes unless it is very small and endpoint-specific.

---

## Recommended `authorization.js` responsibilities

The file should export an object like:

```js
const authorization = {
  isAdmin,
  hasPermission,
  ensurePermission,
  ensureOwnerOrAdmin,
};

export default authorization;
```

### Required functions

#### `isAdmin(user)`

Returns `true` if:

```js
user.accessLevel === "admin";
```

#### `hasPermission(user, permission)`

Returns whether a user has a specific permission.

Admin should always return `true`.

#### `ensurePermission(user, permission)`

Throws `ForbiddenError` if the user does not have permission.

#### `ensureOwnerOrAdmin(user, resourceOwnerBarberId)`

Allows access when:

```js
user.accessLevel === "admin";
```

or:

```js
user.linkedBarberId === resourceOwnerBarberId;
```

Otherwise throws `ForbiddenError`.

---

## Suggested initial permissions

Start small. Do not create too many permissions upfront.

Recommended map:

```js
const permissions = {
  admin: ["*"],

  barber: [
    "dashboard:read",
    "appointments:read-own",
    "appointments:update-own",
    "barbers:read-own",
    "services:read",
  ],
};
```

Add new permissions only when an endpoint actually needs them.

---

## Suggested implementation for `authorization.js`

```js
import { ForbiddenError } from "@/infra/errors";

const permissions = {
  admin: ["*"],

  barber: [
    "dashboard:read",
    "appointments:read-own",
    "appointments:update-own",
    "barbers:read-own",
    "services:read",
  ],
};

function isAdmin(user) {
  return user?.accessLevel === "admin";
}

function hasPermission(user, permission) {
  if (!user) {
    return false;
  }

  if (isAdmin(user)) {
    return true;
  }

  const userPermissions = permissions[user.accessLevel] || [];

  return userPermissions.includes(permission);
}

function ensurePermission(user, permission) {
  if (hasPermission(user, permission)) {
    return;
  }

  throw new ForbiddenError({
    message: "You do not have permission to access this feature.",
    action: "Contact an administrator if you believe this access is required.",
  });
}

function ensureOwnerOrAdmin(user, resourceOwnerBarberId) {
  if (isAdmin(user)) {
    return;
  }

  if (user?.linkedBarberId && user.linkedBarberId === resourceOwnerBarberId) {
    return;
  }

  throw new ForbiddenError({
    message: "You do not have permission to access this resource.",
    action: "Verify if this resource belongs to your user.",
  });
}

function ensureAdmin(user) {
  if (isAdmin(user)) {
    return;
  }

  throw new ForbiddenError({
    message: "Only administrators can perform this action.",
    action: "Login with an administrator account.",
  });
}

const authorization = {
  isAdmin,
  hasPermission,
  ensurePermission,
  ensureOwnerOrAdmin,
  ensureAdmin,
};

export default authorization;
```

---

## Authentication helper needed

The project already has session lookup logic in:

```txt
src/pages/api/v1/user/index.js
```

That logic should eventually be reused by protected endpoints.

Recommended future refactor:

```js
authentication.getAuthenticatedUserFromRequest(request);
```

or:

```js
session.getAuthenticatedUserFromRequest(request);
```

This helper should:

1. Read `session_id` cookie.
2. Validate the session.
3. Find the user.
4. Return the authenticated user.
5. Throw `UnauthorizedError` if the session is missing, invalid, or expired.

This prevents repeating cookie/session/user lookup in every endpoint.

---

## Endpoint protection examples

### Admin-only endpoint

For endpoints like:

```txt
PATCH /api/v1/users/[username]
POST /api/v1/users
```

Use:

```js
const authenticatedUser =
  await authentication.getAuthenticatedUserFromRequest(request);

authorization.ensureAdmin(authenticatedUser);
```

or, if using named permissions:

```js
authorization.ensurePermission(authenticatedUser, "users:update");
```

### Barber-owned appointment

For an endpoint like:

```txt
PATCH /api/v1/appointments/[appointmentId]
```

Suggested flow:

```js
const authenticatedUser = await authentication.getAuthenticatedUserFromRequest(request);

authorization.ensurePermission(authenticatedUser, "appointments:update-own");

const appointment = await prisma.appointment.findUnique({
  where: { appointmentId },
  select: {
    appointmentId: true,
    barberId: true,
  },
});

if (!appointment) {
  throw new NotFoundError(...);
}

authorization.ensureOwnerOrAdmin(authenticatedUser, appointment.barberId);
```

Admin passes automatically. Barber only passes if the appointment belongs to their linked barber profile.

---

## Ownership rules

### Appointment ownership

A barber owns an appointment when:

```js
user.linkedBarberId === appointment.barberId;
```

### Barber ownership

A barber owns a barber profile when:

```js
user.linkedBarberId === barber.barberId;
```

### Service ownership

Services are barbershop-level resources.

Recommended rule for now:

```txt
admin → create/update/delete services
barber → read services
public/client → read active services for booking flow
```

### Client ownership

Clients are not authenticated users in the current model.

Recommended rule for now:

```txt
admin → manage clients
barber → maybe read clients connected to own appointments later
public/client → no direct client management
```

Do not overbuild this yet.

---

## Public routes

These should remain unauthenticated:

```txt
Appointment maker page
Appointment summary page
Public service listing
Public barber listing
Public appointment creation, if that is part of the booking flow
```

Public appointment creation should still validate business rules, such as:

- barber exists
- service exists
- appointment is not in the past
- no overlapping appointments
- appointment is inside working hours

Authentication is not required for public booking.

---

## Backend-first authorization

Frontend access control is useful for UX, but it is not security.

The API must enforce authorization.

Example:

- Hide admin buttons in React.
- Also protect the corresponding API endpoint.

Never rely only on frontend checks.

---

## Recommended implementation order

### Step 1

Create:

```txt
src/infra/authorization.js
```

with:

- `isAdmin`
- `hasPermission`
- `ensurePermission`
- `ensureOwnerOrAdmin`
- optionally `ensureAdmin`

### Step 2

Add or refactor a reusable authenticated user helper.

Suggested name:

```js
authentication.getAuthenticatedUserFromRequest(request);
```

or:

```js
session.getAuthenticatedUserFromRequest(request);
```

Prefer keeping identity/session logic outside API route files.

### Step 3

Protect one simple endpoint first.

Recommended first endpoint:

```txt
PATCH /api/v1/users/[username]
```

Make it admin-only.

### Step 4

Add tests for the protected endpoint.

Test cases:

```txt
anonymous user → 401 UnauthorizedError
barber user → 403 ForbiddenError
admin user → allowed
```

### Step 5

Protect a resource-owned endpoint later.

Recommended resource-owned feature:

```txt
appointments
```

Test cases:

```txt
barber accessing own appointment → allowed
barber accessing another barber appointment → 403
admin accessing any appointment → allowed
```

---

## Error behavior

Use existing error classes from:

```txt
src/infra/errors.js
```

Expected mapping:

```txt
Missing/invalid session → UnauthorizedError → 401
Authenticated but not allowed → ForbiddenError → 403
Resource does not exist → NotFoundError → 404
Invalid input → ValidationError → 400
```

Do not use `UnauthorizedError` for permission failures. Use `ForbiddenError`.

Difference:

```txt
401 Unauthorized → user is not authenticated
403 Forbidden    → user is authenticated but not allowed
```

---

## Testing guidance

Use the orchestrator for setup.

Recommended helper additions, if not already present:

```js
orchestrator.createUser({
  accessLevel: "admin",
});

orchestrator.createUser({
  accessLevel: "barber",
  linkedBarberId: barber.barberId,
});

orchestrator.createSession(user.userId);
```

When testing protected endpoints:

1. Create user.
2. Create session.
3. Send cookie:

```js
headers: {
  Cookie: `session_id=${sessionObject.token}`,
}
```

Use direct Prisma/orchestrator setup for resources. Only use HTTP `fetch()` for the endpoint under test.

---

## Important security notes

- Do not expose `passwordHash`.
- Do not return raw session tokens in JSON.
- Session tokens should only be sent through `HttpOnly` cookies.
- Use `ForbiddenError` for authorization failures.
- Protected endpoints should disable caching when response/session renewal depends on request state.

Recommended header for user/session-dependent GET endpoints:

```js
response.setHeader(
  "Cache-Control",
  "no-store, no-cache, must-revalidate, proxy-revalidate",
);
response.setHeader("Pragma", "no-cache");
response.setHeader("Expires", "0");
```

---

## Final expected architecture

```txt
src/infra/authentication.js
  → identify user / validate credentials / maybe get authenticated user from request

src/infra/session.js
  → create, find, renew, expire sessions

src/infra/authorization.js
  → permissions and ownership checks

src/pages/api/v1/...
  → HTTP request/response, validation, calls infra/services
```

The goal is simple and robust authorization, not enterprise-level permission complexity.
