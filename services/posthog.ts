/**
 * PostHog wrapper — lazy init, no-ops gracefully when unconfigured.
 */
let _initialized = false;

async function getPostHog() {
  if (typeof window === "undefined") return null;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  if (!_initialized) {
    const posthog = (await import("posthog-js")).default;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      capture_pageview: false, // We handle this manually
      persistence: "localStorage+cookie",
    });
    _initialized = true;
  }

  const posthog = (await import("posthog-js")).default;
  return posthog;
}

export async function posthogCapture(
  event: string,
  properties?: Record<string, string | number | boolean | undefined>
): Promise<void> {
  try {
    const ph = await getPostHog();
    ph?.capture(event, properties);
  } catch {
    // Never crash
  }
}

export async function posthogIdentify(distinctId: string): Promise<void> {
  try {
    const ph = await getPostHog();
    ph?.identify(distinctId);
  } catch {
    // Never crash
  }
}
