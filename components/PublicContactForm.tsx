"use client";

import { useState } from "react";

export default function PublicContactForm({ productId }: { productId: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const res = await fetch("/api/public/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, message, productId }),
    });
    setSending(false);
    if (res.ok) setSent(true);
  }

  if (sent) {
    return <p style={{ fontSize: 14, color: "var(--monte)" }}>¡Gracias! Te vamos a contactar a la brevedad.</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          className="input"
          placeholder="Tu nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ flex: 1, minWidth: 140 }}
        />
        <input
          className="input"
          placeholder="Tu teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          style={{ flex: 1, minWidth: 140 }}
        />
      </div>
      <textarea
        className="input"
        placeholder="Comentario (opcional) — contanos qué necesitás saber"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ minHeight: 64 }}
      />
      <button type="submit" disabled={sending} className="btn-ghost" style={{ alignSelf: "flex-start" }}>
        {sending ? "Enviando..." : "Enviar consulta"}
      </button>
    </form>
  );
}
