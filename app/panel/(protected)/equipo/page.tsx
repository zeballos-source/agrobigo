import { requireAdminSession } from "@/lib/panel-auth";
import { prisma } from "@/lib/prisma";
import NuevoAgenteForm from "@/components/NuevoAgenteForm";
import ToggleAgenteActivo from "@/components/ToggleAgenteActivo";

export default async function EquipoPage() {
  await requireAdminSession();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div className="panel-topbar">
        <h1 style={{ fontFamily: "var(--disp)", textTransform: "uppercase", margin: 0 }}>Equipo</h1>
      </div>

      <NuevoAgenteForm />

      <div className="panel-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.active ? "Activo" : "Inactivo"}</td>
                <td>
                  <ToggleAgenteActivo id={u.id} active={u.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
