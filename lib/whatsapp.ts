export function productWhatsappLink(
  product: { title: string; category: string },
  sucursal: { telefonoVentas: string; telefonoRepuestos: string }
) {
  const phone = product.category === "Repuestos" ? sucursal.telefonoRepuestos : sucursal.telefonoVentas;
  const text = `Hola, te escribo por: ${product.title}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
