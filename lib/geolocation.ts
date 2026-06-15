import type { Coordinates, LocationPermission } from "@/types";

export async function checkLocationPermission(): Promise<LocationPermission> {
  if (!navigator.geolocation) return "unavailable";

  try {
    const result = await navigator.permissions.query({ name: "geolocation" });
    return result.state as LocationPermission;
  } catch {
    return "prompt";
  }
}

export function getCurrentPosition(
  highAccuracy = true
): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => reject(err),
      {
        enableHighAccuracy: highAccuracy,
        timeout: 15_000,
        maximumAge: 5_000,
      }
    );
  });
}

export function mapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function staticMapsUrl(lat: number, lng: number, zoom = 15): string {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=400x200&markers=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? ""}`;
}
