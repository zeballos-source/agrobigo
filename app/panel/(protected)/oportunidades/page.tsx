import { prisma } from "@/lib/prisma";
import OportunidadesBoard from "@/components/OportunidadesBoard";

export default async function OportunidadesPage() {
  const opportunities = await prisma.opportunity.findMany({
    orderBy: { createdAt: "desc" },
    include: { contact: true, product: { select: { title: true } } },
  });

  const serializable = opportunities.map((o) => ({
    id: o.id,
    stage: o.stage,
    createdAt: o.createdAt.toISOString(),
    notes: o.notes,
    contact: { name: o.contact.name, phone: o.contact.phone },
    product: o.product,
  }));

  return (
    <div>
      <div className="panel-topbar">
        <h1 style={{ fontFamily: "var(--disp)", textTransform: "uppercase", margin: 0 }}>Oportunidades</h1>
      </div>
      <p style={{ fontSize: 13, color: "var(--steel-700)", marginTop: -12, marginBottom: 24 }}>
        Arrastrá las tarjetas entre columnas para actualizar el estado.
      </p>
      <OportunidadesBoard initial={serializable} />
    </div>
  );
}
