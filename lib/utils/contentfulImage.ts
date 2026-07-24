type FocusArea =
  | "face"
  | "faces"
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right";

interface ContentfulImageOptions {
  width: number;
  height: number;
  focus?: FocusArea;
}

export function contentfulImageUrl(
  url: string,
  { width, height, focus = "center" }: ContentfulImageOptions,
): string {
  const base = url.split("?")[0];
  const params = new URLSearchParams({
    w: String(width),
    h: String(height),
    fit: "crop",
    f: focus,
  });
  return `${base}?${params}`;
}
