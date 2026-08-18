import { NextRequest, NextResponse } from "next/server";
import { getAuthedUserFromRequest } from "@/lib/panel-auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthedUserFromRequest(req);
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  await prisma.sucursal.update({
    where: { id: params.id },
    data: {
      nombre: typeof body.nombre === "string" ? body.nombre : undefined,
      provincia: typeof body.provincia === "string" ? body.provincia : undefined,
      direccion: typeof body.direccion === "string" ? body.direccion : undefined,
      latitude: typeof body.latitude === "number" ? body.latitude : undefined,
      longitude: typeof body.longitude === "number" ? body.longitude : undefined,
      telefonoVentas: typeof body.telefonoVentas === "string" ? body.telefonoVentas : undefined,
      telefonoRepuestos: typeof body.telefonoRepuestos === "string" ? body.telefonoRepuestos : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
