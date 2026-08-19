import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const rioCuarto = await prisma.sucursal.upsert({
    where: { id: "sucursal-rio-cuarto" },
    update: {},
    create: {
      id: "sucursal-rio-cuarto",
      nombre: "Río Cuarto",
      provincia: "Córdoba",
      direccion: "Ruta A005 km 5,5, Río Cuarto, Córdoba",
      // Coordenadas aproximadas del centro de Río Cuarto — ajustar la
      // ubicación exacta del local desde /panel/sucursales.
      latitude: -33.1232,
      longitude: -64.3492,
      telefonoVentas: "5493584335761",
      telefonoRepuestos: "5493584335762",
    },
  });

  const santaRosa = await prisma.sucursal.upsert({
    where: { id: "sucursal-santa-rosa" },
    update: {},
    create: {
      id: "sucursal-santa-rosa",
      nombre: "Santa Rosa de Conlara",
      provincia: "San Luis",
      direccion: "Autopista 55 km 922,5, Santa Rosa de Conlara, San Luis",
      // Coordenadas aproximadas del centro de Santa Rosa de Conlara — ajustar
      // la ubicación exacta del local desde /panel/sucursales.
      latitude: -32.3011,
      longitude: -65.1847,
      telefonoVentas: "5493584335761",
      telefonoRepuestos: "5493584335762",
    },
  });

  const adminPassword = process.env.ADMIN_SEED_PASSWORD || "CambiarPassword123!";
  const admin = await prisma.user.upsert({
    where: { email: "admin@agrobigo.com.ar" },
    update: {},
    create: {
      email: "admin@agrobigo.com.ar",
      name: "Administrador",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
    },
  });

  type SeedProduct = {
    category: string;
    brand: string;
    model: string;
    title: string;
    description: string;
    condition: "NUEVO" | "USADO";
    year?: number;
    price?: number;
    sucursalId: string;
    status: "PUBLICADO";
    imageUrl?: string;
  };

  // Línea completa de tractores Agrochery (fuente: American Agro, distribuidor
  // oficial autorizado — Agrochery no tiene sitio propio, solo Instagram
  // @agrocheryoficial) + el RS2604-C (260HP) y el 2404 CHF (240HP), confirmados
  // por separado — este último con foto real de una unidad entregada en el
  // local de Río Cuarto.
  const agrocheryTractores: Array<[string, number | null, string, string?]> = [
    ["RA250A", 25, "Motor diésel 3 cilindros, 850 kg, 433 kg de capacidad de levante.", "/real/agrochery/RA250A.jpg"],
    ["RA500A", null, "Tractor agrícola de la línea RA.", "/real/agrochery/RA500A.png"],
    ["RA504F", null, "Tractor agrícola de la línea RA, versión frutera.", "/real/agrochery/RA504F.png"],
    ["RA704F", null, "Tractor agrícola de la línea RA, versión frutera.", "/real/agrochery/RA704F.png"],
    ["RD300A", 30, "Tractor agrícola compacto, línea RD.", "/real/agrochery/RD300A.png"],
    ["RD504F", null, "Tractor agrícola línea RD, versión frutera.", "/real/agrochery/RD504F.png"],
    ["RD704F", null, "Tractor agrícola línea RD, versión frutera.", "/real/agrochery/RD704F.png"],
    ["RK404A", 45, "El modelo más elegido de la línea Agrochery.", "/real/agrochery/RK404A.png"],
    ["RK504A/C", null, "Tractor agrícola línea RK, con y sin cabina.", "/real/agrochery/RK504AC.png"],
    ["RK704C", null, "Tractor agrícola línea RK, con cabina.", "/real/agrochery/RK704C.png"],
    ["RK904C", null, "Tractor agrícola línea RK, con cabina.", "/real/agrochery/RK904C.png"],
    ["RC1004", 100, "Tractor agrícola de mediana potencia.", "/real/agrochery/RC1004.jpg"],
    ["RC1104-C", null, "Tractor agrícola con cabina, línea RC.", "/real/agrochery/RC1104C.png"],
    ["RC1204", null, "Tractor agrícola línea RC.", "/real/agrochery/RC1204.png"],
    ["RC1404C", 140, "Tractor agrícola con cabina, 4x4.", "/real/agrochery/RC1404C.png"],
    ["RS1604", 160, "Tractor agrícola de alta potencia, línea RS.", "/real/agrochery/RS1604.png"],
    ["RS1804-C", 180, "6 cilindros diésel, 4x4, tanque de 400L, 24 marchas.", "/real/agrochery/RS1804C.jpg"],
    ["RS2204-C", 220, "220HP turbo, 4x4, 32x32 marchas, 3.500 kg de levante, 9.000 kg de peso.", "/real/agrochery/RS2204C.png"],
    ["2404 CHF", 240, "Circuito cerrado, 180 lts. Unidad entregada en el local de Río Cuarto.", "/real/tractor-agrochery-2404chf.jpg"],
  ];

  // Catálogo real de Impagro (fuente: impagro.com.ar/productos), agrupando
  // variantes de capacidad de una misma familia en un solo producto. Los dos
  // acoplados playos tienen foto real de unidades entregadas con sticker de
  // AgroBigo.
  const impagroImplementos: Array<[string, string, string, string?]> = [
    [
      "Acoplado playo rural 3 a 4 TT",
      "Acoplado playo",
      "Acoplado playo rural, capacidad 3 a 4 toneladas. Entregado con sticker de Agro Bigo, Río Cuarto.",
      "/real/acoplado-playo-impagro.jpg",
    ],
    [
      "Acoplado transporte de hacienda",
      "Acoplado jaula",
      "Acoplado jaula para transporte de hacienda. Opcional: tensor de enganche, rampa de carga, cargador.",
      "/real/acoplado-jaula-impagro.jpg",
    ],
    [
      "Tolva fertilizante y semillas",
      "Tolva cerealera",
      "Capacidades de 10, 12, 14, 16 y 20 toneladas. Incluye tapa mecánica, neumáticos 8.25x22.5.",
      "/real/impagro-tolvas-promo.jpg",
    ],
    [
      "Tolva tipo silo",
      "Tolva silo",
      "Capacidades de 10, 12, 14, 16 y 20 toneladas. Incluye tapa y neumáticos.",
      "/real/impagro-tolvas-promo.jpg",
    ],
  ];

  // Ascanelli S.A. (Río Tercero) — su sitio oficial (ascanellisa.com.ar) no
  // respondió con contenido válido al momento de armar este catálogo, así que
  // estos modelos vienen de fuentes de la industria (Maquinac, Agrofy,
  // Agroads, CAFMA), no del sitio del fabricante. Confirmar specs exactas
  // antes de publicar precios.
  const ascanelliProductos: Array<[string, string, string, string, string?]> = [
    ["Tolva", "Línea EVO 24 a 37tn", "Tolva autodescargable Ascanelli EVO", "Línea renovada, versiones de 24, 27, 30, 33 y 37 toneladas.", "/real/ascanelli/evo43.jpg"],
    ["Tolva", "EVO 43", "Tolva autodescargable Ascanelli EVO 43", "51.500 litros — la tolva autodescargable más grande fabricada en Argentina.", "/real/ascanelli/evo43.jpg"],
    ["Tolva", "Magnum+ 22", "Tolva autodescargable Ascanelli Magnum+ 22tn", "Capacidad 22 toneladas.", "/real/ascanelli/magnum22.jpg"],
    ["Tolva", "Magnum+ 30", "Tolva autodescargable Ascanelli Magnum+ 30tn", "Entregada a productor en Achiras, Córdoba. Consultar disponibilidad de nuevas unidades.", "/real/ascanelli/magnum22.jpg"],
    ["Sembradora", "Magnum RS 4000", "Sembradora de grueso Ascanelli", "Consultar modelos y anchos de labor disponibles.", "/real/ascanelli/sembradora-grueso.jpg"],
    ["Sembradora", "Magnum RS 4000 GF", "Sembradora de fino Ascanelli", "Consultar modelos y anchos de labor disponibles.", "/real/ascanelli/sembradora-fino.jpg"],
    ["Implemento", "RS 1000", "Mixer vertical Ascanelli", "Consultar capacidades disponibles.", "/real/ascanelli/mixer.jpg"],
    ["Implemento", "E9", "Embolsadora de granos Ascanelli", "Consultar modelos disponibles.", "/real/ascanelli/embolsadora.jpg"],
  ];

  // Reseedable: borra el catálogo de ejemplo anterior antes de recargarlo
  // (las oportunidades no se borran, solo pierden el link al producto).
  await prisma.product.deleteMany({});

  const sampleProducts: SeedProduct[] = [];
  let i = 0;
  const alternateSucursal = () => (i++ % 2 === 0 ? rioCuarto.id : santaRosa.id);

  // Mezcla realista: 1 de cada 3 productos entra como usado (con año de uso),
  // el resto queda nuevo — igual que el stock real de un concesionario.
  let condIdx = 0;
  const usedYears = [2016, 2017, 2018, 2019, 2020, 2021, 2022];
  function nextCondition(): { condition: "NUEVO" | "USADO"; year?: number } {
    const isUsed = condIdx++ % 3 === 2;
    return isUsed ? { condition: "USADO", year: usedYears[condIdx % usedYears.length] } : { condition: "NUEVO" };
  }

  for (const [model, hp, desc, imageUrl] of agrocheryTractores) {
    sampleProducts.push({
      category: "Tractor",
      brand: "Agrochery",
      model,
      title: `Tractor Agrochery ${model}${hp ? ` ${hp}HP` : ""}`,
      description: desc,
      sucursalId: alternateSucursal(),
      status: "PUBLICADO",
      imageUrl,
      ...nextCondition(),
    });
  }

  for (const [title, model, desc, imageUrl] of impagroImplementos) {
    sampleProducts.push({
      category: title.startsWith("Tolva") ? "Tolva" : title.startsWith("Rolo") || title.startsWith("Descompactador") ? "Implemento" : "Acoplado",
      brand: "Impagro",
      model,
      title,
      description: desc,
      sucursalId: alternateSucursal(),
      status: "PUBLICADO",
      imageUrl,
      ...nextCondition(),
    });
  }

  for (const [category, model, title, desc, imageUrl] of ascanelliProductos) {
    sampleProducts.push({
      category,
      brand: "Ascanelli",
      model,
      title,
      description: desc,
      sucursalId: alternateSucursal(),
      status: "PUBLICADO",
      imageUrl,
      ...nextCondition(),
    });
  }

  // Solo se publican productos con foto real confirmada — el resto (que no
  // se pudo fotografiar por bloqueos de descarga en el sitio del fabricante)
  // se deja afuera del seed en vez de mostrar una ficha sin imagen.
  const withPhoto = sampleProducts.filter((p) => p.imageUrl);

  for (const { imageUrl, ...p } of withPhoto) {
    await prisma.product.create({
      data: { ...p, images: { create: [{ url: imageUrl!, order: 0 }] } },
    });
  }

  console.log(`Seed OK — ${withPhoto.length} productos cargados (de ${sampleProducts.length} candidatos, solo los que tienen foto).`);
  console.log(`Sucursales: ${rioCuarto.nombre}, ${santaRosa.nombre}`);
  console.log(`Admin: ${admin.email} / password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
