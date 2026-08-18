export const CATEGORIES: { value: string; icon: string }[] = [
  { value: "Tractor", icon: "🚜" },
  { value: "Sembradora", icon: "🌱" },
  { value: "Tolva", icon: "🌾" },
  { value: "Acoplado", icon: "🚛" },
  { value: "Implemento", icon: "🔧" },
  { value: "Repuestos", icon: "⚙️" },
  { value: "Otro", icon: "🏷️" },
];

export const CONDITIONS: { value: "NUEVO" | "USADO"; icon: string; label: string }[] = [
  { value: "NUEVO", icon: "✨", label: "Nuevo" },
  { value: "USADO", icon: "♻️", label: "Usado" },
];
