import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { verifySessionToken } from "./session";
import { prisma } from "./prisma";

async function resolveUser(token: string) {
  const parsed = verifySessionToken(token);
  if (!parsed) return null;
  const user = await prisma.user.findFirst({ where: { id: parsed.userId, active: true } });
  return user;
}

/** Para Server Components: redirige a /panel/login si no hay sesión válida. */
export async function requirePanelSession() {
  const token = cookies().get("panel_session")?.value;
  const user = token ? await resolveUser(token) : null;
  if (!user) redirect("/panel/login");
  return user;
}

/** Igual, pero exige rol ADMIN — para /panel/sucursales y /panel/equipo. */
export async function requireAdminSession() {
  const user = await requirePanelSession();
  if (user.role !== "ADMIN") redirect("/panel");
  return user;
}

/** Para Route Handlers: devuelve null en vez de redirigir. */
export async function getAuthedUserFromRequest(req: NextRequest) {
  const token = req.cookies.get("panel_session")?.value;
  return token ? await resolveUser(token) : null;
}
