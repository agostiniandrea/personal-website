type Locale = "en" | "it";

const strings = {
  en: {
    closeMenu: "Close menu",
    co2LifetimeSuffix: "lifetime estimate",
    co2TooltipBody:
      "Estimated CO₂ capture over the trees’ expected lifetime, based on Tree-Nation data.",
    co2TooltipLabel: "About the CO₂ estimate",
    feedbackNudgeBody:
      "Your feedback helps fund real trees and improve this portfolio.",
    feedbackNudgeCta: "See how it grows",
    feedbackNudgeDismiss: "Dismiss feedback prompt",
    feedbackNudgeTitle: "Ideas that grow into trees.",
    forestInlineCta: "Explore the Forest",
    forestInlineEyebrow: "GROWING THROUGH FEEDBACK",
    forestInlineHeading: "Thoughtful feedback grows into real trees.",
    forestInlineMetric: (feedbackTrees: number, totalTrees: number) =>
      `${feedbackTrees} trees planted through portfolio feedback · ${totalTrees} trees in my forest`,
    goTo: (label: string) => `Go to ${label}`,
    mainNavigation: "Main navigation",
    mobileNavigation: "Mobile navigation",
    moreDownloadCv: "Download CV",
    moreLanguage: "Language",
    moreTitle: "Explore",
    navigationMenu: "Navigation menu",
    openMenu: "Open menu",
    speciesLabel: "species",
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
    co2LifetimeSuffix: "stima sul ciclo di vita",
    co2TooltipBody:
      "Stima della CO₂ assorbita durante il ciclo di vita previsto degli alberi, basata sui dati di Tree-Nation.",
    co2TooltipLabel: "Informazioni sulla stima della CO₂",
    feedbackNudgeBody:
      "Il tuo feedback aiuta a finanziare alberi reali e migliorare questo portfolio.",
    feedbackNudgeCta: "Scopri come cresce",
    feedbackNudgeDismiss: "Chiudi l'invito al feedback",
    feedbackNudgeTitle: "Idee che diventano alberi.",
    forestInlineCta: "Esplora la Forest",
    forestInlineEyebrow: "CRESCERE GRAZIE AI FEEDBACK",
    forestInlineHeading: "I feedback attenti diventano alberi reali.",
    forestInlineMetric: (feedbackTrees: number, totalTrees: number) =>
      `${feedbackTrees} alberi piantati grazie ai feedback sul portfolio · ${totalTrees} alberi nella mia foresta`,
    goTo: (label: string) => `Vai a ${label}`,
    mainNavigation: "Navigazione principale",
    mobileNavigation: "Navigazione mobile",
    moreDownloadCv: "Scarica il CV",
    moreLanguage: "Lingua",
    moreTitle: "Esplora",
    navigationMenu: "Menu di navigazione",
    openMenu: "Apri menu",
    speciesLabel: "specie",
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
  about: { en: "About", it: "Chi sono" },
  "beyond-code": { en: "Beyond Code", it: "Oltre il codice" },
  experience: { en: "Experience", it: "Esperienza" },
  forest: { en: "Forest", it: "Foresta" },
  hero: { en: "Home", it: "Home" },
  journey: { en: "Journey", it: "Percorso" },
  projects: { en: "Projects", it: "Progetti" },
  skills: { en: "Skills", it: "Competenze" },
  sustainability: { en: "Sustainability", it: "Sostenibilità" },
};
