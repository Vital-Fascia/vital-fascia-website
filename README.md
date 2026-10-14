# Vital Fascia website

Marketing site for Vital Fascia (Double Bay, Sydney). Built with [Astro](https://astro.build) (static output), content editable through [Sveltia CMS](https://github.com/sveltia/sveltia-cms) at `/admin`, hosted on Cloudflare.

## Pages

| URL | What it is |
| --- | --- |
| `/` | One-page home site (hero, services, approach, process, offers, testimonials, about, free resource, contact) |
| `/8-week-program` | Landing page for the upcoming 8-week program (placeholder copy, no design yet) |
| `/contact` | Contact form page |
| `/admin` | CMS for the client |

## Run locally

Requires Node 22.12+.

```bash
git pull          # the client edits content via the CMS, so always pull first
npm install
npm run dev       # http://localhost:4321
npm run build     # production build into dist/
npm run preview   # serve the built site
npx astro check   # type-check
```

## How content works

All client-facing copy, images, contact details etc. live in `src/content/*.yaml` (one file per section, named in plain English). Components in `src/components/` only read those files via `src/lib/content.ts`. Schemas are in `src/content.config.ts`. Uploaded images live in `src/assets/uploads/` and are optimised by `astro:assets`.

Adding a new editable field means updating **three** places: the YAML file, `src/content.config.ts` and `public/admin/config.yml`.

Design tokens (colours, fonts, spacing) are in `src/styles/tokens.css`.

## How the CMS works

- Config: `public/admin/config.yml`. Page: `public/admin/index.html` (loads Sveltia CMS from unpkg, version pinned).
- **Locally (no login):** run `npm run dev`, open <http://localhost:4321/admin/> in Chrome or Edge, click **Work with Local Repository** and choose this project folder. Edits write straight to `src/content/` and `src/assets/uploads/`; review and commit them with git as normal.
- **In production:** editors click **Sign in with GitHub**. This needs the [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) Cloudflare Worker (not deployed yet). Once deployed, set its URL as `backend.base_url` in `public/admin/config.yml`. Each save becomes a commit on `main`, which triggers a deploy.
- Client instructions: `docs/client-guide.md`.

## Deployment (Cloudflare, from GitHub)

Nothing is deployed from this repo by hand. Connect the repo in the Cloudflare dashboard (Workers & Pages > Create > connect to Git) with:

- Production branch: `main`
- Build command: `npm run build`
- Output / assets directory: `dist` (see `wrangler.jsonc`)
- Environment variable `SITE_URL` = the live domain (used for the sitemap and canonical/Open Graph URLs; defaults to `https://www.vitalfascia.com.au`).

Every push to `main` (including CMS saves) rebuilds and deploys. `public/_redirects` maps the old Squarespace URLs to the new ones; `public/_headers` sets caching and security headers.

## Outstanding TODOs

See `docs/content-todos.md` for content that still needs the client, and:

- Contact form, free-resource and waitlist form endpoints: `src/lib/forms.ts` (no form service chosen yet).
- Cliniko booking URL: `bookingUrl` in `src/content/contact.yaml` (currently `#`).
- `backend.base_url` in `public/admin/config.yml` (auth Worker).
- Real photos (hero, about, social sharing image) and a proper logo/favicon.
- Design for the 8-week program page.
