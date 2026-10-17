# Andrea Agostini — Personal Website

Personal portfolio and sustainability initiative built with Next.js and Contentful. Covers professional experience, projects, skills, a life journey timeline, and the **Forest** — a feedback feature that plants a real tree on Tree-Nation for every meaningful submission.

Live at **[agostiniandrea.dev](https://agostiniandrea.dev)**

**Verified quality** — Lighthouse 100 in all four categories, desktop and mobile, EN and IT · [Website Carbon](https://www.websitecarbon.com/website/agostiniandrea-dev/) rating **A**, 0.05 g CO₂/view, cleaner than 93% of pages tested · full details in [Quality Standards](#quality-standards).

## Tech Stack

| Layer              | Technology                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| Framework          | Next.js 16 (Pages Router), EN + IT via built-in i18n routing                                          |
| CMS                | Contentful — `getStaticProps` + ISR (24 h home, 1 min detail pages)                                   |
| Database           | Supabase — feedback submissions with RLS and IP rate limiting                                         |
| Moderation         | In-repo English + Italian content rules for the feedback form — no third-party service                |
| Styling            | styled-components + ThemeProvider                                                                     |
| Theming            | Dark (default) + light via `prefers-color-scheme` — CSS custom properties, zero JS                    |
| Fonts              | Inter + Space Grotesk via `next/font`                                                                 |
| Images             | `next/image` with avif/webp, 30-day CDN TTL, Contentful remote pattern                                |
| Language           | TypeScript                                                                                            |
| Unit tests         | Jest + Testing Library                                                                                |
| E2E tests          | Playwright — 78 tests (homepage, i18n, navigation, projects, analytics, Forest modal, Prolific study) |
| Component explorer | Storybook with dark-mode addon + Chromatic visual regression                                          |
| CI                 | GitHub Actions — type-check → lint → Jest → Lighthouse → Playwright → auto-merge                      |
| Deployment         | Cloudflare Workers — production on `main`, staging on `dev`; Vercel previews on PRs for now           |
| Analytics          | Google Analytics 4 + Microsoft Clarity, both gated behind cookie consent                              |
| Observability      | Vercel Analytics + Speed Insights                                                                     |
| Open Graph         | Edge runtime at `/api/og` — the shared OG card, rendered with `ImageResponse`                         |

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
yarn test             # Jest unit tests — components/**/*.test.tsx and lib/**/*.test.ts
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
  analytics.spec.ts        # GA4 and Clarity never load on localhost, even after consent
  prolific.spec.ts         # Study parameters survive navigation and reload
lib/
  utils/cms/     # Contentful client + data fetching helpers (getPageContent, getPaths)
  utils/feedbackModeration.ts  # Content rules for the feedback form (EN + IT), see "Content moderation"
  utils/prolific.ts            # Study parameters + completion link for Prolific participants
  utils/attribution.ts         # First-touch campaign attribution, re-validated on the server
  utils/treeNation.ts          # Tree-Nation forest counters
pages/
  api/
    feedback.ts  # POST — validates input, applies content rules, checks cooldown, inserts to Supabase
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
  migrations/    # dated SQL migrations
```

## CMS Architecture

Content is fetched from Contentful at build time via `getStaticProps`. Pages revalidate via ISR — 1 hour for the home page, 1 minute for detail pages. Successful Forest feedback submissions also request on-demand revalidation for both homepage locales. The `Cloudflare Deploy` workflow rebuilds the site on every Contentful publish and every Monday at 03:30 UTC to pick up content changes.

### Page types

| Contentful type | Route     | Notes                                |
| --------------- | --------- | ------------------------------------ |
| `pageLanding`   | `/`       | Home page                            |
| `pageDetail`    | `/[slug]` | Any other page, keyed by `uid` field |
| `siteHeader`    | Global    | Nav links, logo, locale switcher     |
| `siteFooter`    | Global    | Footer links and social links        |

### Module flow

1. `getPageContent` in `lib/utils/cms` fetches the page entry and flattens its `modules` list into `TPageModule[]` (each with `id`, `type`, `fields`)
2. `ModuleRenderer` iterates and passes each to `ModuleMatrix`
3. `ModuleMatrix` switches on `type` and renders the matching component from `components/cms/`
4. `cleanProps` normalises Contentful field shapes (especially images) before spreading onto the component

**To add a new module:** add its Contentful content type ID to `constants/modules.ts`, create the component in `components/cms/YourModule/`, and add a `case` in the `ModuleMatrix` switch.

### Available modules

| Module           | Contentful type  | Notes                                                                                                                                                      |
| ---------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HeroPortfolio`  | `heroPortfolio`  | Hero with name, role, and CTAs                                                                                                                             |
| `About`          | `about`          | Bio and intro copy                                                                                                                                         |
| `Experience`     | `experience`     | Work history timeline                                                                                                                                      |
| `Skills`         | `skills`         | Technical skills grouped by category                                                                                                                       |
| `Projects`       | `projects`       | Selected project cards                                                                                                                                     |
| `Journey`        | `journey`        | Life timeline — chapters with location, age, and copy                                                                                                      |
| `Sustainability` | `sustainability` | Values, volunteering history, and carbon badge                                                                                                             |
| `BeyondCode`     | `beyondCode`     | Personal interests and hobbies                                                                                                                             |
| `Forest`         | `forest`         | Feedback initiative — modal collects a message + optional contact info, inserts to Supabase, dedicated tree planted on Tree-Nation per accepted submission |
| `Contact`        | `contact`        | Contact section                                                                                                                                            |

## API Routes

### `POST /api/feedback`

Accepts Forest modal submissions. Pipeline:

1. Honeypot check (bots fill a hidden `_hp` field — silently accepted and discarded)
2. Category validation against an allowlist
3. Message length check — 20 to 2,000 characters
4. Optional field validation — name length, email format, LinkedIn/GitHub URL prefix, website URL protocol
5. Content moderation (see below) — a refused message gets a generic `400` with code `content_rejected`; nothing is stored, no cooldown is spent and no page is revalidated
6. IP-based cooldown — one submission per IP per 24 hours (`429`, checked via Supabase). Study participants carrying valid Prolific ids are de-duplicated by their Prolific submission instead, with a ceiling of 10 per IP
7. Insert to `public.feedback` (community submissions also carry sanitised campaign attribution), then on-demand revalidation of both homepage locales — not done for study participants

#### Content moderation

The feedback form is a respectful space with zero tolerance: any profanity, vulgar language, insult, slur or blasphemy in the message or the credit name is refused, whether or not it is aimed at anybody ("fuck, this looks amazing" and "this design is stupid" are refused). Strong criticism without prohibited language is accepted ("the navigation is slow", "I strongly dislike this design").

- Rules live in `lib/utils/feedbackModeration.ts`, in English and Italian only, with no dependency. The module has two verdicts, `allow` and `block`: prohibited content is never stored, not even as `pending`.
- Matching is on whole words, so "Scunthorpe" or "cockpit" are safe. Leetspeak, masks (`f*ck`), spaced and repeated letters, look-alike and invisible characters are seen through.
- The visitor always gets the same generic message, whatever rule matched. The server log carries a coarse category code only (`slur`, `threat`, `profanity`, ...), never the text, the matched term or the name.
- Exceptions are few and tested: one plain real first name or surname in the name field (Dick, Cock, Fanny, Troia, Kike), "idiot-proof" and "dumb component", "Jesus Christ" on its own, and the literal verb "suck". None of them excuses another prohibited word in the same field.
- Known limits are listed in the module header: not exhaustive, no other languages, context is never read.
- To add a word, add it to the right list at the top of the module and add a test beside it.

### `GET /api/og`

Edge runtime handler that renders the site's single Open Graph card (name, role, location and the logo mark) with `ImageResponse`. It takes no query parameters, so nobody can render arbitrary text on the domain. The logo (`lib/utils/ogLogo.ts`) and the two site fonts, Space Grotesk Bold and Inter Regular (`lib/utils/ogFonts.ts`, WOFF subsets under the SIL OFL), are inlined because there is no filesystem to read them from on the Edge or Workers runtime, and a font CDN would add a network dependency to every render.

## Analytics and Privacy

GA4 and Microsoft Clarity scripts are only injected after the user accepts cookie consent and only on `agostiniandrea.dev` or `www.agostiniandrea.dev`. Consent state is stored in `localStorage` (`cookie-consent: accepted`) and communicated via a `cookie-consent-accepted` custom DOM event. The hostname allowlist prevents both scripts from loading on localhost and Vercel preview environments, even when analytics IDs are present in the build.

Custom GA4 events cover the portfolio's meaningful interactions:

- `feedback_modal_opened`
- `feedback_submitted` (only after a successful API response)
- `contact_clicked`
- `project_opened`
- `cv_downloaded`
- `social_profile_clicked`

Event payloads use only closed metadata such as locale, feedback category, interaction location, contact method, social platform, and project name. Names, email addresses, feedback content, visitor-provided profile URLs, and other personal information are never sent to GA4.

## CI Pipeline

Every PR triggers the `Test & Lint` GitHub Actions job:

1. TypeScript type-check (`yarn build:config`)
2. Jest unit tests (`yarn test`)
3. ESLint (`yarn lint`)
4. Production build with Contentful secrets (`yarn build:compile`)
5. Lighthouse CI — desktop and mobile
6. Playwright E2E — 78 tests against the running production build
7. Auto-squash-merge on success

Production is deployed from `main` by the `Cloudflare Deploy` workflow: on every merge into `main`, on a Contentful publish (`repository_dispatch`), on the weekly schedule (Monday at 03:30 UTC) or by a manual run. Every merge into `dev` deploys the staging Worker at `dev.agostiniandrea.dev` through `Cloudflare Staging Deploy`. A merge made by the `Auto-merge` job (GITHUB_TOKEN) does not fire `push` workflows, so that job starts the matching deploy itself with `workflow_dispatch`. Both Workers come from `cloudflare.config.ts`: `vinext-cloudflare deploy --env staging` selects the staging name, domain, KV namespace and secrets. Staging is `noindex` and sends nothing to GA4 or Clarity.

A `Carbon Drift Check` workflow runs on the 1st of every month and opens a reminder issue when the homepage weight drifts from the stored baseline.

## Quality Standards

Every production release is verified against a fixed quality bar: Lighthouse (performance, accessibility, best practices, SEO), responsive behaviour, production build, linting, type checking and a website carbon estimate.

Latest audit — **12 July 2026**, production ([agostiniandrea.dev](https://agostiniandrea.dev), v1.11.0), EN and IT locales:

| Lighthouse     | Desktop | Mobile |
| -------------- | ------- | ------ |
| Performance    | 100     | 100    |
| Accessibility  | 100     | 100    |
| Best Practices | 100     | 100    |
| SEO            | 100     | 100    |

Lighthouse thresholds are enforced in CI on every PR (`.lighthouserc.json` + mobile config), alongside 48 Jest suites and 78 E2E tests.

**Carbon** — official [Website Carbon result](https://www.websitecarbon.com/website/agostiniandrea-dev/): **0.05 g CO₂ per page view, rating A**, cleaner than 93% of pages tested (12 July 2026). Treated as an estimate, not an exact emissions measurement; re-tested after substantial design, asset, hosting or performance changes. The `CarbonBadge` component can render this stored value statically (no third-party script per visit), but it is not shown on the site at the moment; the monthly Carbon Drift Check keeps the baseline current.

**Hosting** — verified as green hosting by [The Green Web Foundation](https://www.thegreenwebfoundation.org/green-web-check/?url=agostiniandrea.dev) (live check). The footer shows their official badge, saved as a static image in `public/assets/` so no third-party request is made on page view; re-save it if the hosting provider ever changes.

## Environment Variables

| Variable                              | Required            | Purpose                                                                           |
| ------------------------------------- | ------------------- | --------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CONTENTFUL_SPACE_ID`     | Yes                 | Contentful space ID                                                               |
| `NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN` | Yes                 | Contentful Delivery API token                                                     |
| `SUPABASE_URL`                        | Yes                 | Supabase project URL — server-side only                                           |
| `SUPABASE_SERVICE_ROLE_KEY`           | Yes — **Sensitive** | Supabase service role key — never expose client-side; mark Sensitive on Vercel    |
| `NEXT_PUBLIC_SITE_URL`                | Yes                 | Canonical site URL (default: `https://agostiniandrea.dev`)                        |
| `NEXT_PUBLIC_GA_ID`                   | Optional            | Google Analytics 4 measurement ID                                                 |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID`      | Optional            | Microsoft Clarity project ID                                                      |
| `TREE_NATION_API_TOKEN`               | Optional            | Tree-Nation API token — sent with the forest counter requests when set            |
| `NEXT_PUBLIC_PROLIFIC_COMPLETION_URL` | Optional            | https Prolific completion link; without it the study return button does not exist |
| `CF_ACCESS_TEAM_DOMAIN`               | Production, staging | Cloudflare Access team domain (`xxx.cloudflareaccess.com`) — Worker secret        |
| `CF_ACCESS_AUD`                       | Production, staging | Cloudflare Access application AUD tag — Worker secret                             |
| `ADMIN_DEV_BYPASS`                    | Local only          | `1` opens `/admin` under `yarn dev`; any other build ignores it                   |
| `CONTENTFUL_MANAGEMENT_TOKEN`         | Local only          | Contentful Management API — only for one-off content scripts                      |
| `CONTENTFUL_ENVIRONMENT_ID`           | Local only          | Contentful environment (default: `master`)                                        |
| `CHROMATIC_PROJECT_TOKEN`             | Local only          | Chromatic visual regression token                                                 |

## Admin Area

`/admin` is a private area for managing the site's data without opening the database: an overview, and the feedback list with filters and status changes (pending, accepted, rejected, implemented). New sections are one entry in `ADMIN_SECTIONS` (`lib/admin/feedbackAdmin.ts`) plus a page under `pages/admin/`.

Access is two locks. **Cloudflare Access** is the login: an application covering `/admin*` and `/api/admin*` on the production and staging hostnames, with an Allow policy for the owner's email only. **The API checks again**: every `/api/admin/*` route verifies the signed Access token itself (`lib/admin/access.ts`) and answers 401 otherwise, because those routes use the Supabase service key. The pages hold no data, are `noindex`, are left out of the sitemap, and load no analytics.

Setup: create the Access application, then set `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` as secrets on both Workers (same procedure as the other runtime secrets). Without them every admin API call answers 401. Locally, add `ADMIN_DEV_BYPASS=1` to `.env.local`.

## Path Aliases

| Alias           | Resolves to    |
| --------------- | -------------- |
| `@components/*` | `components/*` |
| `@config/*`     | `config/*`     |
| `@constants`    | `constants/`   |
| `@lib/*`        | `lib/*`        |
| `@utils/*`      | `lib/utils/*`  |
| `@test-utils/*` | `test-utils/*` |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a full history of notable changes.

## License

Private repository — all rights reserved.
