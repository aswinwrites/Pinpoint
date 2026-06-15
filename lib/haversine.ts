/**
 * Haversine formula — great-circle distance between two GPS points.
 * Returns metres.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6_371_000; // Earth radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Human-friendly distance string: "45m away" | "1.2 km away" */
export function formatDistance(metres: number): string {
  if (metres < 1000) {
    return `${Math.round(metres)}m away`;
  }
  return `${(metres / 1000).toFixed(1)} km away`;
}
