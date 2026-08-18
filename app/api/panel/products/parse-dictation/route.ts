import { NextRequest, NextResponse } from "next/server";
import { getAuthedUserFromRequest } from "@/lib/panel-auth";

const CATEGORIES = ["Tractor", "Sembradora", "Tolva", "Acoplado", "Implemento", "Repuestos", "Otro"];

const SYSTEM_PROMPT = `Sos un asistente que extrae datos estructurados de una descripción hablada (dictada de voz) de una publicación de maquinaria o implementos agrícolas usados/nuevos, para un concesionario en Argentina.

Devolvé ÚNICAMENTE un objeto JSON válido, sin texto adicional, con exactamente estos campos:
- category: uno de estos valores exactos: "Tractor", "Sembradora", "Tolva", "Acoplado", "Implemento", "Repuestos", "Otro" (o null si no queda claro)
- brand: marca mencionada (ej. "Agrochery", "Impagro", "Ascanelli"), o null
- model: modelo mencionado, o null
- title: un título corto para la publicación, o null
- condition: "NUEVO" o "USADO" (default "USADO" si no se aclara)
- year: año mencionado, o null
- price: número (sin puntos ni comas), o null si no se menciona o si dice "a consultar"
- currency: "ARS" o "USD" (default "USD" si no se aclara)
- description: una descripción basada en lo dictado, redactada en un párrafo prolijo

No inventes datos que no se mencionaron — usá null en esos casos.`;

export async function POST(req: NextRequest) {
  const user = await getAuthedUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "El dictado con IA no está configurado todavía." }, { status: 500 });
  }

  const { transcript } = await req.json();
  if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
    return NextResponse.json({ error: "No se recibió texto dictado." }, { status: 400 });
  }

  let raw: string;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          { role: "user", content: transcript },
          { role: "assistant", content: "{" },
        ],
      }),
    });

    if (!res.ok) {
      console.error("Error de la API de Anthropic:", await res.text());
      return NextResponse.json({ error: "No se pudo procesar el dictado." }, { status: 500 });
    }

    const data = await res.json();
    raw = "{" + (data.content?.[0]?.text || "");
  } catch (err) {
    console.error("Error llamando a la API de Anthropic:", err);
    return NextResponse.json({ error: "No se pudo procesar el dictado." }, { status: 500 });
  }

  let parsed: Record<string, any>;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("La IA no devolvió JSON válido:", raw);
    return NextResponse.json({ error: "No se pudo interpretar el dictado." }, { status: 500 });
  }

  const toNumberOrNull = (v: any) =>
    typeof v === "number" && !isNaN(v) ? v : typeof v === "string" && v.trim() && !isNaN(Number(v)) ? Number(v) : null;
  const toStringOrNull = (v: any) => (typeof v === "string" && v.trim() ? v.trim() : null);

  const result = {
    category: CATEGORIES.includes(parsed.category) ? parsed.category : null,
    brand: toStringOrNull(parsed.brand),
    model: toStringOrNull(parsed.model),
    title: toStringOrNull(parsed.title),
    condition: parsed.condition === "NUEVO" ? "NUEVO" : "USADO",
    year: toNumberOrNull(parsed.year),
    price: toNumberOrNull(parsed.price),
    currency: parsed.currency === "ARS" ? "ARS" : "USD",
    description: toStringOrNull(parsed.description),
  };

  return NextResponse.json(result);
}
