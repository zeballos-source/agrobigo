import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ProductosPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { sucursal: true, images: { take: 1, orderBy: { order: "asc" } } },
  });

  return (
    <div>
      <div className="panel-topbar">
        <h1 style={{ fontFamily: "var(--disp)", textTransform: "uppercase", margin: 0 }}>Publicaciones</h1>
        <Link href="/panel/productos/nuevo" className="btn-primary">
          + Nueva publicación
        </Link>
      </div>

      <div className="panel-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Sucursal</th>
              <th>Precio</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.category}</td>
                <td>{p.sucursal.nombre}</td>
                <td>{p.price != null ? `${p.currency} ${p.price.toLocaleString("es-AR")}` : "Consultar"}</td>
                <td>
                  <span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span>
                </td>
                <td style={{ display: "flex", gap: 12 }}>
                  <Link href={`/panel/productos/${p.id}/editar`}>Editar</Link>
                  {p.status !== "BORRADOR" && (
                    <a href={`/catalogo/${p.id}`} target="_blank" rel="noopener">
                      Ver publicación ↗
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} style={{ color: "var(--steel-700)" }}>
                  Todavía no cargaste ninguna publicación.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
