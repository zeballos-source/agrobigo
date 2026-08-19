import { redirect } from "next/navigation";

export default function CatalogoRedirect({
  searchParams,
}: {
  searchParams: { categoria?: string; sucursal?: string };
}) {
  const params = new URLSearchParams();
  if (searchParams.categoria) params.set("categoria", searchParams.categoria);
  if (searchParams.sucursal) params.set("sucursal", searchParams.sucursal);
  const qs = params.toString();
  redirect((qs ? `/?${qs}` : "/") + "#catalogo");
}
