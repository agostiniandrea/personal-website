# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Git Workflow

**Never commit directly to `main`.** All changes must go through a PR. Branch from `main`, following JIBE Gitflow conventions (see global CLAUDE.md).

## Commands

```bash
yarn dev                # dev server at localhost:3000
yarn build              # lint:fix → next build → sitemap (full production build)
yarn build:compile      # next build only
yarn lint               # ESLint, quiet mode
yarn lint:fix           # ESLint with auto-fix
yarn prettier:fix       # Prettier across the repo
yarn test               # Jest (all *.test.tsx under components/)
yarn test:watch         # Jest in watch mode
yarn test:coverage      # Jest with coverage report
yarn storybook          # Storybook dev at localhost:6006
yarn build-storybook    # Build Storybook static output
yarn chromatic          # Visual regression via Chromatic (requires CHROMATIC_PROJECT_TOKEN)
```

Run a single test file:
```bash
yarn test -- components/ions/Button/__tests__/Button.test.tsx
```

## Architecture Overview

**Next.js 16, Pages Router** — this project uses `pages/`, not the App Router. All pages use `getStaticProps` + ISR.

### CMS: Contentful

Content is fetched from Contentful in `lib/utils/cms/index.ts`. Two content types are mapped to page routes:

| Contentful type | Route | Notes |
|---|---|---|
| `pageLanding` | `pages/index.tsx` | Home |
| `pageDetail` | `pages/[slug].tsx` | All other pages, keyed by `uid` field |

Pages are built at static time via `getPaths` / `getStaticProps`, with `revalidate` for ISR.

### Module System

Contentful modules within a page are rendered by `organisms/ModuleRenderer`. The flow is:

1. `getPageContent` in `lib/utils/cms` flattens Contentful entries into `TPageModule[]` (with `id`, `type`, `fields`)
2. `ModuleRenderer` iterates and passes each to `ModuleMatrix`
3. `ModuleMatrix` switches on `type` (from `constants/modules.ts`) and renders the matching `components/cms/` component
4. `cleanProps` normalises Contentful field shapes — particularly images — before spreading onto the component

**To add a new CMS module:**
1. Add the Contentful content type ID to `constants/modules.ts`
2. Create the component in `components/cms/YourModule/`
3. Add a `case` in the `ModuleMatrix` switch in `organisms/ModuleRenderer/ModuleRenderer.tsx`

### Component Hierarchy

```
atoms      — meta/non-visual (Head, Seo)
ions       — primitive UI building blocks (Button, Box, Flex, Container, Image, Link, Text, AspectRatio)
molecules  — composed from ions (HeadingBox, CarbonBadge)
organisms  — page-level sections (SiteHeader, SiteFooter, ModuleRenderer)
cms        — Contentful-driven page modules (HeroPortfolio, About, Experience, Skills, Projects, Journey, BeyondCode, Sustainability, Contact)
```

Each tier barrel-exports via its `index.ts`.

### Styling

styled-components with a ThemeProvider wrapping the entire app (`pages/_app.tsx`). Theme is composed in `config/theme.tsx` from:
- `config/customizations/` — colors, fonts, spacing, typography, radii, line-heights
- `config/componentThemes/` — per-component token overrides (button, link)
- `constants/breakpoints.ts` — breakpoint values

Theme values are accessed via `${({ theme }) => theme.xxx}` in styled components.

### Global Types

`ImageProps` and `CtaProps` are declared globally in `lib/global/index.d.ts` — available everywhere without imports.

### Path Aliases

```
@components/*  →  components/*
@config/*      →  config/*
@constants     →  constants/
@lib/*         →  lib/*
@utils/*       →  lib/utils/*
@test-utils/*  →  test-utils/*
```

### Observability

- **Sentry**: server + edge config in `sentry.server.config.ts` / `sentry.edge.config.ts`, wired via `instrumentation.ts`
- **Vercel Analytics + Speed Insights**: injected in `_app.tsx`

### Testing

- **Jest** (`yarn test`): unit tests for components, files matching `components/**/*.test.tsx`, uses `ts-jest` with `jsdom`
- **Vitest + Playwright** (`vitest.config.ts`): runs Storybook stories as browser tests via `@storybook/addon-vitest`

### Environment Variables

Copy `.env.template` to `.env.local`. Required for local dev:

```
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN
NEXT_PUBLIC_CONTENTFUL_SPACE_ID
```

Sentry source map uploads require `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`. Google Analytics requires `NEXT_PUBLIC_GA_ID`.
