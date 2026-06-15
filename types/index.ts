// ─── Core Domain Types ───────────────────────────────────────────────────────

export type VehicleType = "car" | "motorcycle" | "bicycle" | "other";

export interface ParkingSpot {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number; // ms since epoch
  photo?: string; // base64 data URL
  note?: string;
  vehicleType: VehicleType;
  vehicleName?: string;
  createdAt: number;
  // future: updatedAt, syncedAt, userId
}

// ─── Geolocation ─────────────────────────────────────────────────────────────

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export type LocationPermission = "granted" | "denied" | "prompt" | "unavailable";

// ─── Analytics ───────────────────────────────────────────────────────────────

export type AnalyticsEvent =
  // Session
  | "app_open"
  | "first_visit"
  | "return_visit"
  // Save flow
  | "save_spot_clicked"           // tapped "Save Parking Spot" CTA
  | "location_requested"          // tapped "Use My Location"
  | "location_permission_granted"
  | "location_permission_denied"
  | "photo_captured"
  | "parking_note_entered"        // user typed a note before saving
  | "parking_saved"               // spot successfully saved
  | "first_parking_saved"         // very first save ever
  | "parking_deleted"
  | "parking_replaced"
  | "parking_viewed"
  // Navigation
  | "navigation_started"
  // Share
  | "share_clicked"
  | "whatsapp_share_clicked"
  | "share_success"
  | "share_failed"
  | "share_image_generated"
  // PWA
  | "pwa_install_prompt_shown"
  | "pwa_installed"
  // Misc
  | "distance_viewed";

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

// ─── Remote Config ────────────────────────────────────────────────────────────

export interface RemoteConfigValues {
  show_review_prompt: boolean;
  show_share_button: boolean;
  show_parking_history: boolean;
  show_qr_share: boolean;
  future_cloud_sync: boolean;
}

// ─── Share ────────────────────────────────────────────────────────────────────

export type ShareMethod = "web_share" | "whatsapp" | "copy" | "image";

export interface SharePayload {
  spot: ParkingSpot;
  distanceText?: string;
}

// ─── UI State ────────────────────────────────────────────────────────────────

export type SaveStep = "location" | "photo" | "note" | "saving" | "done";

export interface SaveFlowState {
  step: SaveStep;
  coordinates?: Coordinates;
  photo?: string;
  note: string;
  vehicleType: VehicleType;
  vehicleName: string;
  error?: string;
}
