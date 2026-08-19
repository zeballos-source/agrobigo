import { requirePanelSession } from "@/lib/panel-auth";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePanelSession();

  return (
    <div className="panel-shell">
      <aside className="panel-sidebar">
        <a href="/" style={{ display: "block", marginBottom: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="Agro Bigo S.R.L." style={{ height: 34, borderRadius: 3 }} />
        </a>
        <a href="/panel">Dashboard</a>
        <a href="/panel/productos">Publicaciones</a>
        <a href="/panel/productos/nuevo">+ Nueva publicación</a>
        <a href="/panel/contactos">Contactos</a>
        <a href="/panel/oportunidades">Oportunidades</a>
        {user.role === "ADMIN" && (
          <>
            <a href="/panel/sucursales">Sucursales</a>
            <a href="/panel/equipo">Equipo</a>
          </>
        )}
        <form
          action="/api/panel/logout"
          method="POST"
          style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--steel-700)" }}
        >
          <button
            type="submit"
            style={{ background: "none", border: "none", color: "var(--steel-100)", cursor: "pointer", fontSize: 14, padding: "10px 12px" }}
          >
            Cerrar sesión ({user.name})
          </button>
        </form>
      </aside>
      <main className="panel-main">{children}</main>
    </div>
  );
}
