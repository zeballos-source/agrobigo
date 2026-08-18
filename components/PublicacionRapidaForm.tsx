"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "./ImageUploadField";
import { nearestSucursal } from "@/lib/geo";
import { CATEGORIES, CONDITIONS } from "@/lib/categories";

type Sucursal = { id: string; nombre: string; latitude: number; longitude: number };

export default function PublicacionRapidaForm({ sucursales }: { sucursales: Sucursal[] }) {
  const router = useRouter();

  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState<"NUEVO" | "USADO">("USADO");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"buscando" | "ok" | "error">("buscando");
  const [sucursalId, setSucursalId] = useState<string>(sucursales[0]?.id ?? "");
  const [sucursalAuto, setSucursalAuto] = useState<string | null>(null);

  const [dictationMode, setDictationMode] = useState<"detalle" | "todo" | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const todoTranscriptRef = useRef("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        setLocationStatus("ok");
        const nearest = nearestSucursal(lat, lng, sucursales);
        if (nearest) {
          setSucursalId(nearest.sucursal.id);
          setSucursalAuto(nearest.sucursal.nombre);
        }
      },
      () => setLocationStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speechSupported =
    typeof window !== "undefined" && Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  function toggleDictadoDetalle() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || dictationMode === "todo") return;
    if (dictationMode === "detalle") {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "es-AR";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const chunk = Array.from(e.results as any)
        .slice(e.resultIndex)
        .map((r: any) => r[0].transcript)
        .join(" ");
      setDescription((prev) => (prev ? `${prev} ${chunk}` : chunk));
    };
    recognition.onend = () => setDictationMode(null);
    recognition.onerror = () => setDictationMode(null);
    recognitionRef.current = recognition;
    recognition.start();
    setDictationMode("detalle");
  }

  function toggleDictadoTodo() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || dictationMode === "detalle") return;
    if (dictationMode === "todo") {
      recognitionRef.current?.stop();
      return;
    }
    setAiError(null);
    todoTranscriptRef.current = "";
    const recognition = new SpeechRecognition();
    recognition.lang = "es-AR";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const chunk = Array.from(e.results as any)
        .slice(e.resultIndex)
        .map((r: any) => r[0].transcript)
        .join(" ");
      todoTranscriptRef.current = todoTranscriptRef.current ? `${todoTranscriptRef.current} ${chunk}` : chunk;
    };
    recognition.onend = () => {
      setDictationMode(null);
      const transcript = todoTranscriptRef.current.trim();
      if (!transcript) return;
      setAiLoading(true);
      fetch("/api/panel/products/parse-dictation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "No se pudo procesar el dictado.");
          return data;
        })
        .then((data) => {
          if (data.category) setCategory(data.category);
          if (data.brand) setBrand(data.brand);
          if (data.model) setModel(data.model);
          if (data.title) setTitle(data.title);
          setCondition(data.condition);
          if (data.year != null) setYear(String(data.year));
          if (data.price != null) setPrice(String(data.price));
          setCurrency(data.currency);
          if (data.description) setDescription(data.description);
        })
        .catch((err) => setAiError(err.message || "No se pudo procesar el dictado."))
        .finally(() => setAiLoading(false));
    };
    recognition.onerror = () => setDictationMode(null);
    recognitionRef.current = recognition;
    recognition.start();
    setDictationMode("todo");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !title.trim()) {
      setSubmitError("Elegí una categoría y completá el título.");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);

    const formData = new FormData();
    formData.set("category", category);
    formData.set("condition", condition);
    formData.set("brand", brand);
    formData.set("model", model);
    formData.set("title", title);
    formData.set("year", year);
    formData.set("price", price);
    formData.set("currency", currency);
    formData.set("description", description);
    formData.set("sucursalId", sucursalId);
    if (coords) {
      formData.set("latitude", String(coords.lat));
      formData.set("longitude", String(coords.lng));
    }
    images.forEach((file) => formData.append("images", file));

    try {
      const res = await fetch("/api/panel/products", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar el producto.");
      router.push(`/panel/productos/${data.id}/editar?created=1`);
    } catch (err: any) {
      setSubmitError(err.message || "No se pudo guardar el producto.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
      {speechSupported && (
        <div className="panel-card">
          <button
            type="button"
            onClick={toggleDictadoTodo}
            disabled={dictationMode === "detalle" || aiLoading}
            className="btn-primary"
            style={{
              width: "100%",
              background: dictationMode === "todo" ? "var(--rust)" : "var(--steel-900)",
              opacity: dictationMode === "detalle" || aiLoading ? 0.5 : 1,
            }}
          >
            {dictationMode === "todo"
              ? "⏹ Detener y completar todo"
              : aiLoading
              ? "✨ Completando la publicación..."
              : "✨ Dictar toda la publicación (IA)"}
          </button>
          <p style={{ fontSize: 11, color: "var(--steel-700)", margin: "6px 0 0" }}>
            Usa inteligencia artificial — tiene un costo pequeño por cada uso.
          </p>
          {dictationMode === "todo" && (
            <p style={{ fontSize: 12, color: "var(--rust)", marginTop: 6 }}>
              🎙️ Escuchando... contá todo: categoría, marca, modelo, precio, estado. Tocá "Detener" cuando termines.
            </p>
          )}
          {aiError && <p style={{ fontSize: 12, color: "var(--rust)", marginTop: 6 }}>{aiError}</p>}
        </div>
      )}

      <div style={{ fontSize: 13, color: locationStatus === "error" ? "var(--rust)" : "var(--steel-700)" }}>
        {locationStatus === "buscando" && "📍 Buscando tu ubicación..."}
        {locationStatus === "ok" && sucursalAuto && `📍 Sucursal detectada por GPS: ${sucursalAuto}`}
        {locationStatus === "error" && "📍 No se pudo obtener la ubicación — elegí la sucursal a mano."}
      </div>

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
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Tractor Agrochery RK404A 45HP" />
      </label>

      <div style={{ display: "flex", gap: 12 }}>
        <label className="field" style={{ flex: 1 }}>
          <span className="field-label">Año</span>
          <input className="input" type="number" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} />
        </label>
        <label className="field" style={{ flex: 2 }}>
          <span className="field-label">Precio (vacío = "Consultar")</span>
          <input className="input" type="number" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
        <label className="field" style={{ flex: 1 }}>
          <span className="field-label">Moneda</span>
          <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">USD</option>
            <option value="ARS">ARS</option>
          </select>
        </label>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Descripción</span>
          {speechSupported && (
            <button
              type="button"
              onClick={toggleDictadoDetalle}
              disabled={dictationMode === "todo" || aiLoading}
              className="chip"
              style={{
                background: dictationMode === "detalle" ? "var(--rust)" : "#fff",
                color: dictationMode === "detalle" ? "#fff" : "var(--steel-900)",
              }}
            >
              {dictationMode === "detalle" ? "⏹ Detener" : "🎤 Dictar solo la descripción"}
            </button>
          )}
        </div>
        <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <ImageUploadField capture max={10} label="Fotos" helpText="Sacá las fotos del producto. La primera va a ser la portada." onImagesChange={setImages} />

      {submitError && <div style={{ fontSize: 13, color: "var(--rust)" }}>{submitError}</div>}

      <button type="submit" disabled={submitting} className="btn-primary" style={{ opacity: submitting ? 0.6 : 1 }}>
        {submitting ? "Guardando..." : "Guardar como borrador"}
      </button>
    </form>
  );
}
