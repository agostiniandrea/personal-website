import { BREAKPOINTS } from "@constants";

export const getImageSizes = (sizes: string[] = []): string => {
  if (sizes.length === 0) return "100vw";

  const breakpointsValues = Object.values(BREAKPOINTS);

  const breakpoints = breakpointsValues.slice(1, breakpointsValues.length);

  const fallbackWidth = sizes[sizes.length - 1];

  return (
    Array.from(
      { length: 4 },
      (_, i) => `(max-width: ${breakpoints[i]}) ${sizes[i] || fallbackWidth}`,
    ).join() +
    "," +
    (sizes[4] || fallbackWidth)
  );
};
