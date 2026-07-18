type Locale = "en" | "it";

const strings = {
  en: {
    closeMenu: "Close menu",
    goTo: (label: string) => `Go to ${label}`,
    mainNavigation: "Main navigation",
    mobileNavigation: "Mobile navigation",
    moreDownloadCv: "Download CV",
    moreLanguage: "Language",
    moreTitle: "Explore",
    navigationMenu: "Navigation menu",
    openMenu: "Open menu",
    scrollDown: "Scroll down",
    scrollToTop: "Scroll to top",
    sectionNavigation: "Section navigation",
    skipToMainContent: "Skip to main content",
    storySubNavigation: "Story sections",
    switchToLocale: (name: string) => `Switch to ${name}`,
    tabForest: "Forest",
    tabHome: "Home",
    tabMore: "More",
    tabStory: "Story",
    tabWork: "Work",
    viewProject: (title: string) => `View project: ${title}`,
  },
  it: {
    closeMenu: "Chiudi menu",
    goTo: (label: string) => `Vai a ${label}`,
    mainNavigation: "Navigazione principale",
    mobileNavigation: "Navigazione mobile",
    moreDownloadCv: "Scarica il CV",
    moreLanguage: "Lingua",
    moreTitle: "Esplora",
    navigationMenu: "Menu di navigazione",
    openMenu: "Apri menu",
    scrollDown: "Scorri verso il basso",
    scrollToTop: "Torna all'inizio",
    sectionNavigation: "Navigazione sezioni",
    skipToMainContent: "Salta al contenuto principale",
    storySubNavigation: "Sezioni del percorso",
    switchToLocale: (name: string) => `Passa a ${name}`,
    tabForest: "Forest",
    tabHome: "Home",
    tabMore: "Altro",
    tabStory: "Percorso",
    tabWork: "Progetti",
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
