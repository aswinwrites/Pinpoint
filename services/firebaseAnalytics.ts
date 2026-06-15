/**
 * Firebase Analytics wrapper.
 * Lazy-loads analytics so it doesn't block render.
 * Silently no-ops if Firebase isn't configured.
 */
import type { Analytics } from "firebase/analytics";
import { getFirebaseApp } from "./firebase";

let _analytics: Analytics | null = null;

async function getAnalytics(): Promise<Analytics | null> {
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    const { getAnalytics: _getAnalytics, isSupported } = await import("firebase/analytics");
    if (!(await isSupported())) return null;
    if (!_analytics) {
      _analytics = _getAnalytics(app);
    }
    return _analytics;
  } catch {
    return null;
  }
}

export async function firebaseLogEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<void> {
  try {
    const analytics = await getAnalytics();
    if (!analytics) return;
    const { logEvent } = await import("firebase/analytics");
    logEvent(analytics, eventName, params);
  } catch {
    // Never let analytics crash the app
  }
}
