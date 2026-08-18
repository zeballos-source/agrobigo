import { prisma } from "@/lib/prisma";
import NuevoContactoForm from "@/components/NuevoContactoForm";

export default async function ContactosPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
    include: { opportunities: { select: { stage: true } } },
  });

  return (
    <div>
      <div className="panel-topbar">
        <h1 style={{ fontFamily: "var(--disp)", textTransform: "uppercase", margin: 0 }}>Contactos</h1>
      </div>

      <NuevoContactoForm />

      <div className="panel-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Origen</th>
              <th>Oportunidades</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.phone ?? "—"}</td>
                <td>{c.source ?? "—"}</td>
                <td>{c.opportunities.length}</td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={4} style={{ color: "var(--steel-700)" }}>
                  Todavía no hay contactos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
