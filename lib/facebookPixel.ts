export const FACEBOOK_PIXEL_ID = "1713521296369712";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackFacebookEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;

  if (params) {
    window.fbq("trackCustom", eventName, params);
    return;
  }

  window.fbq("trackCustom", eventName);
}
