import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const productId = typeof body.productId === "string" ? body.productId : null;

  if (!name || !phone) {
    return NextResponse.json({ error: "Nombre y teléfono son obligatorios." }, { status: 400 });
  }

  const contact = await prisma.contact.create({
    data: { name, phone, source: "web" },
  });

  await prisma.opportunity.create({
    data: {
      contactId: contact.id,
      productId: productId || undefined,
      stage: "NUEVO",
      notes: message || undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
