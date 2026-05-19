function getOrigin() {
  // Vercel (Preview or Production)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Local development / tests
  if (["test", "development"].includes(process.env.NODE_ENV)) {
    return "http://localhost:3000";
  }

  // Fallback
  return "https://maximus-agendamentos-barbearias.vercel.app";
}

const webserver = {
  origin: getOrigin(),
};

export default webserver;
