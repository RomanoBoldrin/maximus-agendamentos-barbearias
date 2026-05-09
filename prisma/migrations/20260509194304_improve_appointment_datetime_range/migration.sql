/*
  Warnings:

  - The primary key for the `appointment_services` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `appointmentId` on the `appointment_services` table. All the data in the column will be lost.
  - You are about to drop the column `serviceDuration` on the `appointment_services` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `appointment_services` table. All the data in the column will be lost.
  - You are about to drop the column `servicePrice` on the `appointment_services` table. All the data in the column will be lost.
  - The primary key for the `appointments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `appointmentDatetime` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `appointmentId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `barberId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `totalDuration` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `appointments` table. All the data in the column will be lost.
  - The primary key for the `barbers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `barberId` on the `barbers` table. All the data in the column will be lost.
  - You are about to drop the column `barberName` on the `barbers` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `barbers` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `barbers` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `barbers` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `barbers` table. All the data in the column will be lost.
  - The primary key for the `clients` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `clientId` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `clientName` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `clientPhone` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `clients` table. All the data in the column will be lost.
  - The primary key for the `services` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `serviceDescription` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `serviceName` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `services` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accessLevel` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `linkedBarberId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[barber_id,appointment_datetime]` on the table `appointments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[linked_barber_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appointment_id` to the `appointment_services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_duration` to the `appointment_services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_id` to the `appointment_services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_price` to the `appointment_services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appointment_datetime` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appointment_end_datetime` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - The required column `appointment_id` was added to the `appointments` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `barber_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - The required column `barber_id` was added to the `barbers` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `barber_name` to the `barbers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `barbers` table without a default value. This is not possible if the table is not empty.
  - The required column `client_id` was added to the `clients` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `client_name` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `clients` table without a default value. This is not possible if the table is not empty.
  - The required column `service_id` was added to the `services` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `service_name` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - The required column `user_id` was added to the `users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "appointment_services" DROP CONSTRAINT "appointment_services_appointmentId_fkey";

-- DropForeignKey
ALTER TABLE "appointment_services" DROP CONSTRAINT "appointment_services_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_barberId_fkey";

-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_clientId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_linkedBarberId_fkey";

-- DropIndex
DROP INDEX "idxAppointmentServicesService";

-- DropIndex
DROP INDEX "appointments_barberId_appointmentDatetime_key";

-- DropIndex
DROP INDEX "idxAppointmentsBarber";

-- DropIndex
DROP INDEX "idxAppointmentsClient";

-- DropIndex
DROP INDEX "idxAppointmentsDatetime";

-- DropIndex
DROP INDEX "users_linkedBarberId_key";

-- AlterTable
ALTER TABLE "appointment_services" DROP CONSTRAINT "appointment_services_pkey",
DROP COLUMN "appointmentId",
DROP COLUMN "serviceDuration",
DROP COLUMN "serviceId",
DROP COLUMN "servicePrice",
ADD COLUMN     "appointment_id" UUID NOT NULL,
ADD COLUMN     "service_duration" INTEGER NOT NULL,
ADD COLUMN     "service_id" UUID NOT NULL,
ADD COLUMN     "service_price" DECIMAL(10,2) NOT NULL,
ADD CONSTRAINT "appointment_services_pkey" PRIMARY KEY ("appointment_id", "service_id");

-- AlterTable
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_pkey",
DROP COLUMN "appointmentDatetime",
DROP COLUMN "appointmentId",
DROP COLUMN "barberId",
DROP COLUMN "clientId",
DROP COLUMN "createdAt",
DROP COLUMN "totalDuration",
DROP COLUMN "updatedAt",
ADD COLUMN     "appointment_datetime" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "appointment_end_datetime" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "appointment_id" UUID NOT NULL,
ADD COLUMN     "barber_id" UUID NOT NULL,
ADD COLUMN     "client_id" UUID NOT NULL,
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "total_duration" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL,
ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("appointment_id");

-- AlterTable
ALTER TABLE "barbers" DROP CONSTRAINT "barbers_pkey",
DROP COLUMN "barberId",
DROP COLUMN "barberName",
DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "phoneNumber",
DROP COLUMN "updatedAt",
ADD COLUMN     "barber_id" UUID NOT NULL,
ADD COLUMN     "barber_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lunch_end" VARCHAR(5),
ADD COLUMN     "lunch_start" VARCHAR(5),
ADD COLUMN     "phone_number" VARCHAR(30),
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "work_end" VARCHAR(5),
ADD COLUMN     "work_start" VARCHAR(5),
ADD CONSTRAINT "barbers_pkey" PRIMARY KEY ("barber_id");

-- AlterTable
ALTER TABLE "clients" DROP CONSTRAINT "clients_pkey",
DROP COLUMN "clientId",
DROP COLUMN "clientName",
DROP COLUMN "clientPhone",
DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "updatedAt",
ADD COLUMN     "client_id" UUID NOT NULL,
ADD COLUMN     "client_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "client_phone" VARCHAR(30),
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL,
ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("client_id");

-- AlterTable
ALTER TABLE "services" DROP CONSTRAINT "services_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "serviceDescription",
DROP COLUMN "serviceId",
DROP COLUMN "serviceName",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "service_description" VARCHAR(150),
ADD COLUMN     "service_id" UUID NOT NULL,
ADD COLUMN     "service_name" VARCHAR(80) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL,
ADD CONSTRAINT "services_pkey" PRIMARY KEY ("service_id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "accessLevel",
DROP COLUMN "createdAt",
DROP COLUMN "isActive",
DROP COLUMN "linkedBarberId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "access_level" "AccessLevel" NOT NULL DEFAULT 'barber',
ADD COLUMN     "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "linked_barber_id" UUID,
ADD COLUMN     "updated_at" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");

-- CreateIndex
CREATE INDEX "idxAppointmentServicesService" ON "appointment_services"("service_id");

-- CreateIndex
CREATE INDEX "idxAppointmentsClient" ON "appointments"("client_id");

-- CreateIndex
CREATE INDEX "idxAppointmentsDatetime" ON "appointments"("appointment_datetime");

-- CreateIndex
CREATE INDEX "idxAppointmentsBarberStatusDatetime" ON "appointments"("barber_id", "status", "appointment_datetime");

-- CreateIndex
CREATE INDEX "idxAppointmentsBarberStatusRange" ON "appointments"("barber_id", "status", "appointment_datetime", "appointment_end_datetime");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_barber_id_appointment_datetime_key" ON "appointments"("barber_id", "appointment_datetime");

-- CreateIndex
CREATE UNIQUE INDEX "users_linked_barber_id_key" ON "users"("linked_barber_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_linked_barber_id_fkey" FOREIGN KEY ("linked_barber_id") REFERENCES "barbers"("barber_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("client_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_barber_id_fkey" FOREIGN KEY ("barber_id") REFERENCES "barbers"("barber_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_services" ADD CONSTRAINT "appointment_services_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("appointment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_services" ADD CONSTRAINT "appointment_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("service_id") ON DELETE RESTRICT ON UPDATE CASCADE;
