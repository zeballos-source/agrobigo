import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [total, publicados, borradores, oportunidadesAbiertas, ultimos] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "PUBLICADO" } }),
    prisma.product.count({ where: { status: "BORRADOR" } }),
    prisma.opportunity.count({ where: { stage: { notIn: ["CERRADO_GANADO", "CERRADO_PERDIDO"] } } }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { sucursal: true } }),
  ]);

  return (
    <div>
      <div className="panel-topbar">
        <h1 style={{ fontFamily: "var(--disp)", textTransform: "uppercase", margin: 0 }}>Dashboard</h1>
        <Link href="/panel/productos/nuevo" className="btn-primary">
          + Publicación rápida
        </Link>
      </div>

      <div className="stat-tiles">
        <div className="stat-tile">
          <b>{total}</b>
          <span>Productos totales</span>
        </div>
        <div className="stat-tile">
          <b>{publicados}</b>
          <span>Publicados</span>
        </div>
        <div className="stat-tile">
          <b>{borradores}</b>
          <span>Borradores</span>
        </div>
        <div className="stat-tile">
          <b>{oportunidadesAbiertas}</b>
          <span>Oportunidades abiertas</span>
        </div>
      </div>

      <div className="panel-card">
        <h3 style={{ marginTop: 0, fontFamily: "var(--disp)", textTransform: "uppercase" }}>Últimos cargados</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Sucursal</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ultimos.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.sucursal.nombre}</td>
                <td>
                  <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                </td>
                <td>
                  <Link href={`/panel/productos/${p.id}/editar`}>Editar</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
