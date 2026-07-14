# Andrea Agostini — Personal Website

Personal portfolio and sustainability initiative built with Next.js and Contentful. Covers professional experience, projects, skills, a life journey timeline, and the **Forest** — a feedback feature that plants a real tree on Tree-Nation for every meaningful submission.

Live at **[agostiniandrea.dev](https://agostiniandrea.dev)**

**Verified quality** — Lighthouse 100 in all four categories, desktop and mobile, EN and IT · [Website Carbon](https://www.websitecarbon.com/website/agostiniandrea-dev/) rating **A**, 0.05 g CO₂/view, cleaner than 93% of pages tested · full details in [Quality Standards](#quality-standards).

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (Pages Router), EN + IT via built-in i18n routing |
| CMS | Contentful — `getStaticProps` + ISR (24 h home, 1 min detail pages) |
| Database | Supabase — feedback submissions with RLS and IP rate limiting |
| Styling | styled-components + ThemeProvider |
| Theming | Dark (default) + light via `prefers-color-scheme` — CSS custom properties, zero JS |
| Fonts | Inter + Space Grotesk via `next/font` |
| Images | `next/image` with avif/webp, 30-day CDN TTL, Contentful remote pattern |
| Language | TypeScript |
| Unit tests | Jest + Testing Library |
| E2E tests | Playwright — 37 tests (homepage, i18n, navigation, projects, Forest modal + validation) |
| Component explorer | Storybook with dark-mode addon + Chromatic visual regression |
| CI | GitHub Actions — type-check → lint → Jest → Lighthouse → Playwright → auto-merge |
| Deployment | Vercel — preview on every PR, production on `main` |
| Analytics | Google Analytics 4 + Microsoft Clarity, both gated behind cookie consent |
| Observability | Vercel Analytics + Speed Insights |
| Open Graph | Edge runtime at `/api/og` — dynamic OG image generation |

## Getting Started

Copy the environment template:

```bash
cp .env.template .env.local
```

Fill in the required variables (see [Environment Variables](#environment-variables)):

```
NEXT_PUBLIC_CONTENTFUL_SPACE_ID=
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Install dependencies and start the dev server:

```bash
yarn install
yarn dev        # http://localhost:3000
```

## Commands

```bash
# Development
yarn dev              # Dev server at http://localhost:3000 (webpack mode)

# Build
yarn build            # lint:fix → next build → sitemap (full production build)
yarn build:compile    # next build only
yarn build:config     # TypeScript type-check only

# Code quality
yarn lint             # ESLint (quiet)
yarn lint:fix         # ESLint with auto-fix
yarn prettier:fix     # Prettier across the repo

# Testing
yarn test             # Jest unit tests — all *.test.tsx under components/
yarn test:watch       # Jest in watch mode
yarn test:coverage    # Jest with coverage report
yarn test:update      # Update Jest snapshots
yarn e2e              # Playwright E2E suite (auto-starts dev server if not running)

# Storybook
yarn storybook        # Storybook dev at http://localhost:6006
yarn build-storybook  # Build Storybook static output
yarn chromatic        # Visual regression via Chromatic (requires CHROMATIC_PROJECT_TOKEN)

# Production
yarn start            # Start production server (after yarn build:compile)
```

## Project Structure

```
components/
  atoms/         # Non-visual meta components (Head, Seo)
  ions/          # Primitive UI — Button, Box, Flex, Container, Grid, Heading,
                 #   Text, Link, Image, AspectRatio, Skeleton
  molecules/     # Composed from ions — CookieBanner, CarbonBadge, Drawer,
                 #   HeadingBox, ScrollToTop, Badge
  organisms/     # Page-level layout — SiteHeader, SiteFooter, ModuleRenderer
  cms/           # Contentful-driven sections — one folder per module (see below)
config/          # Theme tokens: colors, fonts, spacing, radii, line-heights, breakpoints
constants/       # MODULES map, breakpoint values, page type IDs
e2e/             # Playwright E2E tests
  fixtures.ts              # Shared fixture — pre-accepts cookie consent
  homepage.spec.ts
  i18n.spec.ts
  navigation.spec.ts
  projects.spec.ts
  forest.spec.ts           # Modal open/close, step gates, happy path
  forest-validation.spec.ts# All step-4 field validation scenarios
lib/
  utils/cms/     # Contentful client + data fetching helpers (getPageContent, getPaths)
pages/
  api/
    feedback.ts  # POST — validates input, checks IP cooldown, inserts to Supabase
    og.tsx       # GET  — Edge runtime, dynamic Open Graph image generation
  index.tsx      # Home page (pageLanding, ISR 24 h)
  [slug].tsx     # Detail pages keyed by Contentful uid (ISR 1 min)
  _app.tsx       # ThemeProvider, cookie consent, GA4 + Clarity scripts
  _document.tsx
  404.tsx
  _error.tsx
public/          # Static assets (fonts, favicon, CV PDF)
supabase/
  schema.sql     # feedback table DDL + RLS policies
```

## CMS Architecture

Content is fetched from Contentful at build time via `getStaticProps`. Pages revalidate via ISR — 24 hours for the home page, 1 minute for detail pages. A scheduled GitHub Actions workflow triggers a full Vercel redeploy every Monday at 03:30 UTC to pick up Contentful content changes.

### Page types

| Contentful type | Route | Notes |
|---|---|---|
| `pageLanding` | `/` | Home page |
| `pageDetail` | `/[slug]` | Any other page, keyed by `uid` field |
| `siteHeader` | Global | Nav links, logo, locale switcher |
| `siteFooter` | Global | Footer links and social links |

### Module flow

1. `getPageContent` in `lib/utils/cms` fetches the page entry and flattens its `modules` list into `TPageModule[]` (each with `id`, `type`, `fields`)
2. `ModuleRenderer` iterates and passes each to `ModuleMatrix`
3. `ModuleMatrix` switches on `type` and renders the matching component from `components/cms/`
4. `cleanProps` normalises Contentful field shapes (especially images) before spreading onto the component

**To add a new module:** add its Contentful content type ID to `constants/modules.ts`, create the component in `components/cms/YourModule/`, and add a `case` in the `ModuleMatrix` switch.

### Available modules

| Module | Contentful type | Notes |
|---|---|---|
| `HeroPortfolio` | `heroPortfolio` | Hero with name, role, and CTAs |
| `About` | `about` | Bio and intro copy |
| `Experience` | `experience` | Work history timeline |
| `Skills` | `skills` | Technical skills grouped by category |
| `Projects` | `projects` | Selected project cards |
| `Journey` | `journey` | Life timeline — chapters with location, age, and copy |
| `Sustainability` | `sustainability` | Values, volunteering history, and carbon badge |
| `BeyondCode` | `beyondCode` | Personal interests and hobbies |
| `Forest` | `forest` | Feedback initiative — modal collects a message + optional contact info, inserts to Supabase, dedicated tree planted on Tree-Nation per accepted submission |
| `Contact` | `contact` | Contact section |

## API Routes

### `POST /api/feedback`

Accepts Forest modal submissions. Pipeline:

1. Honeypot check (bots fill a hidden `_hp` field — silently accepted and discarded)
2. Category validation against an allowlist
3. Message length check (minimum 10 characters)
4. Optional field validation — email format, LinkedIn/GitHub URL prefix, website URL protocol
5. IP-based cooldown — one submission per IP per 24 hours (checked via Supabase)
6. Insert to `public.feedback` table

### `GET /api/og`

Edge runtime handler that generates dynamic Open Graph images from `?title=` and `?subtitle=` query parameters using Inter fonts and `ImageResponse`.

## Analytics and Privacy

GA4 and Microsoft Clarity scripts are only injected after the user accepts cookie consent and only on `agostiniandrea.dev` or `www.agostiniandrea.dev`. Consent state is stored in `localStorage` (`cookie-consent: accepted`) and communicated via a `cookie-consent-accepted` custom DOM event. The hostname allowlist prevents both scripts from loading on localhost and Vercel preview environments, even when analytics IDs are present in the build.

## CI Pipeline

Every PR triggers the `Test & Lint` GitHub Actions job:

1. TypeScript type-check (`yarn build:config`)
2. Jest unit tests (`yarn test`)
3. ESLint (`yarn lint`)
4. Production build with Contentful secrets (`yarn build:compile`)
5. Lighthouse CI — desktop and mobile
6. Playwright E2E — 37 tests against the running production build
7. Auto-squash-merge on success

A separate `Vercel Scheduled Build` workflow fires every Monday at 03:30 UTC to force a Vercel redeploy and refresh ISR content.

## Quality Standards

Every production release is verified against a fixed quality bar: Lighthouse (performance, accessibility, best practices, SEO), responsive behaviour, production build, linting, type checking and a website carbon estimate.

Latest audit — **12 July 2026**, production ([agostiniandrea.dev](https://agostiniandrea.dev), v1.11.0), EN and IT locales:

| Lighthouse | Desktop | Mobile |
|---|---|---|
| Performance | 100 | 100 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |

Lighthouse thresholds are enforced in CI on every PR (`.lighthouserc.json` + mobile config), alongside 173 unit tests and 37 E2E tests.

**Carbon** — official [Website Carbon result](https://www.websitecarbon.com/website/agostiniandrea-dev/): **0.05 g CO₂ per page view, rating A**, cleaner than 93% of pages tested (12 July 2026). Treated as an estimate, not an exact emissions measurement; re-tested after substantial design, asset, hosting or performance changes. The footer badge renders this stored value statically — no third-party script per visit.

**Known gap** — hosting is not yet verified as green by [The Green Web Foundation](https://www.thegreenwebfoundation.org/); Website Carbon estimates green hosting would cut emissions by ~9% (checked 12 July 2026).

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CONTENTFUL_SPACE_ID` | Yes | Contentful space ID |
| `NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN` | Yes | Contentful Delivery API token |
| `SUPABASE_URL` | Yes | Supabase project URL — server-side only |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes — **Sensitive** | Supabase service role key — never expose client-side; mark Sensitive on Vercel |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL (default: `https://agostiniandrea.dev`) |
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics 4 measurement ID |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Optional | Microsoft Clarity project ID |
| `CONTENTFUL_MANAGEMENT_TOKEN` | Local only | Contentful Management API — only for one-off content scripts |
| `CONTENTFUL_ENVIRONMENT_ID` | Local only | Contentful environment (default: `master`) |
| `CHROMATIC_PROJECT_TOKEN` | Local only | Chromatic visual regression token |

## Path Aliases

| Alias | Resolves to |
|---|---|
| `@components/*` | `components/*` |
| `@config/*` | `config/*` |
| `@constants` | `constants/` |
| `@lib/*` | `lib/*` |
| `@utils/*` | `lib/utils/*` |
| `@test-utils/*` | `test-utils/*` |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a full history of notable changes.

## License

Private repository — all rights reserved.
