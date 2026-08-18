type SucursalCoords = { id: string; nombre: string; latitude: number; longitude: number };

/** Distancia en km entre dos puntos (fórmula de Haversine). */
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Devuelve la sucursal más cercana a unas coordenadas GPS, con la distancia en km. */
export function nearestSucursal<T extends SucursalCoords>(
  lat: number,
  lng: number,
  sucursales: T[]
): { sucursal: T; distanceKm: number } | null {
  if (sucursales.length === 0) return null;
  let best = sucursales[0];
  let bestDist = distanceKm(lat, lng, best.latitude, best.longitude);
  for (const s of sucursales.slice(1)) {
    const d = distanceKm(lat, lng, s.latitude, s.longitude);
    if (d < bestDist) {
      best = s;
      bestDist = d;
    }
  }
  return { sucursal: best, distanceKm: bestDist };
}
