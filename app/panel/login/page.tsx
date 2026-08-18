export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--steel-900)",
      }}
    >
      <form
        action="/api/panel/login"
        method="POST"
        className="panel-card"
        style={{ width: 340, background: "#fff" }}
      >
        <a href="/" style={{ display: "block", marginBottom: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="Agro Bigo S.R.L." style={{ height: 56, borderRadius: 4 }} />
        </a>
        <p style={{ fontSize: 13, color: "var(--steel-700)", margin: "0 0 20px" }}>Panel interno</p>

        <label className="field">
          <span className="field-label">Email</span>
          <input className="input" type="email" name="email" required autoFocus />
        </label>
        <label className="field">
          <span className="field-label">Contraseña</span>
          <input className="input" type="password" name="password" required />
        </label>

        {searchParams.error && (
          <p style={{ fontSize: 13, color: "var(--rust)", margin: "0 0 14px" }}>Email o contraseña incorrectos.</p>
        )}

        <button type="submit" className="btn-primary" style={{ width: "100%" }}>
          Ingresar
        </button>
      </form>
    </div>
  );
}
