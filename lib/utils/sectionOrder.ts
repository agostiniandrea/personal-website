import { MODULES } from "@constants";

export const DESKTOP_SECTION_ORDER = [
  "hero",
  "about",
  "projects",
  "skills",
  "experience",
  "journey",
  "sustainability",
  "beyond-code",
  "forest",
  "contact",
] as const;

export type DesktopSectionId = (typeof DESKTOP_SECTION_ORDER)[number];

export const DESKTOP_MODULE_ORDER: Record<string, number> = {
  [MODULES.HERO_PORTFOLIO]: 0,
  [MODULES.ABOUT]: 1,
  [MODULES.PROJECTS]: 2,
  [MODULES.SKILLS]: 3,
  [MODULES.EXPERIENCE]: 4,
  [MODULES.JOURNEY]: 5,
  [MODULES.SUSTAINABILITY]: 6,
  [MODULES.BEYOND_CODE]: 7,
  [MODULES.FOREST]: 8,
  [MODULES.CONTACT]: 9,
};

export const ANALYTICS_SECTION_NAMES: Record<DesktopSectionId, string> = {
  hero: "home",
  about: "about",
  projects: "selected_projects",
  skills: "skills",
  experience: "experience",
  journey: "journey",
  sustainability: "sustainability",
  "beyond-code": "beyond_code",
  forest: "forest",
  contact: "contact",
};

export const sectionRankFromUrl = (url: string): number => {
  const hash = url.split("#")[1];
  if (!hash) return url === "/" ? 0 : Number.MAX_SAFE_INTEGER;
  const index = DESKTOP_SECTION_ORDER.indexOf(hash as DesktopSectionId);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};
