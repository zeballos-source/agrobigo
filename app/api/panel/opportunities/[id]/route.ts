import { NextRequest, NextResponse } from "next/server";
import { getAuthedUserFromRequest } from "@/lib/panel-auth";
import { prisma } from "@/lib/prisma";

const STAGES = ["NUEVO", "COTIZANDO", "VISITA_AGENDADA", "CERRADO_GANADO", "CERRADO_PERDIDO"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthedUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  if (body.stage && !STAGES.includes(body.stage)) {
    return NextResponse.json({ error: "Etapa inválida." }, { status: 400 });
  }

  await prisma.opportunity.update({
    where: { id: params.id },
    data: {
      stage: body.stage ?? undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
