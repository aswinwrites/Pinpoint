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
    const {
      getAnalytics: _getAnalytics,
      isSupported,
      setAnalyticsCollectionEnabled,
      setUserProperties,
    } = await import("firebase/analytics");
    if (!(await isSupported())) return null;
    if (!_analytics) {
      _analytics = _getAnalytics(app);
      setAnalyticsCollectionEnabled(_analytics, true);
      // User properties for segmentation in Firebase / GA4
      setUserProperties(_analytics, {
        app_version: "1.0.0",
        platform: typeof navigator !== "undefined"
          ? (/iphone|ipad|ipod/i.test(navigator.userAgent) ? "ios"
            : /android/i.test(navigator.userAgent) ? "android"
            : "desktop")
          : "unknown",
        pwa_installed: window.matchMedia("(display-mode: standalone)").matches
          ? "true"
          : "false",
      });
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
