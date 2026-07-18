import type { ReactElement } from "react";

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export const NAV_ICONS: Record<string, ReactElement> = {
  home: (
    <svg {...iconProps}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M10 21v-6h4v6" />
    </svg>
  ),
  work: (
    <svg {...iconProps}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 12h18" />
    </svg>
  ),
  story: (
    <svg {...iconProps}>
      <path d="M12 5.5C10 3.8 7.2 3.5 4 4v15c3.2-.5 6-.2 8 1.5 2-1.7 4.8-2 8-1.5V4c-3.2-.5-6-.2-8 1.5Z" />
      <path d="M12 5.5V20.5" />
    </svg>
  ),
  forest: (
    <svg {...iconProps}>
      <path d="M12 3c-4 4.5-6 7.5-6 10a6 6 0 0 0 12 0c0-2.5-2-5.5-6-10Z" />
      <path d="M12 21v-8" />
    </svg>
  ),
  more: (
    <svg {...iconProps}>
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </svg>
  ),
};
