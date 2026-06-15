/**
 * Firebase Remote Config service.
 * Falls back to REMOTE_CONFIG_DEFAULTS when Firebase isn't configured or offline.
 */
import type { RemoteConfigValues } from "@/types";
import { REMOTE_CONFIG_DEFAULTS } from "@/config/remoteConfig";
import { getFirebaseApp } from "./firebase";

let _cachedValues: RemoteConfigValues | null = null;

export async function fetchRemoteConfig(): Promise<RemoteConfigValues> {
  // Return cached values (already fetched this session)
  if (_cachedValues) return _cachedValues;

  const app = getFirebaseApp();
  if (!app) {
    _cachedValues = { ...REMOTE_CONFIG_DEFAULTS };
    return _cachedValues;
  }

  try {
    const { getRemoteConfig, fetchAndActivate, getValue } = await import(
      "firebase/remote-config"
    );

    const rc = getRemoteConfig(app);
    rc.settings.minimumFetchIntervalMillis = 3600_000; // 1 hour
    rc.defaultConfig = REMOTE_CONFIG_DEFAULTS as unknown as Record<string, boolean>;

    await fetchAndActivate(rc);

    _cachedValues = {
      show_review_prompt: getValue(rc, "show_review_prompt").asBoolean(),
      show_share_button: getValue(rc, "show_share_button").asBoolean(),
      show_parking_history: getValue(rc, "show_parking_history").asBoolean(),
      show_qr_share: getValue(rc, "show_qr_share").asBoolean(),
      future_cloud_sync: getValue(rc, "future_cloud_sync").asBoolean(),
    };
  } catch {
    // Network error, Firebase not configured, etc.
    _cachedValues = { ...REMOTE_CONFIG_DEFAULTS };
  }

  return _cachedValues!;
}

/** Synchronous read from cache (returns defaults if not yet fetched). */
export function getRemoteConfigValue<K extends keyof RemoteConfigValues>(
  key: K
): RemoteConfigValues[K] {
  return _cachedValues?.[key] ?? REMOTE_CONFIG_DEFAULTS[key];
}
