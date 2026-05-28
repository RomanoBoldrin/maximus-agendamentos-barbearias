import { createRouter } from "next-connect";

import controller from "@/infra/controller";
import { prisma as db } from "@/infra/prisma.js";

import { ValidationError } from "@/infra/errors";
import authentication from "@/infra/authentication.js";
import authorization from "@/infra/authorization.js";
import passwordUtils from "@/infra/password.js";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const barbers = await db.barber.findMany({
    where: {
      isActive: true,
    },
    select: {
      barberId: true,
      barberName: true,
      phoneNumber: true,
      workStart: true,
      workEnd: true,
      lunchStart: true,
      lunchEnd: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return response.status(200).json(
    barbers.map((barber) => ({
      barber_id: barber.barberId,
      barber_name: barber.barberName,
      phone_number: barber.phoneNumber,
      work_start: barber.workStart,
      work_end: barber.workEnd,
      lunch_start: barber.lunchStart,
      lunch_end: barber.lunchEnd,
      is_active: barber.isActive,
      created_at: barber.createdAt.toISOString(),
      updated_at: barber.updatedAt.toISOString(),
    })),
  );
}

function isValidTimeFormat(timeString) {
  if (!timeString) return true;
  return /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(timeString);
}

async function postHandler(request, response) {
  const { user } =
    await authentication.getAuthenticatedUserFromRequest(request);
  authorization.ensureAdmin(user);

  const {
    barber_name,
    username,
    email,
    password,
    phone_number,
    work_start,
    work_end,
    lunch_start,
    lunch_end,
  } = request.body;

  if (
    !barber_name ||
    typeof barber_name !== "string" ||
    barber_name.trim() === ""
  ) {
    throw new ValidationError({
      message: "O nome do barbeiro é obrigatório.",
      action: "Forneça o nome do barbeiro.",
    });
  }

  if (!username || typeof username !== "string" || username.trim() === "") {
    throw new ValidationError({
      message: "O nome de usuário é obrigatório.",
      action: "Forneça um nome de usuário.",
    });
  }

  if (!email || typeof email !== "string" || email.trim() === "") {
    throw new ValidationError({
      message: "O e-mail é obrigatório.",
      action: "Forneça um e-mail válido.",
    });
  }

  if (!password || typeof password !== "string" || password === "") {
    throw new ValidationError({
      message: "A senha é obrigatória.",
      action: "Forneça uma senha.",
    });
  }

  if (
    !isValidTimeFormat(work_start) ||
    !isValidTimeFormat(work_end) ||
    !isValidTimeFormat(lunch_start) ||
    !isValidTimeFormat(lunch_end)
  ) {
    throw new ValidationError({
      message: "Formato de hora inválido.",
      action: "Forneça os horários no formato HH:mm.",
    });
  }

  if ((work_start && !work_end) || (!work_start && work_end)) {
    throw new ValidationError({
      message: "É necessário fornecer o início e o fim do expediente.",
      action: "Preencha os dois campos do expediente.",
    });
  }

  if ((lunch_start && !lunch_end) || (!lunch_start && lunch_end)) {
    throw new ValidationError({
      message: "É necessário fornecer o início e o fim do horário de almoço.",
      action: "Preencha os dois campos do horário de almoço.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await passwordUtils.hash(password);

  try {
    const { createdBarber, createdUser } = await db.$transaction(async (tx) => {
      const newBarber = await tx.barber.create({
        data: {
          barberName: barber_name.trim(),
          phoneNumber: phone_number || null,
          workStart: work_start || null,
          workEnd: work_end || null,
          lunchStart: lunch_start || null,
          lunchEnd: lunch_end || null,
        },
        select: {
          barberId: true,
          barberName: true,
          phoneNumber: true,
          workStart: true,
          workEnd: true,
          lunchStart: true,
          lunchEnd: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const newUser = await tx.user.create({
        data: {
          username: username.trim(),
          email: normalizedEmail,
          passwordHash,
          accessLevel: "barber",
          linkedBarberId: newBarber.barberId,
        },
        select: {
          userId: true,
          username: true,
          email: true,
          accessLevel: true,
          linkedBarberId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return { createdBarber: newBarber, createdUser: newUser };
    });

    return response.status(201).json({
      barber: {
        barber_id: createdBarber.barberId,
        barber_name: createdBarber.barberName,
        phone_number: createdBarber.phoneNumber,
        work_start: createdBarber.workStart,
        work_end: createdBarber.workEnd,
        lunch_start: createdBarber.lunchStart,
        lunch_end: createdBarber.lunchEnd,
        is_active: createdBarber.isActive,
        created_at: createdBarber.createdAt.toISOString(),
        updated_at: createdBarber.updatedAt.toISOString(),
      },
      user: {
        user_id: createdUser.userId,
        username: createdUser.username,
        email: createdUser.email,
        access_level: createdUser.accessLevel,
        linked_barber_id: createdUser.linkedBarberId,
        is_active: createdUser.isActive,
        created_at: createdUser.createdAt.toISOString(),
        updated_at: createdUser.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new ValidationError({
        message: "The username or email informed is already being used.",
        action: "Choose a different username or email.",
      });
    }
    throw error;
  }
}
