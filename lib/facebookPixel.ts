export const FACEBOOK_PIXEL_ID = "1822908852175880";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackFacebookEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  const standardEvents = new Set([
    "PageView",
    "Lead",
    "Schedule",
  ]);

  const trackMethod = standardEvents.has(eventName)
    ? "track"
    : "trackCustom";

  if (params && eventId) {
    window.fbq(trackMethod, eventName, params, {
      eventID: eventId,
    });
    return;
  }

  if (params) {
    window.fbq(trackMethod, eventName, params);
    return;
  }

  if (eventId) {
    window.fbq(trackMethod, eventName, {}, {
      eventID: eventId,
    });
    return;
  }

  window.fbq(trackMethod, eventName);
}