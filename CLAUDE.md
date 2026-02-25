# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website and API monorepo for qnury.es. Three pnpm workspace packages:

- **`astro/`** — Astro 5 SSG frontend with React 19, Tailwind CSS 4, shadcn/ui
- **`worker-api/`** — Cloudflare Workers API (Hono + D1 + KV + Resend)
- **`shared/`** — Shared types and constants (reaction emojis, KV prefixes, rate limits)

## Commands

```bash
# Development (run from root)
pnpm dev:astro          # Frontend dev server (:4321)
pnpm dev:api            # API dev server (:8787, with --test-scheduled)
pnpm dev:email          # Email template preview

# Build & Deploy
pnpm build              # Build frontend
pnpm deploy             # Build + deploy frontend to Cloudflare Pages
pnpm deploy:api         # Deploy API to Cloudflare Workers

# Code Quality (Biome)
pnpm check              # Lint + format check
pnpm check:fix          # Lint + format auto-fix
pnpm lint               # Lint only
pnpm lint:fix           # Lint auto-fix
pnpm format             # Format only
```

## Architecture

### Astro Frontend (`astro/`)

**I18n**: Three locales (`en`, `zh-cn`, `zh-tw`). Translations live in TOML files at `src/i18n/messages/*.toml`, compiled to JSON at build-time by a custom Astro integration (`integrations/toml-i18n.ts`). The compiled JSON in `src/i18n/compiled/` is gitignored and auto-generated. Use `loadTranslations(locale)` in Astro pages and `useTranslations()` hook in React components. Keys use dot notation with `{placeholder}` interpolation.

**Content Collections**: Blog posts in `src/content/blog/` (Markdown/MDX). Schema requires `title`, `created_at`, `updated_at`, `tags`, `locale`. Cross-locale translations linked via `translation_id` + `original_locale`. Links collection in `src/content/links/` (JSON).

**Routing**: Locale-prefixed routes under `src/pages/[locale]/`. Middleware rewrites unknown routes to default locale. Blog has nested routes: `/blog`, `/blog/tags/:tag`, `/blog/issues/:issue` (newsletters).

**Interactive Components**: Only React components needing interactivity use `client:load`. Key interactive systems: ReactionBar (emoji reactions with particle animations), Newsletter (responsive Dialog on desktop / Drawer on mobile).

**Styling**: OKLCH color space with CSS variables for light/dark themes. Blog posts extract dynamic contrast colors from cover images via node-vibrant. Scroll animations use vanilla IntersectionObserver with `[data-animate]` attributes. All animations respect `prefers-reduced-motion`.

### Worker API (`worker-api/`)

Hono app with handler classes extending a base class. Routes: comments CRUD (`/comments`, `/posts/:post_id/comments`), likes (`/comments/:id/like`), reactions (`/reactions/:postSlug`), newsletter subscriptions (`/subscription`). Scheduled crons: monthly newsletter broadcast, daily reaction sync. Email templates use React Email. Path alias `@/` maps to `src/`.

**D1 Database**: Schema lives in `worker-api/schema.sql`. There is no migration framework — the project uses a single schema file with `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`. Tables: `comments`, `comment_likes`, `post_reactions`. All SQL is raw prepared statements in handler classes (no ORM). When making schema changes, update `schema.sql` and apply manually via `wrangler d1 execute`. Never run migrations automatically.

**KV Storage** (binding: `subscription`): Used for two distinct purposes:
1. **Reaction system** — delta counters (`reaction:{postSlug}:{emoji}`) accumulated between daily D1 syncs, plus per-IP rate limit keys (`ratelimit:{postSlug}:{ip}`). Key prefixes and limits are defined in `shared/`.
2. **Subscription tokens** — temporary confirmation tokens (`subscription:{uuid}`) with 15-minute TTL.

**Backend change policy**: D1 schema changes, KV key format changes, and wrangler binding changes affect live production data. Always present proposed changes for review — never apply D1 migrations or modify `wrangler.toml` bindings without explicit approval. When adding new tables or columns, update `schema.sql` and provide the corresponding `ALTER TABLE` / `CREATE TABLE` statement separately for manual execution.

### Shared (`shared/`)

Exports `DEFAULT_REACTIONS` emoji set, KV key prefixes, rate limit config, and TypeScript types consumed by both astro and worker-api.

## Code Conventions

- **Formatter/Linter**: Biome — single quotes, semicolons, trailing commas, 120 char line width, 2-space indent
- **Classnames**: Always use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge), never manual concatenation
- **Validation**: Zod for runtime schemas (shared between frontend forms and API handlers)
- **Commits**: Conventional commits enforced by commitlint + husky. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Subject max 72 chars, never start-case/PascalCase/UPPER_CASE
- **Biome overrides**: `.astro` files allow unused vars/imports and console usage; `scripts/` allows console
- **Lint-staged**: Runs `biome check --write` on staged files via husky pre-commit hook
