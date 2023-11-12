declare global {
  type CtaProps = {
    name: string;
    label: string;
    url: string;
  }
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
