# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added

- **Journey module** — vertical life timeline with four chapters (Casalecchio di Reno, Turin, Amsterdam, Bangkok), age at arrival, copy, and a pulsing dot for the ongoing chapter ([#372](https://github.com/agostiniandrea/personal-website/pull/372))

---

## 2026-05-25

### Added

- **Light theme** — CSS custom properties replace hardcoded hex values in the color palette; `@media (prefers-color-scheme: light)` overrides the dark defaults. Zero JS, no hydration risk, no flash. Dark remains the default ([#361](https://github.com/agostiniandrea/personal-website/pull/361))

### Fixed

- Removed trailing `mb="3xl"` from the Sustainability module when `showCarbonBadge` is false, eliminating orphan whitespace at the bottom of the section ([#360](https://github.com/agostiniandrea/personal-website/pull/360))

---

## 2026-05-18

### Changed

- Removed Dependabot config and auto-merge workflow ([#371](https://github.com/agostiniandrea/personal-website/pull/371))

---

## 2026-05

### Added

- **Personal sections** — Sustainability, BeyondCode, and expanded About modules; transparent-on-scroll header; enriched footer with social links ([#358](https://github.com/agostiniandrea/personal-website/pull/358))
- Clickable project cards, improved hero spacing on mobile, scroll-to-top button ([#357](https://github.com/agostiniandrea/personal-website/pull/357))

---

## 2025-Q4 — Foundation

### Added

- **Design system ions** — `Heading`, `Grid`, `Box`, `Flex`, `Container`, `Text`, `Link`, `Button`, `Image`, `AspectRatio`, `Skeleton` ([#334](https://github.com/agostiniandrea/personal-website/pull/334), [#346](https://github.com/agostiniandrea/personal-website/pull/346))
- **Molecules** — `Badge`, `Drawer`, `HeadingBox`, `CarbonBadge`, `ScrollToTop` ([#346](https://github.com/agostiniandrea/personal-website/pull/346))
- **CMS modules** — `HeroPortfolio`, `About`, `Experience`, `Skills`, `Projects`, `Sustainability`, `BeyondCode`, `Contact`, `SiteHeader`, `SiteFooter` ([#331](https://github.com/agostiniandrea/personal-website/pull/331))
- **Dark palette** — near-black background (`#0a0a0f`) with Space Grotesk + Inter fonts ([#333](https://github.com/agostiniandrea/personal-website/pull/333))
- **i18n** — locale switcher with Next.js built-in routing + Contentful locale support ([#343](https://github.com/agostiniandrea/personal-website/pull/343), [#344](https://github.com/agostiniandrea/personal-website/pull/344))
- **WCAG 2.2 accessibility** — colour contrast fixes, ARIA roles, focus management, skip link ([#337](https://github.com/agostiniandrea/personal-website/pull/337), [#338](https://github.com/agostiniandrea/personal-website/pull/338), [#339](https://github.com/agostiniandrea/personal-website/pull/339))
- **Observability** — Sentry (server + edge), Vercel Analytics, Speed Insights ([#330](https://github.com/agostiniandrea/personal-website/pull/330))
- **Storybook + Vitest/Playwright** browser tests alongside Jest unit tests

### Changed

- Migrated all layout and typography to ion primitives, removing ad-hoc styled wrappers ([#345](https://github.com/agostiniandrea/personal-website/pull/345))
- Standardised all CSS values to theme tokens ([#347](https://github.com/agostiniandrea/personal-website/pull/347))
- Switched to Yarn 4 with Corepack for Vercel compatibility ([#351](https://github.com/agostiniandrea/personal-website/pull/351)–[#356](https://github.com/agostiniandrea/personal-website/pull/356))
