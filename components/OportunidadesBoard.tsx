"use client";

import { useState } from "react";

const STAGES: { key: string; label: string }[] = [
  { key: "NUEVO", label: "Nuevo" },
  { key: "COTIZANDO", label: "Cotizando" },
  { key: "VISITA_AGENDADA", label: "Visita agendada" },
  { key: "CERRADO_GANADO", label: "Cerrado (ganado)" },
  { key: "CERRADO_PERDIDO", label: "Cerrado (perdido)" },
];

type Opportunity = {
  id: string;
  stage: string;
  createdAt: string;
  notes: string | null;
  contact: { name: string; phone: string | null };
  product: { title: string } | null;
};

export default function OportunidadesBoard({ initial }: { initial: Opportunity[] }) {
  const [opportunities, setOpportunities] = useState(initial);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  async function moveTo(id: string, stage: string) {
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, stage } : o)));
    await fetch(`/api/panel/opportunities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage }),
    });
  }

  return (
    <div className="kanban">
      {STAGES.map((col) => {
        const items = opportunities.filter((o) => o.stage === col.key);
        return (
          <div
            key={col.key}
            className="kcol"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggingId) moveTo(draggingId, col.key);
              setDraggingId(null);
            }}
          >
            <h5>
              {col.label} <span>{items.length}</span>
            </h5>
            {items.map((o) => (
              <div
                key={o.id}
                className="kcard"
                draggable
                onDragStart={() => setDraggingId(o.id)}
                onDragEnd={() => setDraggingId(null)}
              >
                <b>{o.contact.name}</b>
                {o.product?.title ?? "Consulta general"}
                <br />
                <span>{o.contact.phone ?? ""}</span>
                {o.notes && (
                  <p style={{ fontSize: 11.5, color: "var(--steel-700)", margin: "6px 0 0", fontStyle: "italic" }}>
                    "{o.notes}"
                  </p>
                )}
              </div>
            ))}
            {items.length === 0 && <div style={{ fontSize: 11, color: "var(--steel-700)" }}>Sin oportunidades</div>}
          </div>
        );
      })}
    </div>
  );
}
