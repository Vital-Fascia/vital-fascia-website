# Vital Fascia website: project conventions

**Always `git pull` before starting.** The client edits content through the CMS, which commits straight to `main`. **Read `docs/project-status.md` first** for where things stand, open items and gotchas.

## Stack (fixed)
- Astro (static output), TypeScript, plain/scoped CSS. No UI framework, no Tailwind. Minimal client JS (menu, carousel, collapsibles, forms, consent, booking only).
- Content editable via Sveltia CMS at `/admin` (`public/admin/config.yml`). Custom live-preview panels live in `public/admin/*.js`.
- Hosted on **Cloudflare Workers with static assets** in **Alex's Cloudflare account** (`vital-fascia-website`), auto-deployed from GitHub `main` (`wrangler.jsonc`). A Worker (`worker/`) handles the form emails.
- Form emails are sent through Resend. GoHighLevel (white-labelled "GATHR") is the CRM; Cliniko handles bookings and patient records.
- Repo: `Vital-Fascia/vital-fascia-website`.
- **Do not deploy, create Cloudflare resources, or write secrets unless the user explicitly asks in that message.** (Done on request this project: deploying the `sveltia-cms-auth` Worker.) Secrets are added by the user in the Cloudflare dashboard; the auto-mode safety check blocks Claude writing them.

## Content-model rule
Every piece of client-facing copy, image, contact detail, hours, service, testimonial, price, email wording etc. lives in `src/content/*.yaml`. **Never hard-code it in a component.** Components read content through `getContent()` in `src/lib/content.ts`. Keep names plain English; the client sees them in the CMS.

When you add or change a field, update all three: the YAML file, the zod schema in `src/content.config.ts`, and `public/admin/config.yml` (plain-English labels and hints, alt-text field for every image). New content files also need an entry in `src/lib/content.ts` (the `Single` union and `ids`). Images go in `src/assets/uploads/` only and are rendered with `astro:assets` (see `Photo.astro`). Image values in YAML are relative paths like `../assets/uploads/x.jpg`.

One content file per CMS entry: each legal page (`privacy-policy.yaml` etc.) and each email (`email-*.yaml`) has its own file. Opening hours exist in **one** place only (`contact.yaml` `locations`); everything else reads them from there.

YAML gotcha: quote any string containing `: ` or starting with a special character (applies to `public/admin/config.yml` descriptions too).

## Forms, emails, consent
- Three forms (Request a call, Contact, 8-Week waitlist) post to the Worker (`/api/discovery-call`, `/api/contact`, `/api/waitlist`). Email templates are shared by the Worker and the previews in **`worker/emails.ts`**; wording is edited in the CMS and reaches the Worker through the build-time `/email-content.json`.
- **All cleaning/validation rules live in `src/lib/clean.ts`** and run in the browser (`src/scripts/forms.ts`) and again on the server. Keep them in sync by importing, never duplicating.
- Browser guard: `forms.ts` stops a submit click with a mistake in a window-level capture handler **before** the GoHighLevel tracking script can see it. Don't remove it.
- Marketing consent: one visible tick-box drives a visually hidden `Consent` / `No consent` radio pair named `marketing_consent` (GoHighLevel maps a checkbox to Terms & Conditions, which is useless). Unticked by default, remembered in localStorage (`src/scripts/consent.ts`). Pre-ticking is not recommended under the Spam Act.
- Do not add a form field without also giving it a clear `name`, and check how the GHL External Tracking field mapping treats it.

## Design
- Source of truth: the Claude Design prototype (also live at https://jimb00sa.github.io/vital_fascia/). Match layout, type and spacing.
- **Design tokens live in `src/styles/tokens.css`.** Use the CSS variables; don't introduce raw hex values in components. (Exception: email HTML in `worker/emails.ts` and the CMS preview scripts need inline hex that mirrors the tokens.)
- Shared base styles (buttons, forms, eyebrow, wrap) are in `src/styles/global.css`; section styles are scoped in each component.

## Quality bar
Mobile first (check ~390px width: a 22-review carousel once overflowed phones), semantic HTML, keyboard navigable, sufficient contrast, descriptive alt text, no needless JS. Per-page title/description come from `seo.yaml`.

## Don't
No invented business details (prices, credentials, testimonials). Unconfirmed content is flagged in `docs/content-todos.md`. No WordPress, database or paid services (Resend/GHL are on free or Alex-owned plans). Never put clinical details into GoHighLevel.

## Working practices
- Create a GitHub issue per change and close it when done (project board: see `docs/project-status.md`). Commit messages end with the Co-Authored-By line from the session.
- Push straight to `main` only when the user asks ("push live"); it auto-deploys.
- The auto-mode classifier can block big compound shell commands (edit + build + commit + push). Run those as small separate steps.
- After changing the content schema, the local dev server can serve stale values: `pkill -f astro; rm -rf .astro node_modules/.vite` and restart.
- Test forms locally with `MAIL_DRY_RUN=true` in `.dev.vars` and `npx wrangler dev`; never submit real data from localhost, because the GoHighLevel tracking script also loads there and creates CRM contacts.
- Scripts without imports are global scripts: add `export {}` to avoid variable-name clashes (`collapse.ts` and `consent.ts` both use `roots`).

## Commands
`npm run dev` · `npm run build` · `npx astro check` · `npx wrangler dev` (form Worker, after a build)

## Docs map
`docs/client-guide.md` (owner guide, tech stack, style guide, hand-over) · `docs/project-status.md` (state and next steps) · `docs/migration-to-client-cloudflare.md` · `docs/ghl-integration-plan.md` · `docs/systems-diagram.md` (+ `.excalidraw`, `.png`) · `docs/content-todos.md` · `docs/image_spec.md`
