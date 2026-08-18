import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAuthedUserFromRequest } from "@/lib/panel-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const admin = await getAuthedUserFromRequest(req);
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role === "ADMIN" ? "ADMIN" : "AGENTE";

  if (!email || !name || password.length < 8) {
    return NextResponse.json({ error: "Faltan datos o la contraseña tiene menos de 8 caracteres." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Ya existe un usuario con ese email." }, { status: 409 });

  await prisma.user.create({
    data: { email, name, role, passwordHash: await bcrypt.hash(password, 10) },
  });

  return NextResponse.json({ ok: true });
}
