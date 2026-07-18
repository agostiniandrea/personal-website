export type MobileTab = "home" | "work" | "story" | "forest";
export type MoreView = "skills" | "sustainability" | "beyond-code";
export type MobileView = MobileTab | MoreView;
export type StorySub = "journey" | "experience";
export type MoreDestination = MoreView | "experience";

export type MobileNavigationState = {
  mobileView?: MobileView;
  storySub?: StorySub;
};

export const MOBILE_TABS: MobileTab[] = ["home", "work", "story", "forest"];
export const MORE_VIEWS: MoreView[] = ["skills", "sustainability", "beyond-code"];

/* Section ids shown by each view; every other managed section is hidden.
   The story sub-view narrows further via data-story-sub. */
export const VIEW_SECTIONS: Record<MobileView, string[]> = {
  home: ["hero", "about"],
  work: ["projects"],
  story: ["journey", "experience"],
  forest: ["forest"],
  skills: ["skills"],
  sustainability: ["sustainability"],
  "beyond-code": ["beyond-code"],
};

const HASH_TO_VIEW: Record<string, { view: MobileView; storySub?: StorySub }> = {
  hero: { view: "home" },
  about: { view: "home" },
  projects: { view: "work" },
  journey: { view: "story", storySub: "journey" },
  experience: { view: "story", storySub: "experience" },
  forest: { view: "forest" },
  skills: { view: "skills" },
  sustainability: { view: "sustainability" },
  "beyond-code": { view: "beyond-code" },
};

/* The canonical hash pushed when a view is activated */
export const VIEW_TO_HASH: Record<MobileView, string> = {
  home: "hero",
  work: "projects",
  story: "journey",
  forest: "forest",
  skills: "skills",
  sustainability: "sustainability",
  "beyond-code": "beyond-code",
};

export function resolveViewFromHash(hash: string): {
  view: MobileView;
  storySub: StorySub;
} {
  const key = hash.replace(/^#/, "");
  const match = HASH_TO_VIEW[key];
  return {
    view: match?.view ?? "home",
    storySub: match?.storySub ?? "journey",
  };
}

export function resolveManagedHash(
  hash: string,
): { view: MobileView; storySub: StorySub } | null {
  const match = HASH_TO_VIEW[hash.replace(/^#/, "")];
  if (!match) return null;
  return {
    view: match.view,
    storySub: match.storySub ?? "journey",
  };
}

export function resolveViewFromState(
  state: MobileNavigationState | null,
  hash: string,
): { view: MobileView; storySub: StorySub } {
  if (state?.mobileView && VIEW_SECTIONS[state.mobileView]) {
    return {
      view: state.mobileView,
      storySub: state.storySub === "experience" ? "experience" : "journey",
    };
  }
  return resolveViewFromHash(hash);
}

/* Tab owning a view, for aria-current on the bottom navigation */
export function tabForView(view: MobileView): MobileTab | "more" {
  return (MOBILE_TABS as string[]).includes(view)
    ? (view as MobileTab)
    : "more";
}

/* Mirrors resolveViewFromHash before hydration so deep links never flash
   Home. Kept as a string: it is inlined in _document and must not rely on
   imports at runtime. Applies only on the homepage (tabs exist only there). */
export const PRE_HYDRATION_VIEW_SCRIPT = `(function(){try{var p=location.pathname.replace(/\\/+$/,'');if(p!==''&&p!=='/it')return;var m=${JSON.stringify(
  Object.fromEntries(
    Object.entries(HASH_TO_VIEW).map(([k, v]) => [
      k,
      [v.view, v.storySub ?? "journey"],
    ])
  )
)};var h=location.hash.replace('#','');var r=m[h]||["home","journey"];var d=document.documentElement;d.setAttribute('data-mobile-view',r[0]);d.setAttribute('data-story-sub',r[1]);}catch(e){}})()`;
