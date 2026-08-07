import { BookOpen, Briefcase, Ellipsis, House, TreeDeciduous } from "lucide-react";
import type { ReactElement } from "react";

/* Lucide, so the tab bar shares one grid and stroke with the rest of the UI. */
const iconProps = {
  "aria-hidden": true,
  absoluteStrokeWidth: true,
  size: 22,
  strokeWidth: 1.75,
} as const;

export const NAV_ICONS: Record<string, ReactElement> = {
  home: <House {...iconProps} />,
  work: <Briefcase {...iconProps} />,
  story: <BookOpen {...iconProps} />,
  forest: <TreeDeciduous {...iconProps} />,
  more: <Ellipsis {...iconProps} />,
};
