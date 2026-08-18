"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "./ImageUploadField";

import { CATEGORIES, CONDITIONS } from "@/lib/categories";

const STATUSES = ["BORRADOR", "PUBLICADO", "RESERVADO", "VENDIDO"];

type Product = {
  id: string;
  category: string;
  brand: string | null;
  model: string | null;
  title: string;
  description: string | null;
  condition: "NUEVO" | "USADO";
  year: number | null;
  price: number | null;
  currency: "ARS" | "USD";
  status: string;
  sucursalId: string;
  images: { id: string; url: string }[];
};

export default function EditProductForm({
  product,
  sucursales,
}: {
  product: Product;
  sucursales: { id: string; nombre: string }[];
}) {
  const router = useRouter();
  const [category, setCategory] = useState(product.category);
  const [status, setStatus] = useState(product.status);
  const [condition, setCondition] = useState<"NUEVO" | "USADO">(product.condition);
  const [brand, setBrand] = useState(product.brand ?? "");
  const [model, setModel] = useState(product.model ?? "");
  const [title, setTitle] = useState(product.title);
  const [year, setYear] = useState(product.year != null ? String(product.year) : "");
  const [price, setPrice] = useState(product.price != null ? String(product.price) : "");
  const [currency, setCurrency] = useState(product.currency);
  const [description, setDescription] = useState(product.description ?? "");
  const [sucursalId, setSucursalId] = useState(product.sucursalId);
  const [existingImages, setExistingImages] = useState(product.images);
  const [deleteImageIds, setDeleteImageIds] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function removeExisting(id: string) {
    setExistingImages((imgs) => imgs.filter((i) => i.id !== id));
    setDeleteImageIds((ids) => [...ids, id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.set("category", category);
    formData.set("status", status);
    formData.set("condition", condition);
    formData.set("brand", brand);
    formData.set("model", model);
    formData.set("title", title);
    formData.set("year", year);
    formData.set("price", price);
    formData.set("currency", currency);
    formData.set("description", description);
    formData.set("sucursalId", sucursalId);
    deleteImageIds.forEach((id) => formData.append("deleteImageIds", id));
    newImages.forEach((file) => formData.append("images", file));

    try {
      const res = await fetch(`/api/panel/products/${product.id}`, { method: "PATCH", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar.");
      router.push("/panel/productos");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "No se pudo guardar.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("¿Borrar este producto? No se puede deshacer.")) return;
    setDeleting(true);
    const res = await fetch(`/api/panel/products/${product.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/panel/productos");
      router.refresh();
    } else {
      setDeleting(false);
      setError("No se pudo borrar.");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
      <label className="field">
        <span className="field-label">Estado</span>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field-label">Sucursal</span>
        <select className="input" value={sucursalId} onChange={(e) => setSucursalId(e.target.value)}>
          {sucursales.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </label>

      <div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Categoría</div>
        <div className="opt-grid">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`opt-card ${category === c.value ? "active" : ""}`}
            >
              <span className="opt-icon">{c.icon}</span>
              {c.value}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Condición</div>
        <div className="opt-grid" style={{ gridTemplateColumns: "repeat(2, minmax(108px, 160px))" }}>
          {CONDITIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCondition(c.value)}
              className={`opt-card ${condition === c.value ? "active" : ""}`}
            >
              <span className="opt-icon">{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <label className="field" style={{ flex: 1 }}>
          <span className="field-label">Marca</span>
          <input className="input" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </label>
        <label className="field" style={{ flex: 1 }}>
          <span className="field-label">Modelo</span>
          <input className="input" value={model} onChange={(e) => setModel(e.target.value)} />
        </label>
      </div>

      <label className="field">
        <span className="field-label">Título</span>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <div style={{ display: "flex", gap: 12 }}>
        <label className="field" style={{ flex: 1 }}>
          <span className="field-label">Año</span>
          <input className="input" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
        </label>
        <label className="field" style={{ flex: 2 }}>
          <span className="field-label">Precio</span>
          <input className="input" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
        <label className="field" style={{ flex: 1 }}>
          <span className="field-label">Moneda</span>
          <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value as "ARS" | "USD")}>
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
          </select>
        </label>
      </div>

      <label className="field">
        <span className="field-label">Descripción</span>
        <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      {existingImages.length > 0 && (
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Fotos actuales</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {existingImages.map((img) => (
              <div key={img.id} style={{ position: "relative", width: 96, height: 96 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 6, border: "1px solid var(--line)" }} />
                <button
                  type="button"
                  onClick={() => removeExisting(img.id)}
                  style={{ position: "absolute", top: 2, right: 2, background: "var(--rust)", color: "white", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 12, cursor: "pointer" }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <ImageUploadField max={10 - existingImages.length} label="Agregar fotos" onImagesChange={setNewImages} />

      {error && <div style={{ fontSize: 13, color: "var(--rust)" }}>{error}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, opacity: saving ? 0.6 : 1 }}>
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        <button type="button" onClick={handleDelete} disabled={deleting} className="btn-ghost" style={{ borderColor: "var(--rust)", color: "var(--rust)" }}>
          {deleting ? "Borrando..." : "Borrar"}
        </button>
      </div>
    </form>
  );
}
