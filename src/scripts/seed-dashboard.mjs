import { prisma as db } from "../infra/prisma.js";
import password from "../infra/password.js";
import { faker } from "@faker-js/faker";

async function main() {
  console.log("Starting dashboard data provisioning...");

  // 1. Production safety
  if (process.env.NODE_ENV === "production") {
    if (process.env.ALLOW_DASHBOARD_SEED !== "true") {
      console.log(
        "Dashboard seed is not allowed in production. Set ALLOW_DASHBOARD_SEED=true to enable. Exiting successfully.",
      );
      return;
    }
    if (!process.env.SEED_BARBER_PASSWORD) {
      throw new Error(
        "Missing required SEED_BARBER_PASSWORD for production dashboard provisioning.",
      );
    }
  }

  // 2. Idempotency Check
  const existingUsers = await db.user.count({
    where: {
      username: {
        in: ["elias.barber", "julian.barber"],
      },
    },
  });

  const existingServicesCount = await db.service.count({
    where: {
      serviceName: {
        in: ["Corte de cabelo", "Barba", "Corte + barba", "Sobrancelha"],
      },
    },
  });

  if (existingUsers > 0 || existingServicesCount > 0) {
    console.log(
      "Dashboard data already exists (fully or partially). Exiting successfully.",
    );
    return;
  }

  // Password for barbers
  const rawPassword = process.env.SEED_BARBER_PASSWORD || "barber123";
  const passwordHash = await password.hash(rawPassword);

  // 3. Create Barbers & Users
  console.log("Creating barbers and users...");

  const barbersData = [
    {
      name: "João Guimarães Rosa",
      username: "guimaraesrosa",
      email: "guimaraesrosa@maximus.com",
    },
    {
      name: "Joaquim Maria Machado de Assis",
      username: "machadodeassis",
      email: "machadodeassis@maximus.com",
    },
  ];

  const createdBarbers = [];

  for (const barberData of barbersData) {
    const { newBarber, newUser } = await db.$transaction(async (tx) => {
      const newBarber = await tx.barber.create({
        data: {
          barberName: barberData.name,
          phoneNumber: faker.phone.number(),
          workStart: "08:00",
          workEnd: "18:00",
          lunchStart: "12:00",
          lunchEnd: "13:00",
          isActive: true,
        },
      });

      const newUser = await tx.user.create({
        data: {
          username: barberData.username,
          email: barberData.email,
          passwordHash: passwordHash,
          accessLevel: "barber",
          linkedBarberId: newBarber.barberId,
          isActive: true,
        },
      });

      return { newBarber, newUser };
    });

    createdBarbers.push(newBarber);
    console.log(
      `Created/reused barber user: ${newUser.username} (${newUser.email})`,
    );
  }

  console.log("Created 2 barbers and 2 barber users.");

  // 4. Create Services
  console.log("Creating services...");

  const servicesData = [
    { name: "Corte de cabelo", duration: 30, price: 40.0 },
    { name: "Barba", duration: 30, price: 30.0 },
    { name: "Corte + barba", duration: 60, price: 65.0 },
    { name: "Sobrancelha", duration: 15, price: 15.0 },
  ];

  const createdServices = [];

  for (const sData of servicesData) {
    const newService = await db.service.create({
      data: {
        serviceName: sData.name,
        serviceDescription: `Serviço de ${sData.name.toLowerCase()}`,
        duration: sData.duration,
        price: sData.price,
        isActive: true,
      },
    });
    createdServices.push(newService);
  }

  console.log("Created 4 services.");

  // 5. Create Appointments
  console.log("Creating appointments...");

  for (let i = 0; i < 5; i++) {
    const barber = createdBarbers[i % createdBarbers.length]; // alternate barbers

    // Pick some services (e.g., 1 service per appointment)
    const service1 = createdServices[i % createdServices.length];

    // Dates: 1 day in the future, at 09:00 + i hours
    const appointmentDate = new Date();
    appointmentDate.setDate(appointmentDate.getDate() + 1);
    appointmentDate.setHours(9 + i, 0, 0, 0);

    const totalDuration = service1.duration;
    const appointmentEndDatetime = new Date(
      appointmentDate.getTime() + totalDuration * 60 * 1000,
    );

    await db.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          clientName: faker.person.fullName(),
          clientPhone: faker.phone.number(),
          isActive: true,
        },
      });

      const appointment = await tx.appointment.create({
        data: {
          appointmentDatetime: appointmentDate,
          appointmentEndDatetime: appointmentEndDatetime,
          totalDuration: totalDuration,
          status: "AGENDADO",
          clientId: client.clientId,
          barberId: barber.barberId,
        },
      });

      await tx.appointmentService.create({
        data: {
          appointmentId: appointment.appointmentId,
          serviceId: service1.serviceId,
          servicePrice: service1.price,
          serviceDuration: service1.duration,
        },
      });
    });
  }

  console.log("Created 5 appointments.");
  console.log("Dashboard seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during dashboard provisioning:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
