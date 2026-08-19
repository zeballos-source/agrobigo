"use client";

import { useState } from "react";

export default function ChangePasswordButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/panel/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo cambiar la contraseña.");
      return;
    }
    setPassword("");
    setOpen(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="chip">
        {done ? "Contraseña cambiada ✓" : "Cambiar contraseña"}
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <input
        className="input"
        type="password"
        placeholder="Nueva contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength={8}
        style={{ width: 160, padding: "6px 10px" }}
        autoFocus
      />
      <button type="button" onClick={handleSave} disabled={saving || password.length < 8} className="chip">
        {saving ? "Guardando..." : "Guardar"}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setPassword("");
          setError(null);
        }}
        className="chip"
      >
        Cancelar
      </button>
      {error && <span style={{ fontSize: 12, color: "var(--rust)" }}>{error}</span>}
    </div>
  );
}
