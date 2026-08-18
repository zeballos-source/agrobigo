import { prisma } from "@/lib/prisma";
import PublicacionRapidaForm from "@/components/PublicacionRapidaForm";

export default async function NuevoProductoPage() {
  const sucursales = await prisma.sucursal.findMany();

  return (
    <div>
      <div className="panel-topbar">
        <h1 style={{ fontFamily: "var(--disp)", textTransform: "uppercase", margin: 0 }}>Publicación rápida</h1>
      </div>
      <PublicacionRapidaForm sucursales={sucursales} />
    </div>
  );
}
