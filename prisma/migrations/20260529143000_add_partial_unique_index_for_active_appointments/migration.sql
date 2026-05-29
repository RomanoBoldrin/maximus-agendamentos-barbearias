-- This migration replaces the broad unique constraint on
-- (barber_id, appointment_datetime) with a PostgreSQL partial unique index.
--
-- Old behavior:
-- A barber could not have another appointment at the same datetime,
-- even if the previous appointment was CANCELADO, CONCLUIDO, or FALTOU.
--
-- New behavior:
-- A barber cannot have two appointments at the same datetime only when
-- the appointment is still AGENDADO.
-- 1. Remove the old Prisma-generated uniqueness rule.
-- Depending on the exact migration history, PostgreSQL may store it as a
-- constraint and/or an index. These defensive statements are safe for your
-- current phase because you said the databases can be reset.
ALTER TABLE "appointments"
DROP CONSTRAINT IF EXISTS "uqBarberDatetime";

ALTER TABLE "appointments"
DROP CONSTRAINT IF EXISTS "appointments_barber_id_appointment_datetime_key";

DROP INDEX IF EXISTS "uqBarberDatetime";

DROP INDEX IF EXISTS "appointments_barber_id_appointment_datetime_key";

-- 2. Create a normal non-unique index for lookup performance.
-- This matches the new Prisma schema:
-- @@index([barberId, appointmentDatetime], name: "idxAppointmentsBarberDatetime")
CREATE INDEX IF NOT EXISTS "idxAppointmentsBarberDatetime" ON "appointments" ("barber_id", "appointment_datetime");

-- 3. Create the real database-level business rule.
-- Only AGENDADO appointments block the barber/time slot.
-- CANCELADO, CONCLUIDO, and FALTOU remain visible as history,
-- but they no longer prevent a new appointment at the same datetime.
CREATE UNIQUE INDEX IF NOT EXISTS "appointments_barber_datetime_active_unique" ON "appointments" ("barber_id", "appointment_datetime")
WHERE
  "status" = 'AGENDADO';