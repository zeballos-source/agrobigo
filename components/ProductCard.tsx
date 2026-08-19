import Link from "next/link";

type ProductCardData = {
  id: string;
  title: string;
  brand: string | null;
  category: string;
  condition: "NUEVO" | "USADO";
  year: number | null;
  price: number | null;
  currency: "ARS" | "USD";
  status: "BORRADOR" | "PUBLICADO" | "RESERVADO" | "VENDIDO";
  sucursal: { nombre: string };
  images: { url: string }[];
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const sold = product.status === "VENDIDO";
  const reserved = product.status === "RESERVADO";

  return (
    <Link href={`/catalogo/${product.id}`} className="card">
      <div className="card-media">
        <span className={`tag-cond ${product.condition === "USADO" ? "usado" : ""}`}>
          {product.condition === "USADO" ? "Usado" : "Nuevo"}
        </span>
        {(sold || reserved) && (
          <span className={`status-ribbon ${sold ? "sold" : "reserved"}`}>{sold ? "Vendido" : "Reservado"}</span>
        )}
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0].url} alt={product.title} style={sold ? { filter: "grayscale(60%)", opacity: 0.7 } : undefined} />
        ) : (
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--steel-700)" }}>Sin foto</span>
        )}
      </div>
      <div className="card-body">
        <h4>{product.title}</h4>
        <div className="meta">
          {[product.brand, product.year, product.sucursal.nombre].filter(Boolean).join(" · ")}
        </div>
        <div className="card-foot">
          <span className="price">
            {product.price != null ? `${product.currency} ${product.price.toLocaleString("es-AR")}` : "Consultar"}
          </span>
          <span className="mini-wsp">→</span>
        </div>
      </div>
    </Link>
  );
}
