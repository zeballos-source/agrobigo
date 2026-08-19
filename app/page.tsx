import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { categoria?: string; sucursal?: string };
}) {
  const { categoria, sucursal } = searchParams;

  const [featured, totalPublicados, highlightRaw, productsRaw, sucursales] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLICADO" },
      include: { images: { orderBy: { order: "asc" }, take: 1 }, sucursal: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.product.count({ where: { status: "PUBLICADO" } }),
    prisma.product.findFirst({
      where: { status: "PUBLICADO", images: { some: {} } },
      include: { images: { orderBy: { order: "asc" }, take: 1 }, sucursal: true },
    }),
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

  const highlight = highlightRaw ?? featured[0];

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
    return (qs ? `/?${qs}` : "/") + "#catalogo";
  }

  return (
    <>
      <SiteHeader />

      <section className="hero">
        <div>
          <div className="eyebrow">Maquinaria · Repuestos · Asesoramiento</div>
          <h1>
            Seguimos creciendo <em>junto al productor.</em>
          </h1>
          <p>
            Concesionario oficial Agrochery y distribuidor de Impagro y Ascanelli. Entrega inmediata y financiación en
            Río Cuarto (Córdoba) y Santa Rosa de Conlara (San Luis).
          </p>
          <div className="hero-ctas">
            <Link className="btn-primary" href="/#catalogo">
              Ver catálogo
            </Link>
            <a className="btn-ghost" href="https://wa.me/5493584335761" target="_blank" rel="noopener">
              Escribinos
            </a>
          </div>
        </div>

        {highlight && (
          <Link href={`/catalogo/${highlight.id}`} className="hero-highlight">
            <div className="hh-media">
              <span className="hh-badge">{highlight.condition === "NUEVO" ? "Nuevo" : "Usado"}</span>
              {highlight.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={highlight.images[0].url} alt={highlight.title} />
              )}
            </div>
            <div className="hh-body">
              <div className="hh-cat">
                {highlight.category} · {highlight.sucursal.nombre}
              </div>
              <h3>{highlight.title}</h3>
              <div className="hh-price">
                {highlight.price != null ? `${highlight.currency} ${highlight.price.toLocaleString("es-AR")}` : "Consultar"}
              </div>
            </div>
          </Link>
        )}
      </section>

      <div className="furrow" />

      <section>
        <div className="section-head">
          <h2>Destacados</h2>
          <p>{totalPublicados} máquinas e implementos publicados hoy.</p>
        </div>
        <div className="grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <div className="furrow" />

      <section id="catalogo">
        <div className="section-head">
          <h2>Catálogo completo</h2>
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
