import { requireAdminSession } from "@/lib/panel-auth";
import { prisma } from "@/lib/prisma";
import SucursalForm from "@/components/SucursalForm";

export default async function SucursalesPage() {
  await requireAdminSession();
  const sucursales = await prisma.sucursal.findMany();

  return (
    <div>
      <div className="panel-topbar">
        <h1 style={{ fontFamily: "var(--disp)", textTransform: "uppercase", margin: 0 }}>Sucursales</h1>
      </div>
      {sucursales.map((s) => (
        <SucursalForm key={s.id} sucursal={s} />
      ))}
    </div>
  );
}
