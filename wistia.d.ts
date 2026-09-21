import type React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "wistia-player": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "media-id"?: string;
        aspect?: string | number;
      };
    }
  }
}

declare global {
  interface Window {
    _wq?: Array<{
      id: string;
      onReady: (video: any) => void;
    }>;
    Wistia?: any;
  }
}

export {};