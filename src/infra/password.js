import bcryptjs from "bcryptjs";

async function hash(password) {
  const rounds = getNumberOfRounds();

  return await bcryptjs.hash(password, rounds);
}

function getNumberOfRounds() {
  return Number(process.env.BCRYPT_ROUNDS || 14);
}

async function compare(providedPassword, storedPassword) {
  return await bcryptjs.compare(providedPassword, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
