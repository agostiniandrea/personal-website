type Locale = "en" | "it";

const strings = {
  en: {
    closeMenu: "Close menu",
    goTo: (label: string) => `Go to ${label}`,
    mainNavigation: "Main navigation",
    mobileNavigation: "Mobile navigation",
    navigationMenu: "Navigation menu",
    openMenu: "Open menu",
    scrollDown: "Scroll down",
    scrollToTop: "Scroll to top",
    sectionNavigation: "Section navigation",
    skipToMainContent: "Skip to main content",
    switchToLocale: (name: string) => `Switch to ${name}`,
    viewProject: (title: string) => `View project: ${title}`,
  },
  it: {
    closeMenu: "Chiudi menu",
    goTo: (label: string) => `Vai a ${label}`,
    mainNavigation: "Navigazione principale",
    mobileNavigation: "Navigazione mobile",
    navigationMenu: "Menu di navigazione",
    openMenu: "Apri menu",
    scrollDown: "Scorri verso il basso",
    scrollToTop: "Torna all'inizio",
    sectionNavigation: "Navigazione sezioni",
    skipToMainContent: "Salta al contenuto principale",
    switchToLocale: (name: string) => `Passa a ${name}`,
    viewProject: (title: string) => `Vedi progetto: ${title}`,
  },
} as const;

export function useI18n(locale?: string) {
  const key: Locale = locale === "it" ? "it" : "en";
  return strings[key];
}

export const SECTION_LABELS: Record<string, Record<Locale, string>> = {
  "about":          { en: "About",          it: "Chi sono" },
  "beyond-code":    { en: "Beyond Code",    it: "Oltre il codice" },
  "experience":     { en: "Experience",     it: "Esperienza" },
  "forest":         { en: "Forest",         it: "Foresta" },
  "hero":           { en: "Home",           it: "Home" },
  "journey":        { en: "Journey",        it: "Percorso" },
  "projects":       { en: "Projects",       it: "Progetti" },
  "skills":         { en: "Skills",         it: "Competenze" },
  "sustainability": { en: "Sustainability", it: "Sostenibilità" },
};
