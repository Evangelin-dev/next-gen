"use client";

import Script from "next/script";
import { FACEBOOK_PIXEL_ID } from "@/lib/facebookPixel";

export default function MetaPixel() {
  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        src="https://connect.facebook.net/en_US/fbevents.js"
        onLoad={() => {
          window.fbq?.("init", FACEBOOK_PIXEL_ID);
          window.fbq?.("track", "PageView");
        }}
      />

      <Script id="facebook-pixel-setup" strategy="afterInteractive">
        {`
          window.fbq = window.fbq || function() {
            window.fbq.callMethod
              ? window.fbq.callMethod.apply(window.fbq, arguments)
              : window.fbq.queue.push(arguments);
          };

          window.fbq.push = window.fbq;
          window.fbq.loaded = true;
          window.fbq.version = "2.0";
          window.fbq.queue = [];
        `}
      </Script>

      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}