export const FACEBOOK_PIXEL_ID = "1822908852175880";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackFacebookEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;

  const standardEvents = new Set(["PageView", "Lead", "Schedule"]);
  const trackMethod = standardEvents.has(eventName) ? "track" : "trackCustom";

  if (params) {
    window.fbq(trackMethod, eventName, params);
    return;
  }

  window.fbq(trackMethod, eventName);
}