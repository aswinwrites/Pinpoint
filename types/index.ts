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
  | "app_open"
  | "parking_saved"
  | "parking_deleted"
  | "parking_replaced"
  | "navigation_started"
  | "photo_captured"
  | "share_clicked"
  | "share_success"
  | "share_failed"
  | "share_image_generated"
  | "location_permission_granted"
  | "location_permission_denied"
  | "pwa_install_prompt_shown"
  | "pwa_install_accepted"
  | "distance_viewed"
  | "parking_viewed"
  | "first_visit"
  | "return_visit";

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
