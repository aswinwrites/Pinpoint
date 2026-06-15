/**
 * Unified analytics service.
 * Single call-site fires events to both Firebase Analytics and PostHog.
 * UI components NEVER import Firebase/PostHog directly — only this module.
 */
import type { AnalyticsEvent, AnalyticsParams } from "@/types";
import { firebaseLogEvent } from "./firebaseAnalytics";
import { posthogCapture } from "./posthog";

export async function track(event: AnalyticsEvent, params?: AnalyticsParams): Promise<void> {
  // Fire both in parallel; errors are swallowed inside each service
  await Promise.allSettled([
    firebaseLogEvent(event, params),
    posthogCapture(event, params),
  ]);
}

// ─── Convenience wrappers (typed, self-documenting) ──────────────────────────

export const Analytics = {
  appOpen: () => track("app_open"),

  parkingSaved: (hasNote: boolean, hasPhoto: boolean) =>
    track("parking_saved", { hasNote, hasPhoto, source: "camera" }),

  parkingDeleted: () => track("parking_deleted"),

  parkingReplaced: () => track("parking_replaced"),

  navigationStarted: () => track("navigation_started"),

  photoCaptured: () => track("photo_captured"),

  shareClicked: () => track("share_clicked"),

  shareSuccess: (method: string, hasImage: boolean) =>
    track("share_success", { method, hasImage }),

  shareFailed: (reason: string) => track("share_failed", { reason }),

  shareImageGenerated: () => track("share_image_generated"),

  locationPermissionGranted: () => track("location_permission_granted"),

  locationPermissionDenied: () => track("location_permission_denied"),

  pwaInstallPromptShown: () => track("pwa_install_prompt_shown"),

  pwaInstallAccepted: () => track("pwa_install_accepted"),

  distanceViewed: () => track("distance_viewed"),

  parkingViewed: () => track("parking_viewed"),

  firstVisit: () => track("first_visit"),

  returnVisit: () => track("return_visit"),
};
