import Link from "next/link";

export default function SiteHeader() {
  return (
    <header>
      <div className="nav">
        <div className="wordmark">
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="Agro Bigo S.R.L." style={{ height: 68, borderRadius: 3 }} />
          </Link>
          <span className="loc-tag">Río Cuarto · Sta. Rosa de Conlara</span>
        </div>
        <div className="nav-links">
          <Link href="/catalogo">Catálogo</Link>
          <Link href="/panel/login">Panel</Link>
          <a className="btn-wsp" href="https://wa.me/5493584335761" target="_blank" rel="noopener">
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
