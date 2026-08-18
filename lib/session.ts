import crypto from "crypto";

// En producción, definí SESSION_SECRET en las variables de entorno con un
// valor largo y random. Si no está seteada, usa un fallback de desarrollo
// (no lo dejes así si vas a producción).
const SECRET = process.env.SESSION_SECRET || "dev-secret-cambiar-en-produccion";

function sign(payload: string) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function signUserSession(userId: string) {
  return `${userId}.${sign(userId)}`;
}

export function verifySessionToken(token: string | undefined | null): { userId: string } | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const userId = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(userId);
  if (sig.length !== expected.length) return null;
  const ok = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!ok) return null;
  if (!userId) return null;
  return { userId };
}
