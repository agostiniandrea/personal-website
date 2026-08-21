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

## Pull request screenshots

Every PR with a user-visible change must include screenshots captured from the
Vercel preview after deployment succeeds. Add them to the PR's `Screenshots`
section at these standard viewport widths:

- Desktop: 1440px (above the `tablet` breakpoint — full desktop layout)
- Tablet: 1024px (between `xTablet` 900px and `tablet` 1200px — desktop nav, two-column content)
- Mobile: 390px (below `mobile` 600px — bottom-tab mobile layout)

The mobile navigation switches to the desktop header at 900px (`xTablet`), so a
768px capture would still show the mobile layout and duplicate the 390px shot —
use 1024px to actually exercise the intermediate layout.

Show the affected UI in the same state at every viewport. Include both closed
and open/interactive states when the change introduces a popover, modal,
drawer, menu, tooltip, or similar interaction. Add before/after pairs when they
materially help reviewers understand the change. If screenshots cannot be
captured, state the concrete reason in the PR instead of writing “Not
applicable”. Non-visual changes may continue to use “Not applicable”.

Run a single test file:

```bash
yarn test -- components/ions/Button/__tests__/Button.test.tsx
```

## Architecture Overview

**Next.js 16, Pages Router** — this project uses `pages/`, not the App Router. All pages use `getStaticProps` + ISR.

### CMS: Contentful

Content is fetched from Contentful in `lib/utils/cms/index.ts`. Two content types are mapped to page routes:

| Contentful type | Route              | Notes                                 |
| --------------- | ------------------ | ------------------------------------- |
| `pageLanding`   | `pages/index.tsx`  | Home                                  |
| `pageDetail`    | `pages/[slug].tsx` | All other pages, keyed by `uid` field |

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

Import ordering is enforced by ESLint (`simple-import-sort`): side-effects → react → next → external → path aliases → relative, alphabetized within each group. Don't order imports by hand — `yarn lint:fix` does it.

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

### Feedback Nudges

Two independent components invite visitors toward the Forest/feedback flow.
Their visibility rules are deliberate — change them here first if behaviour
changes:

**`FeedbackNudge` (desktop, card bottom-right)** — a contextual reminder:

- Appears only after scrolling past ~60% of the first viewport (never on load).
- Fades out (stays mounted, `visibility: hidden`) while something more
  important is on screen: the inline Forest teaser, the Projects section, or
  any open modal. Fades back when they leave the viewport.
- Dies for the session (`sessionStorage`) once its job is done: the ✕ is
  clicked, the inline teaser is used, or the Forest section is reached.

**`MobileFeedbackNudge` (mobile, banner above the tab bar)** — much more
cautious because screen space is scarce. It shows only when **all** of these
hold: ≥ 35s on the page, ≥ 240px of scroll, and ≥ 2 sections visited
(a real exploration signal). A dismissal is respected for 14 days
(`localStorage`), a submitted feedback silences it permanently, and it pauses
while the More sheet is open.

When testing: any run that touches Forest or the teaser kills the desktop
nudge for that session — use a private window to see it again.

### Prolific usability study

Recruited participants reach the site through a Prolific link carrying
`PROLIFIC_PID`, `STUDY_ID` and `SESSION_ID`. The rule that governs every
decision here: **an ordinary visitor must see exactly the site that shipped
before the study existed.** No banner, no notice, no changed copy.

- `lib/utils/prolific.ts` owns it. `useProlificCapture()` (mounted in
  `_app.tsx`) reads the parameters once after hydration into `sessionStorage`
  — never `localStorage`, so a participant id cannot resurface on a genuine
  visit later. The homepage is prerendered, so the query string is invisible
  server-side; capture is necessarily client-side.
- The parameters stay in the address bar. Every internal navigation already
  carries `window.location.search` forward (`MobileNav`'s `routeWithHash`,
  `SiteHeader`'s logo handler), so they survive the whole visit.
- `ForestModal` attaches the ids to the feedback POST and, on success, swaps
  its Close button for a link back to Prolific. That link exists only when
  `NEXT_PUBLIC_PROLIFIC_COMPLETION_URL` is set — unset it when no study is
  running and the study code is inert.
- `/api/feedback` stores those rows as `source = 'usability_study'` and
  de-duplicates them by Prolific submission instead of by IP. The IP cooldown
  stays for the public form, but it would reject a second participant sharing
  a carrier NAT or VPN exit, which is a dead end mid-study.
- Study rows **are** counted in the published Forest figures
  (`lib/utils/forestStats.ts`). They were excluded until v1.24.0, on the
  reasoning that solicited, paid feedback is not a community insight; the
  exclusion was dropped because "insights collected" never claimed the
  insights were unsolicited, and a recruited participant who changes the site
  still changed it. Rejected rows are the only thing the figures leave out.
- **Trees are not tied to `source`.** The condition everywhere is
  `trees_planted > 0`: an award marks feedback that was chosen to be rewarded,
  whatever its provenance, and it is a separate decision from whether the
  suggestion ships (`status`). Six study rows carry trees today alongside the
  three community ones. `treesDedicatedCount` and `contributionsCount` must
  always filter on the same condition, or the ratio in "Feedback impact" lies.
- The claim that survives is narrower than it looks: the published count says
  how many insights arrived and how many earned trees, not that any of them
  were unpaid. Do not add copy that says otherwise.
- The pid is never rendered anywhere, and is never sent to GA or Clarity.
- Schema changes live in `supabase/migrations/20260814_prolific_study.sql` and
  must be pasted into the Supabase SQL editor by hand — the REST service key
  cannot issue DDL.

### Forest data and its fallbacks

Every figure in the Forest section is derived, never typed by hand. Two
independent sources have to agree: the Tree-Nation counter and the per-project
breakdown must sum to the same total. If they diverge, do not trust either.

The tree count resolves through three tiers, and only the first two are ever
really used:

1. **`forest_sync` in Supabase** — the cache, and where `total` always starts.
   It keeps two clocks: counters refresh hourly (matching ISR), projects and
   species every 24h, because each species costs a request. Each half degrades
   on its own and only what refreshed is written back.
2. **The Tree-Nation API** — queried only when the cached counters are stale.
   If the call fails, the cached value stands. The monthly counter also has to
   be from the current calendar month, since it resets on the 1st.
3. **`treeCount` in Contentful** — reached only when `total` is `null`, which
   means `forest_sync` has never been written at all. It is a cold-start seed,
   not the source of truth, and that cold start has already happened. Keep it
   roughly current so a fresh database does not open on a wrong number, but do
   not mistake it for what the site displays — it almost never is.

**Publishing any entry triggers a production deploy.** A Contentful webhook on
`Entry.publish` / `Entry.unpublish` calls a Vercel deploy hook. That rules out
having the site write verified figures back into the CMS on every sync: it
would turn each tree bought into a rebuild. The self-healing store already
exists, and it is `forest_sync`.

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
