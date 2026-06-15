"use client";

import { useState, useEffect, useRef } from "react";
import { haversineDistance, formatDistance } from "@/lib/haversine";
import { getCurrentPosition } from "@/lib/geolocation";

const REFRESH_INTERVAL_MS = 30_000; // 30 seconds

export function useDistance(targetLat?: number, targetLng?: number) {
  const [distanceText, setDistanceText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (targetLat === undefined || targetLng === undefined) return;

    async function updateDistance() {
      try {
        const pos = await getCurrentPosition(false); // low accuracy ok here
        const metres = haversineDistance(
          pos.latitude,
          pos.longitude,
          targetLat!,
          targetLng!
        );
        setDistanceText(formatDistance(metres));
        setError(null);
      } catch {
        setError("Location unavailable");
      }
    }

    updateDistance();
    timerRef.current = setInterval(updateDistance, REFRESH_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [targetLat, targetLng]);

  return { distanceText, error };
}
