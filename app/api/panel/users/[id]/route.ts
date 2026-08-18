import { NextRequest, NextResponse } from "next/server";
import { getAuthedUserFromRequest } from "@/lib/panel-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAuthedUserFromRequest(req);
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  await prisma.user.update({
    where: { id: params.id },
    data: { active: typeof body.active === "boolean" ? body.active : undefined },
  });

  return NextResponse.json({ ok: true });
}
