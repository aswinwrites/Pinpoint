import Dexie, { type Table } from "dexie";
import type { ParkingSpot } from "@/types";

class PinPointDB extends Dexie {
  spots!: Table<ParkingSpot>;

  constructor() {
    super("PinPointDB");

    this.version(1).stores({
      // Index: id (primary), createdAt (for history ordering)
      spots: "id, createdAt",
    });
  }
}

// Singleton — safe in module scope (Next.js client-only)
let _db: PinPointDB | null = null;

export function getDB(): PinPointDB {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }
  if (!_db) {
    _db = new PinPointDB();
  }
  return _db;
}

export type { PinPointDB };
