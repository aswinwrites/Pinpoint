import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a duration in ms as "2h 34m" or "45m" */
export function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Format timestamp to "14 Jun 2026, 11:45 AM" */
export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Format relative time "Parked 2h 34m ago" */
export function formatParkedAgo(ts: number): string {
  const ms = Date.now() - ts;
  return `Parked ${formatDuration(ms)} ago`;
}

/** Build WhatsApp share URL */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/** Build Google Maps coordinate link */
export function buildMapsLink(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

/** Build share message text */
export function buildShareMessage(
  lat: number,
  lng: number,
  ts: number,
  note?: string
): string {
  const parts = [
    "🚗 My vehicle is parked here.",
    "",
    `📍 Location:\nhttps://maps.google.com/?q=${lat},${lng}`,
    "",
    `🕒 Parked:\n${formatTimestamp(ts)}`,
  ];

  if (note) {
    parts.push("", `📝 Note:\n${note}`);
  }

  parts.push("", "Shared via PinPoint");
  return parts.join("\n");
}

export function vehicleEmoji(type: string): string {
  const map: Record<string, string> = {
    car: "🚗",
    motorcycle: "🏍",
    bicycle: "🚲",
    other: "🚘",
  };
  return map[type] ?? "🚘";
}
