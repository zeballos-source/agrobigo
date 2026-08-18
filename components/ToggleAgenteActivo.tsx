"use client";

import { useRouter } from "next/navigation";

export default function ToggleAgenteActivo({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();

  async function toggle() {
    await fetch(`/api/panel/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  return (
    <button type="button" onClick={toggle} className="chip">
      {active ? "Desactivar" : "Activar"}
    </button>
  );
}
