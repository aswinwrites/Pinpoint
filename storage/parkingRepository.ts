/**
 * ParkingRepository — abstraction over IndexedDB (Dexie).
 * Business logic lives here, not in components.
 * Architecture is forward-compatible with cloud sync (just swap the impl).
 */

import { getDB } from "./db";
import type { ParkingSpot, VehicleType } from "@/types";
import { nanoid } from "./nanoid";

const MAX_HISTORY = 5;

// ─── Reads ────────────────────────────────────────────────────────────────────

/** Returns the most recently saved spot, or null. */
export async function getActiveSpot(): Promise<ParkingSpot | null> {
  const db = getDB();
  const spots = await db.spots.orderBy("createdAt").reverse().limit(1).toArray();
  return spots[0] ?? null;
}

/** Returns up to MAX_HISTORY spots, newest first. */
export async function getParkingHistory(): Promise<ParkingSpot[]> {
  const db = getDB();
  return db.spots.orderBy("createdAt").reverse().limit(MAX_HISTORY).toArray();
}

/** Returns a single spot by id. */
export async function getSpotById(id: string): Promise<ParkingSpot | null> {
  const db = getDB();
  return (await db.spots.get(id)) ?? null;
}

// ─── Writes ───────────────────────────────────────────────────────────────────

export interface SaveSpotInput {
  latitude: number;
  longitude: number;
  photo?: string;
  note?: string;
  vehicleType?: VehicleType;
  vehicleName?: string;
}

export async function saveSpot(input: SaveSpotInput): Promise<ParkingSpot> {
  const db = getDB();
  const now = Date.now();

  const spot: ParkingSpot = {
    id: nanoid(),
    latitude: input.latitude,
    longitude: input.longitude,
    timestamp: now,
    photo: input.photo,
    note: input.note?.trim() || undefined,
    vehicleType: input.vehicleType ?? "car",
    vehicleName: input.vehicleName?.trim() || undefined,
    createdAt: now,
  };

  await db.spots.add(spot);

  // Trim history — keep only MAX_HISTORY spots
  const allSpots = await db.spots.orderBy("createdAt").toArray();
  if (allSpots.length > MAX_HISTORY) {
    const toDelete = allSpots.slice(0, allSpots.length - MAX_HISTORY);
    await db.spots.bulkDelete(toDelete.map((s) => s.id));
  }

  return spot;
}

export async function deleteSpot(id: string): Promise<void> {
  const db = getDB();
  await db.spots.delete(id);
}

export async function clearAllSpots(): Promise<void> {
  const db = getDB();
  await db.spots.clear();
}
