"use client";

import { useEffect, useRef, useState } from "react";

type Item = { key: string; kind: "new"; url: string; file: File };

let newIdCounter = 0;

export default function ImageUploadField({
  max = 10,
  label,
  helpText,
  capture,
  onImagesChange,
}: {
  max?: number;
  label?: string;
  helpText?: string;
  capture?: boolean;
  onImagesChange?: (files: File[]) => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onImagesChange?.(items.map((i) => i.file));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const slotsLeft = Math.max(max - items.length, 0);

  function syncFilesInput(current: Item[]) {
    const dt = new DataTransfer();
    current.forEach((item) => dt.items.add(item.file));
    if (filesInputRef.current) filesInputRef.current.files = dt.files;
  }

  // Las fotos de iPhone salen en formato HEIC por defecto, que ningún
  // navegador salvo Safari puede mostrar en un <img> — sin esto, la foto
  // quedaría rota para casi cualquiera que visite el sitio. Se convierte a
  // JPEG en el navegador antes de subirla (heic2any se carga solo cuando
  // hace falta, así no infla el bundle para el caso común de fotos normales).
  async function convertHeicIfNeeded(file: File): Promise<File> {
    const looksHeic = /\.hei[cf]$/i.test(file.name) || file.type === "image/heic" || file.type === "image/heif";
    if (!looksHeic) return file;

    try {
      const heic2any = (await import("heic2any")).default;
      const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
      const blob = Array.isArray(converted) ? converted[0] : converted;
      const newName = file.name.replace(/\.hei[cf]$/i, ".jpg");
      return new File([blob], newName, { type: "image/jpeg" });
    } catch {
      return file;
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(e.target.files || []);
    const room = Math.max(max - items.length, 0);
    const accepted = chosen.slice(0, room);

    setError(chosen.length > room ? `Máximo ${max} fotos en total. Se tomaron las primeras ${room}.` : null);

    const converted = await Promise.all(accepted.map((file) => convertHeicIfNeeded(file)));

    const newItems: Item[] = converted.map((file) => ({
      key: `new-${newIdCounter++}`,
      kind: "new",
      url: URL.createObjectURL(file),
      file,
    }));

    const next = [...items, ...newItems];
    setItems(next);
    syncFilesInput(next);
  }

  function removeItem(key: string) {
    const next = items.filter((i) => i.key !== key);
    setItems(next);
    syncFilesInput(next);
    setError(null);
  }

  function move(key: string, direction: -1 | 1) {
    const index = items.findIndex((i) => i.key === key);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    syncFilesInput(next);
  }

  return (
    <div>
      <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
        {label ?? `Fotos (hasta ${max} en total)`}
      </label>
      <p style={{ fontSize: 12, color: "var(--steel-700)", margin: "0 0 8px" }}>
        {helpText ?? "La primera foto es la que se muestra como portada. Usá las flechas para reordenar."}
      </p>

      {items.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {items.map((item, index) => (
            <div key={item.key} style={{ position: "relative", width: 96, height: 96 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt=""
                style={{
                  width: 96,
                  height: 96,
                  objectFit: "cover",
                  borderRadius: 6,
                  border: index === 0 ? "2px solid var(--monte)" : "1px solid var(--line)",
                }}
              />
              {index === 0 && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 2,
                    left: 2,
                    background: "var(--monte)",
                    color: "white",
                    fontSize: 10,
                    padding: "1px 5px",
                    borderRadius: 3,
                  }}
                >
                  Portada
                </span>
              )}
              <button
                type="button"
                onClick={() => removeItem(item.key)}
                title="Quitar"
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  background: "var(--rust)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  fontSize: 12,
                  cursor: "pointer",
                  lineHeight: "20px",
                  padding: 0,
                }}
              >
                ×
              </button>
              <div style={{ position: "absolute", bottom: 2, right: 2, display: "flex", gap: 2 }}>
                <button type="button" onClick={() => move(item.key, -1)} disabled={index === 0} style={arrowStyle(index === 0)}>
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => move(item.key, 1)}
                  disabled={index === items.length - 1}
                  style={arrowStyle(index === items.length - 1)}
                >
                  ›
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {slotsLeft > 0 ? (
        <>
          {capture ? (
            <>
              <input ref={filesInputRef} type="file" name="images" accept="image/*,.heic,.heif" multiple style={{ display: "none" }} />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                capture="environment"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <input ref={galleryInputRef} type="file" accept="image/*,.heic,.heif" multiple onChange={handleFileChange} style={{ display: "none" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => cameraInputRef.current?.click()} className="btn-ghost" style={{ flex: 1, textAlign: "center" }}>
                  📷 Tomar foto
                </button>
                <button type="button" onClick={() => galleryInputRef.current?.click()} className="btn-ghost" style={{ flex: 1, textAlign: "center" }}>
                  🖼️ Galería
                </button>
              </div>
            </>
          ) : (
            <input ref={filesInputRef} type="file" name="images" accept="image/*,.heic,.heif" multiple onChange={handleFileChange} />
          )}
          <div style={{ fontSize: 12, color: "var(--steel-700)", marginTop: 4 }}>
            {items.length} / {max} fotos
          </div>
        </>
      ) : (
        <div style={{ fontSize: 13, color: "var(--steel-700)" }}>Llegaste al máximo de {max} fotos.</div>
      )}

      {error && <div style={{ fontSize: 12, color: "var(--rust)", marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function arrowStyle(disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? "#eee" : "white",
    color: disabled ? "#ccc" : "#333",
    border: "1px solid #ccc",
    borderRadius: 4,
    width: 20,
    height: 20,
    fontSize: 13,
    lineHeight: "16px",
    cursor: disabled ? "default" : "pointer",
    padding: 0,
  };
}
