import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { status: "PUBLICADO" },
    include: { images: { orderBy: { order: "asc" }, take: 1 }, sucursal: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const totalPublicados = await prisma.product.count({ where: { status: "PUBLICADO" } });
  const highlight =
    (await prisma.product.findFirst({
      where: { status: "PUBLICADO", images: { some: {} } },
      include: { images: { orderBy: { order: "asc" }, take: 1 }, sucursal: true },
    })) ?? featured[0];

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
            <Link className="btn-primary" href="/catalogo">
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

      <SiteFooter />
    </>
  );
}
