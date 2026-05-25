# Andrea Agostini — Personal Website

Personal portfolio website built with Next.js and Contentful. Covers professional experience, projects, skills, sustainability advocacy, and personal interests.

Live at **[andreaagostini.com](https://andreaagostini.com)**

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (Pages Router) |
| CMS | Contentful |
| Styling | styled-components + ThemeProvider |
| Theming | Dark (default) + light via `prefers-color-scheme` — CSS custom properties, no JS |
| Language | TypeScript |
| Testing | Jest + Storybook / Vitest + Playwright |
| Deployment | Vercel |
| Observability | Sentry + Vercel Analytics |

## Getting Started

Copy the environment template and fill in your Contentful credentials:

```bash
cp .env.template .env.local
```

Required variables:

```
NEXT_PUBLIC_CONTENTFUL_SPACE_ID=
NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN=
```

Install dependencies and start the dev server:

```bash
yarn install
yarn dev        # http://localhost:3000
```

## Commands

```bash
yarn dev              # Dev server (webpack mode, Sentry-compatible)
yarn build            # lint:fix → next build → sitemap
yarn build:compile    # next build only
yarn lint             # ESLint (quiet)
yarn lint:fix         # ESLint with auto-fix
yarn prettier:fix     # Prettier across the repo
yarn test             # Jest — all *.test.tsx under components/
yarn test:watch       # Jest in watch mode
yarn test:coverage    # Jest with coverage report
yarn storybook        # Storybook at http://localhost:6006
yarn build-storybook  # Build Storybook static output
yarn chromatic        # Visual regression (requires CHROMATIC_PROJECT_TOKEN)
```

## Project Structure

```
components/
  atoms/       # Non-visual meta components (Head, Seo)
  ions/        # Primitive UI building blocks (Button, Box, Flex, Text, Link…)
  molecules/   # Composed from ions (HeadingBox, CarbonBadge, InstagramPost…)
  organisms/   # Page-level sections (SiteHeader, SiteFooter, ModuleRenderer…)
  cms/         # Contentful-driven page modules (HeroPortfolio, Experience, Skills, Projects,
               #   About, Sustainability, BeyondCode, Contact, Journey…)
config/        # Theme tokens — colors, fonts, spacing, radii, breakpoints
constants/     # Module type IDs, breakpoints
lib/
  utils/cms/   # Contentful client + data fetching helpers
pages/         # Next.js pages (index, [slug], api routes)
```

## CMS Architecture

Content is fetched from Contentful at build time via `getStaticProps` + ISR.

| Contentful type | Route |
|---|---|
| `pageLanding` | `/` (home) |
| `pageDetail` | `/[slug]` |
| `siteHeader` | Global header |
| `siteFooter` | Global footer |

Each page contains an ordered list of **modules**. `ModuleRenderer` maps each module's `type` to its matching component in `components/cms/`. To add a new module: add its content type ID to `constants/modules.ts`, create the component, and add a `case` in `ModuleRenderer`.

### Available modules

| Module | Contentful type | Notes |
|---|---|---|
| `HeroPortfolio` | `heroPortfolio` | Hero section with name, role, CTAs |
| `About` | `about` | Bio and intro copy |
| `Experience` | `experience` | Work history |
| `Skills` | `skills` | Technical skills by category |
| `Projects` | `projects` | Selected projects |
| `Sustainability` | `sustainability` | Values, volunteering, carbon badge |
| `BeyondCode` | `beyondCode` | Personal interests and hobbies |
| `Contact` | `contact` | Contact section |
| `Journey` | `journey` | Life timeline — static data, no Contentful fields required |

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_CONTENTFUL_SPACE_ID` | Yes | Contentful space |
| `NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN` | Yes | Contentful delivery API |
| `NEXT_PUBLIC_INSTAGRAM_*` | Optional | Instagram feed API |
| `SENTRY_AUTH_TOKEN` | Optional | Sentry source map upload |
| `SENTRY_ORG` | Optional | Sentry organisation |
| `SENTRY_PROJECT` | Optional | Sentry project |
| `CHROMATIC_PROJECT_TOKEN` | Optional | Chromatic visual regression |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a full history of notable changes.

## License

Private repository — all rights reserved.
