-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('admin', 'barber');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('AGENDADO', 'CONCLUIDO', 'CANCELADO', 'FALTOU');

-- CreateTable
CREATE TABLE "clients" (
    "clientId" UUID NOT NULL,
    "clientName" VARCHAR(100) NOT NULL,
    "clientPhone" VARCHAR(30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("clientId")
);

-- CreateTable
CREATE TABLE "barbers" (
    "barberId" UUID NOT NULL,
    "barberName" VARCHAR(100) NOT NULL,
    "phoneNumber" VARCHAR(30),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barbers_pkey" PRIMARY KEY ("barberId")
);

-- CreateTable
CREATE TABLE "services" (
    "serviceId" UUID NOT NULL,
    "serviceName" VARCHAR(80) NOT NULL,
    "serviceDescription" VARCHAR(150),
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("serviceId")
);

-- CreateTable
CREATE TABLE "users" (
    "userId" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'barber',
    "linkedBarberId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "appointments" (
    "appointmentId" UUID NOT NULL,
    "appointmentDatetime" TIMESTAMP(3) NOT NULL,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'AGENDADO',
    "clientId" UUID NOT NULL,
    "barberId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("appointmentId")
);

-- CreateTable
CREATE TABLE "appointment_services" (
    "appointmentId" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "servicePrice" DECIMAL(10,2) NOT NULL,
    "serviceDuration" INTEGER NOT NULL,

    CONSTRAINT "appointment_services_pkey" PRIMARY KEY ("appointmentId","serviceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_linkedBarberId_key" ON "users"("linkedBarberId");

-- CreateIndex
CREATE INDEX "idxAppointmentsBarber" ON "appointments"("barberId");

-- CreateIndex
CREATE INDEX "idxAppointmentsClient" ON "appointments"("clientId");

-- CreateIndex
CREATE INDEX "idxAppointmentsDatetime" ON "appointments"("appointmentDatetime");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_barberId_appointmentDatetime_key" ON "appointments"("barberId", "appointmentDatetime");

-- CreateIndex
CREATE INDEX "idxAppointmentServicesService" ON "appointment_services"("serviceId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_linkedBarberId_fkey" FOREIGN KEY ("linkedBarberId") REFERENCES "barbers"("barberId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("clientId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "barbers"("barberId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_services" ADD CONSTRAINT "appointment_services_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("appointmentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_services" ADD CONSTRAINT "appointment_services_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("serviceId") ON DELETE RESTRICT ON UPDATE CASCADE;
