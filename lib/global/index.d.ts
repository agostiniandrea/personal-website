declare global {
  interface Window {
    clarity?: (command: "event", eventName: string) => void;
    gtag?: (
      command: "event",
      eventName: string,
      params?: Record<string, string>,
    ) => void;
  }

  type CtaProps = {
    name: string;
    label: string;
    url: string;
  };
  type ImageProps = {
    alt: string;
    height: number;
    mobile_height?: string;
    mobile_url?: string;
    mobile_width?: string;
    type: string;
    url: string;
    width: number;
  };
}

export {};
