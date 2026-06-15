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
  // ── Session ────────────────────────────────────────────────────────────────
  appOpen: () => track("app_open"),

  firstVisit: () => track("first_visit"),

  returnVisit: () => track("return_visit"),

  // ── Save flow ──────────────────────────────────────────────────────────────
  /** User tapped the "Save Parking Spot" CTA on the empty state */
  saveSpotClicked: () => track("save_spot_clicked"),

  /** User tapped "Use My Location" in the save flow */
  locationRequested: () => track("location_requested"),

  locationPermissionGranted: () => track("location_permission_granted"),

  locationPermissionDenied: () => track("location_permission_denied"),

  photoCaptured: () => track("photo_captured"),

  /** User typed a note before saving */
  parkingNoteEntered: (noteLength: number) =>
    track("parking_note_entered", { note_length: noteLength }),

  /**
   * Spot successfully saved.
   * Passes rounded coordinates (2dp ≈ city-level) for geo heatmaps.
   */
  parkingSaved: (
    hasNote: boolean,
    hasPhoto: boolean,
    lat?: number,
    lng?: number
  ) =>
    track("parking_saved", {
      has_note: hasNote,
      has_photo: hasPhoto,
      geo_lat: lat != null ? Math.round(lat * 100) / 100 : undefined,
      geo_lng: lng != null ? Math.round(lng * 100) / 100 : undefined,
    }),

  /** Fired only on a user's very first successful save */
  firstParkingSaved: (lat?: number, lng?: number) =>
    track("first_parking_saved", {
      geo_lat: lat != null ? Math.round(lat * 100) / 100 : undefined,
      geo_lng: lng != null ? Math.round(lng * 100) / 100 : undefined,
    }),

  parkingDeleted: () => track("parking_deleted"),

  parkingReplaced: () => track("parking_replaced"),

  parkingViewed: () => track("parking_viewed"),

  // ── Navigation ─────────────────────────────────────────────────────────────
  navigationStarted: () => track("navigation_started"),

  // ── Share ──────────────────────────────────────────────────────────────────
  shareClicked: () => track("share_clicked"),

  /** Specifically WhatsApp — separate from generic share_clicked */
  whatsappShareClicked: (hasPhoto: boolean) =>
    track("whatsapp_share_clicked", { has_photo: hasPhoto }),

  shareSuccess: (method: string, hasImage: boolean) =>
    track("share_success", { method, has_image: hasImage }),

  shareFailed: (reason: string) => track("share_failed", { reason }),

  shareImageGenerated: () => track("share_image_generated"),

  // ── PWA ────────────────────────────────────────────────────────────────────
  pwaInstallPromptShown: () => track("pwa_install_prompt_shown"),

  pwaInstalled: () => track("pwa_installed"),

  // ── Misc ───────────────────────────────────────────────────────────────────
  distanceViewed: () => track("distance_viewed"),
};
