import { NextRequest, NextResponse } from "next/server";
import { getAuthedUserFromRequest } from "@/lib/panel-auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getAuthedUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });

  const contact = await prisma.contact.create({
    data: {
      name,
      phone: typeof body.phone === "string" ? body.phone.trim() || null : null,
      email: typeof body.email === "string" ? body.email.trim() || null : null,
      source: "panel",
    },
  });

  await prisma.opportunity.create({
    data: {
      contactId: contact.id,
      productId: typeof body.productId === "string" && body.productId ? body.productId : undefined,
      assignedToId: user.id,
      stage: "NUEVO",
    },
  });

  return NextResponse.json({ id: contact.id });
}
