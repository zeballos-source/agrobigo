"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoAgenteForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("AGENTE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/panel/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo crear el agente.");
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="panel-card" style={{ marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
      <label className="field" style={{ marginBottom: 0 }}>
        <span className="field-label">Nombre</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="field" style={{ marginBottom: 0 }}>
        <span className="field-label">Email</span>
        <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className="field" style={{ marginBottom: 0 }}>
        <span className="field-label">Contraseña</span>
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
      </label>
      <label className="field" style={{ marginBottom: 0 }}>
        <span className="field-label">Rol</span>
        <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="AGENTE">Agente</option>
          <option value="ADMIN">Admin</option>
        </select>
      </label>
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Creando..." : "+ Agente"}
      </button>
      {error && <div style={{ fontSize: 13, color: "var(--rust)", width: "100%" }}>{error}</div>}
    </form>
  );
}
