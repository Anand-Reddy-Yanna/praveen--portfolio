import cors from "cors";

function splitEnvList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getAllowedOrigins() {
  return splitEnvList(process.env.ALLOWED_ORIGINS ?? process.env.FRONTEND_URL);
}

export function buildCorsMiddleware() {
  const allowedOrigins = getAllowedOrigins();

  if (allowedOrigins.length === 0) {
    return cors({
      origin: true,
      credentials: true,
    });
  }

  return cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  });
}

export function isSecureCookieRequest() {
  return process.env.NODE_ENV === "production";
}
