import type { RemoteConfigValues } from "@/types";

/** Default values used when Remote Config is unavailable (offline, no Firebase) */
export const REMOTE_CONFIG_DEFAULTS: RemoteConfigValues = {
  show_review_prompt: false,
  show_share_button: true,
  show_parking_history: true,
  show_qr_share: true,
  future_cloud_sync: false,
};
