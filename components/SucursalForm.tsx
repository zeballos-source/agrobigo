"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Sucursal = {
  id: string;
  nombre: string;
  provincia: string;
  direccion: string;
  latitude: number;
  longitude: number;
  telefonoVentas: string;
  telefonoRepuestos: string;
};

export default function SucursalForm({ sucursal }: { sucursal: Sucursal }) {
  const router = useRouter();
  const [form, setForm] = useState(sucursal);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof Sucursal>(key: K, value: Sucursal[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/panel/sucursales/${sucursal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="panel-card" style={{ marginBottom: 20 }}>
      <h3 style={{ marginTop: 0, fontFamily: "var(--disp)", textTransform: "uppercase" }}>{form.nombre}</h3>
      <div style={{ display: "flex", gap: 12 }}>
        <label className="field" style={{ flex: 1 }}>
          <span className="field-label">Nombre</span>
          <input className="input" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} />
        </label>
        <label className="field" style={{ flex: 1 }}>
          <span className="field-label">Provincia</span>
          <input className="input" value={form.provincia} onChange={(e) => set("provincia", e.target.value)} />
        </label>
      </div>
      <label className="field">
        <span className="field-label">Dirección</span>
        <input className="input" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} />
      </label>
      <div style={{ display: "flex", gap: 12 }}>
        <label className="field" style={{ flex: 1 }}>
          <span className="field-label">Latitud</span>
          <input className="input" type="number" step="any" value={form.latitude} onChange={(e) => set("latitude", Number(e.target.value) as any)} />
        </label>
        <label className="field" style={{ flex: 1 }}>
          <span className="field-label">Longitud</span>
          <input className="input" type="number" step="any" value={form.longitude} onChange={(e) => set("longitude", Number(e.target.value) as any)} />
        </label>
      </div>
      <p style={{ fontSize: 11, color: "var(--steel-700)", marginTop: -8 }}>
        Estas coordenadas son las que usa Publicación Rápida para detectar la sucursal por GPS — cuanto más exactas
        (ubicación real del local), mejor detecta.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <label className="field" style={{ flex: 1 }}>
          <span className="field-label">Teléfono ventas</span>
          <input className="input" value={form.telefonoVentas} onChange={(e) => set("telefonoVentas", e.target.value)} />
        </label>
        <label className="field" style={{ flex: 1 }}>
          <span className="field-label">Teléfono repuestos</span>
          <input className="input" value={form.telefonoRepuestos} onChange={(e) => set("telefonoRepuestos", e.target.value)} />
        </label>
      </div>
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? "Guardando..." : saved ? "Guardado ✓" : "Guardar"}
      </button>
    </form>
  );
}
