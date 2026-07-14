# AGENTS.md

Project guide for anyone — human or AI agent — working in this repository. This file is the single source of truth for the project's conventions and workflows: if something changes, change it here.

## Git rules (non-negotiable)

- **Never commit directly to `main` or `dev`.** Everything goes through a PR.
- Feature/fix/chore branches start from `dev`; their PRs target `dev` — staging deploys automatically to Vercel preview.
- Only `release/vX.Y.Z` branches target `main` (production: `agostiniandrea.dev`).
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`). Never `git add -A`, never `--no-verify`.

## Release flow (`dev` → `main`)

`main` uses **squash-merge**, so released commits never appear in `main` with their original SHAs. This makes the following steps mandatory — skipping any of them corrupts the next release:

1. Create the release branch **from `main`**, never from `dev`:
   `git checkout -b release/vX.Y.Z origin/main`
2. **Cherry-pick only the new commits** from `dev` (verify by content, not by SHA — `git cherry` lies after squash-merges).
3. Bump `version` in `package.json` (semver: `feat` in the batch → minor). Commit as `chore: bump version to vX.Y.Z`.
4. Validate locally: `yarn test` and `yarn build` must pass.
5. Open the PR to `main` with title **exactly** `release: vX.Y.Z` (no `chore:` prefix, `v` included).
6. **After the merge, ALWAYS rebase `dev` onto `main`:**
   ```bash
   git checkout dev
   git fetch origin
   git rebase origin/main
   git push origin dev --force-with-lease
   ```
   This is the step that resets `dev`'s history after the squash. If you skip it, `dev` keeps showing already-released commits as "ahead of main" and the next release branch will drag them along. Do not substitute it with a merge or "sync" commit.

## Versioning

- Version lives in `package.json` only.
- Bump happens on the release branch, never on `dev`.

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

Every content change must be applied to both locales: `en` and `it`.

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

Theme values are accessed via `${({ theme }) => theme.xxx}` in styled components. Prefer theme tokens over raw CSS values whenever a matching token exists, and keep CSS properties inside each styled-components block sorted alphabetically.

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
