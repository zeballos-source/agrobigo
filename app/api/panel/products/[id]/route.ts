import { NextRequest, NextResponse } from "next/server";
import { getAuthedUserFromRequest } from "@/lib/panel-auth";
import { prisma } from "@/lib/prisma";
import { uploadProductImages, deleteProductImageByUrl } from "@/lib/storage";

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

const STATUSES = ["BORRADOR", "PUBLICADO", "RESERVADO", "VENDIDO"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthedUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { images: true } });
  if (!product) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const formData = await req.formData();

  const deleteImageIds = formData.getAll("deleteImageIds").map(String);
  for (const imgId of deleteImageIds) {
    const img = product.images.find((i) => i.id === imgId);
    if (img) {
      await deleteProductImageByUrl(img.url);
      await prisma.image.delete({ where: { id: img.id } });
    }
  }

  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const uploadedUrls = await uploadProductImages(files);
  const currentMax = await prisma.image.count({ where: { productId: product.id } });

  const status = str(formData, "status");

  await prisma.product.update({
    where: { id: product.id },
    data: {
      category: str(formData, "category") ?? undefined,
      title: str(formData, "title") ?? undefined,
      brand: str(formData, "brand"),
      model: str(formData, "model"),
      condition: str(formData, "condition") === "NUEVO" ? "NUEVO" : "USADO",
      year: num(formData, "year"),
      price: num(formData, "price"),
      currency: str(formData, "currency") === "ARS" ? "ARS" : "USD",
      description: str(formData, "description"),
      sucursalId: str(formData, "sucursalId") ?? undefined,
      status: status && STATUSES.includes(status) ? (status as any) : undefined,
      images: uploadedUrls.length
        ? { create: uploadedUrls.map((url, i) => ({ url, order: currentMax + i })) }
        : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthedUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { images: true } });
  if (!product) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  for (const img of product.images) {
    await deleteProductImageByUrl(img.url);
  }
  await prisma.product.delete({ where: { id: product.id } });

  return NextResponse.json({ ok: true });
}
