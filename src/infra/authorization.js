import { ForbiddenError } from "@/infra/errors";

function isAdmin(user) {
  return user?.accessLevel === "admin";
}

function ensureAdmin(user) {
  if (isAdmin(user)) {
    return;
  }

  throw new ForbiddenError({
    message: "This action requires admin access.",
    action: "Contact an administrator.",
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
    action: "Verify if your user has access to this resource.",
  });
}

const authorization = {
  isAdmin,
  ensureAdmin,
  ensureOwnerOrAdmin,
};

export default authorization;
