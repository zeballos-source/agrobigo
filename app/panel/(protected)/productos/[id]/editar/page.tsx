import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditProductForm from "@/components/EditProductForm";

export default async function EditarProductoPage({ params }: { params: { id: string } }) {
  const [product, sucursales] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { images: { orderBy: { order: "asc" } } },
    }),
    prisma.sucursal.findMany(),
  ]);

  if (!product) return notFound();

  return (
    <div>
      <div className="panel-topbar">
        <h1 style={{ fontFamily: "var(--disp)", textTransform: "uppercase", margin: 0 }}>Editar producto</h1>
      </div>
      <EditProductForm product={product} sucursales={sucursales} />
    </div>
  );
}
