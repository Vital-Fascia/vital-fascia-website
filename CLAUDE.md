# Vital Fascia website: project conventions

**Always `git pull` before starting.** The client edits content through the CMS, which commits straight to `main`.

## Stack (fixed)
- Astro (static output), TypeScript, plain/scoped CSS. No UI framework, no Tailwind. Minimal client JS (menu, carousel, forms only).
- Content editable via Sveltia CMS at `/admin` (`public/admin/config.yml`).
- Hosted on Cloudflare static assets, auto-deployed from GitHub `main`. Do not deploy or create Cloudflare resources from here.
- Repo: `Vital-Fascia/vital-fascia-website` (GitHub org, to be handed over to the client).

## Content-model rule
Every piece of client-facing copy, image, contact detail, hours, service, testimonial, price etc. lives in `src/content/*.yaml`. **Never hard-code it in a component.** Components read content through `getContent()` in `src/lib/content.ts`. Keep names plain English; the client sees them in the CMS.

When you add or change a field, update all three: the YAML file, the zod schema in `src/content.config.ts`, and `public/admin/config.yml` (plain-English labels and hints, alt-text field for every image). Images go in `src/assets/uploads/` only and are rendered with `astro:assets` (see `Photo.astro`). Image values in YAML are relative paths like `../assets/uploads/x.jpg`.

YAML gotcha: quote any string containing `: ` or starting with a special character.

## Design
- Source of truth: the Claude Design prototype (also live at https://jimb00sa.github.io/vital_fascia/). Match layout, type and spacing.
- **Design tokens live in `src/styles/tokens.css`.** Use the CSS variables; don't introduce raw hex values in components.
- Shared base styles (buttons, forms, eyebrow, wrap) are in `src/styles/global.css`; section styles are scoped in each component.

## Quality bar
Mobile first, semantic HTML, keyboard navigable, sufficient contrast, descriptive alt text, no needless JS. Per-page title/description come from `seo.yaml`.

## Don't
No invented business details (prices, credentials, testimonials). Unconfirmed content from the design is flagged in `docs/content-todos.md`. No WordPress, database or paid services.

## Commands
`npm run dev` · `npm run build` · `npx astro check`
