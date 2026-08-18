"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoContactoForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/panel/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    setName("");
    setPhone("");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="panel-card" style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 20 }}>
      <label className="field" style={{ flex: 1, marginBottom: 0 }}>
        <span className="field-label">Nombre</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="field" style={{ flex: 1, marginBottom: 0 }}>
        <span className="field-label">Teléfono</span>
        <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </label>
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Guardando..." : "+ Contacto"}
      </button>
    </form>
  );
}
