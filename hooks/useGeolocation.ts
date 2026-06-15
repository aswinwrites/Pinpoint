"use client";

import { useState, useCallback } from "react";
import type { Coordinates, LocationPermission } from "@/types";
import { getCurrentPosition, checkLocationPermission } from "@/lib/geolocation";
import { Analytics } from "@/services/analytics";

interface GeolocationState {
  coordinates: Coordinates | null;
  permission: LocationPermission | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    permission: null,
    loading: false,
    error: null,
  });

  const requestLocation = useCallback(async (): Promise<Coordinates | null> => {
    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const permission = await checkLocationPermission();
      setState((s) => ({ ...s, permission }));

      if (permission === "unavailable") {
        setState((s) => ({
          ...s,
          loading: false,
          error: "Location services are not available on this device.",
        }));
        return null;
      }

      const coords = await getCurrentPosition();
      setState({ coordinates: coords, permission: "granted", loading: false, error: null });
      Analytics.locationPermissionGranted();
      return coords;
    } catch (err: unknown) {
      const isPermissionDenied =
        err instanceof GeolocationPositionError && err.code === 1;

      const message = isPermissionDenied
        ? "Location permission denied. Please enable it in your browser settings."
        : "Couldn't get your location. Please try again.";

      setState((s) => ({
        ...s,
        loading: false,
        error: message,
        permission: isPermissionDenied ? "denied" : s.permission,
      }));

      if (isPermissionDenied) Analytics.locationPermissionDenied();
      return null;
    }
  }, []);

  return { ...state, requestLocation };
}
