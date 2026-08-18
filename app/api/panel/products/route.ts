import { NextRequest, NextResponse } from "next/server";
import { getAuthedUserFromRequest } from "@/lib/panel-auth";
import { prisma } from "@/lib/prisma";
import { uploadProductImages } from "@/lib/storage";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function num(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  if (v === null) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

export async function POST(req: NextRequest) {
  const user = await getAuthedUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const formData = await req.formData();

  const category = str(formData, "category");
  const title = str(formData, "title");
  const sucursalId = str(formData, "sucursalId");
  if (!category || !title || !sucursalId) {
    return NextResponse.json({ error: "Faltan datos obligatorios (categoría, título, sucursal)." }, { status: 400 });
  }

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const uploadedUrls = await uploadProductImages(files);

  const product = await prisma.product.create({
    data: {
      category,
      title,
      brand: str(formData, "brand"),
      model: str(formData, "model"),
      condition: str(formData, "condition") === "NUEVO" ? "NUEVO" : "USADO",
      year: num(formData, "year"),
      price: num(formData, "price"),
      currency: str(formData, "currency") === "ARS" ? "ARS" : "USD",
      description: str(formData, "description"),
      sucursalId,
      latitude: num(formData, "latitude"),
      longitude: num(formData, "longitude"),
      status: "BORRADOR",
      images: uploadedUrls.length ? { create: uploadedUrls.map((url, i) => ({ url, order: i })) } : undefined,
    },
  });

  return NextResponse.json({ id: product.id });
}
