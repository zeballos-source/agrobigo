import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAuthedUserFromRequest } from "@/lib/panel-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAuthedUserFromRequest(req);
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  if (typeof body.password === "string") {
    if (target.role === "ADMIN") {
      return NextResponse.json({ error: "La contraseña del admin no se puede cambiar desde acá." }, { status: 403 });
    }
    if (body.password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: params.id },
      data: { passwordHash: await bcrypt.hash(body.password, 10) },
    });
    return NextResponse.json({ ok: true });
  }

  if (typeof body.active === "boolean") {
    if (target.role === "ADMIN") {
      return NextResponse.json({ error: "El admin no se puede desactivar desde acá." }, { status: 403 });
    }
    await prisma.user.update({ where: { id: params.id }, data: { active: body.active } });
  }

  return NextResponse.json({ ok: true });
}
