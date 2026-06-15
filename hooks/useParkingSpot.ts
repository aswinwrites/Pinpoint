"use client";

import { useState, useEffect, useCallback } from "react";
import type { ParkingSpot } from "@/types";
import { getActiveSpot, deleteSpot as deleteSpotFromDB } from "@/storage/parkingRepository";

interface ParkingSpotState {
  spot: ParkingSpot | null;
  loading: boolean;
  error: string | null;
}

export function useParkingSpot() {
  const [state, setState] = useState<ParkingSpotState>({
    spot: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    try {
      const spot = await getActiveSpot();
      setState({ spot, loading: false, error: null });
    } catch {
      setState({ spot: null, loading: false, error: "Failed to load parking data." });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const deleteSpot = useCallback(async () => {
    if (!state.spot) return;
    await deleteSpotFromDB(state.spot.id);
    setState({ spot: null, loading: false, error: null });
  }, [state.spot]);

  return { ...state, refresh, deleteSpot };
}
