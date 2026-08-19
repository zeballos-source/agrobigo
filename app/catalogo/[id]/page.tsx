import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { productWhatsappLink } from "@/lib/whatsapp";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PublicContactForm from "@/components/PublicContactForm";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { order: "asc" } }, sucursal: true },
  });

  if (!product || product.status === "BORRADOR") return notFound();

  const waLink = productWhatsappLink(product, product.sucursal);
  const sold = product.status === "VENDIDO";
  const reserved = product.status === "RESERVADO";

  return (
    <>
      <SiteHeader />

      <section>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--steel-700)",
            marginBottom: 20,
          }}
        >
          ‹ Volver a la página principal
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40 }}>
          <div>
            <div
              style={{
                aspectRatio: "4 / 3",
                background: "var(--steel-100)",
                borderRadius: 8,
                overflow: "hidden",
                marginBottom: 12,
              }}
            >
              {product.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0].url}
                  alt={product.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
            {product.images.length > 1 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.images.slice(1).map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.id}
                    src={img.url}
                    alt=""
                    style={{ width: 88, height: 88, objectFit: "cover", borderRadius: 6, border: "1px solid var(--line)" }}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="eyebrow">
              {product.category} {product.brand ? `· ${product.brand}` : ""}
            </div>
            <h1 style={{ fontFamily: "var(--disp)", fontSize: 34, textTransform: "uppercase", margin: "0 0 10px" }}>
              {product.title}
            </h1>

            {(sold || reserved) && (
              <div
                style={{
                  display: "inline-block",
                  background: sold ? "var(--rust-dark)" : "var(--wheat)",
                  color: sold ? "#fff" : "var(--steel-900)",
                  fontWeight: 800,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  padding: "5px 12px",
                  borderRadius: 3,
                  marginBottom: 14,
                }}
              >
                {sold ? "Vendido" : "Reservado"}
              </div>
            )}
            <div
              style={{
                fontFamily: "var(--disp)",
                fontSize: 28,
                fontWeight: 800,
                color: "var(--rust-dark)",
                marginBottom: 16,
              }}
            >
              {product.price != null ? `${product.currency} ${product.price.toLocaleString("es-AR")}` : "Consultar precio"}
            </div>

            <div className="panel-card" style={{ marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontFamily: "var(--mono)", fontSize: 13 }}>
                <div>Condición: <b>{product.condition === "NUEVO" ? "Nuevo" : "Usado"}</b></div>
                {product.model && <div>Modelo: <b>{product.model}</b></div>}
                {product.year && <div>Año: <b>{product.year}</b></div>}
                <div>Sucursal: <b>{product.sucursal.nombre}</b></div>
              </div>
            </div>

            {product.description && (
              <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--steel-700)", marginBottom: 24 }}>
                {product.description}
              </p>
            )}

            {sold ? (
              <p style={{ fontSize: 14, color: "var(--steel-700)" }}>
                Esta unidad ya se vendió — escribinos si te interesa una similar.
              </p>
            ) : (
              <>
                {reserved && (
                  <p style={{ fontSize: 13, color: "var(--steel-700)", marginBottom: 10 }}>
                    Tiene una reserva en curso — consultá por si se libera o por unidades similares.
                  </p>
                )}
                <a className="btn-primary" href={waLink} target="_blank" rel="noopener" style={{ background: "var(--monte)" }}>
                  💬 Consultar por WhatsApp
                </a>
              </>
            )}

            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 13, color: "var(--steel-700)", margin: "0 0 4px" }}>
                ¿Preferís que te llamemos nosotros?
              </p>
              <PublicContactForm productId={product.id} />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
