import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: { categoria?: string; sucursal?: string };
}) {
  const { categoria, sucursal } = searchParams;

  const [productsRaw, sucursales] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: { in: ["PUBLICADO", "RESERVADO", "VENDIDO"] },
        ...(categoria ? { category: categoria } : {}),
        ...(sucursal ? { sucursalId: sucursal } : {}),
      },
      include: { images: { orderBy: { order: "asc" }, take: 1 }, sucursal: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sucursal.findMany(),
  ]);

  // Disponibles primero, reservados después, vendidos al final.
  const statusOrder = { PUBLICADO: 0, RESERVADO: 1, VENDIDO: 2, BORRADOR: 3 };
  const products = [...productsRaw].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  function filterHref(next: { categoria?: string; sucursal?: string }) {
    const params = new URLSearchParams();
    const c = next.categoria !== undefined ? next.categoria : categoria;
    const s = next.sucursal !== undefined ? next.sucursal : sucursal;
    if (c) params.set("categoria", c);
    if (s) params.set("sucursal", s);
    const qs = params.toString();
    return qs ? `/catalogo?${qs}` : "/catalogo";
  }

  return (
    <>
      <SiteHeader />

      <section>
        <div className="section-head">
          <h2>Catálogo</h2>
          <p>Filtrá por categoría o sucursal.</p>
        </div>

        <div className="filters">
          <Link href={filterHref({ categoria: "" })} className={`chip ${!categoria ? "active" : ""}`}>
            Todas
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.value}
              href={filterHref({ categoria: c.value })}
              className={`chip ${categoria === c.value ? "active" : ""}`}
            >
              {c.value}
            </Link>
          ))}
        </div>

        <div className="filters">
          <Link href={filterHref({ sucursal: "" })} className={`chip ${!sucursal ? "active" : ""}`}>
            Ambas sucursales
          </Link>
          {sucursales.map((s) => (
            <Link
              key={s.id}
              href={filterHref({ sucursal: s.id })}
              className={`chip ${sucursal === s.id ? "active" : ""}`}
            >
              {s.nombre}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p style={{ color: "var(--steel-700)" }}>No hay productos publicados con ese filtro.</p>
        ) : (
          <div className="grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </>
  );
}
