# Project status and handoff (as of 9 Nov 2026)

Read this at the start of a new session. `CLAUDE.md` holds the standing rules; this file holds the **current state**.

## Where things run
| Thing | Where |
| --- | --- |
| Test site (live, auto-deploys from `main`) | `https://vital-fascia-website.alex-c56.workers.dev` (Alex's Cloudflare account) |
| Editor | `/admin` on that address. Login worker: `https://sveltia-cms-auth.alex-c56.workers.dev` (deployed from the command line; `ALLOWED_DOMAINS` = `www.vitalfascia.com.au,vital-fascia-website.alex-c56.workers.dev`) |
| Production domain | `www.vitalfascia.com.au` still points at the **old Squarespace site**. Domain is registered at **VentraIP**. Not switched yet |
| GitHub | `Vital-Fascia/vital-fascia-website`, branch `main`. Project board "vitalfascia.com.au" (project number 2) |
| CRM | GoHighLevel, white-labelled by the agency GATHR (`app.gathrspace.com.au`). Tracking script is on every public page |
| Bookings | Cliniko (CBD: `vital-fascia.au5`; Double Bay: `the-muscle-group.au1`, business 63731, practitioner 171156) |
| Wrangler | The user may still be logged in on this machine to Alex's account (`npx wrangler logout` to remove) |

## Done this project (high level)
Real Google reviews carousel (22, priority 10 first, expandable long ones) · Cancellation and Privacy policy pages · Work With Me / 8-week / FAQ copy · two-location booking page (`/book`, Cliniko embeds) · two-location footer with single source of hours · CMS reorganised into 7 collections with a live preview panel on every entry (emails render live) · private `/admin/email-previews` page · form Worker (+ Resend) for all three forms with editable email templates · GoHighLevel External Tracking (field mapping done in GHL, consent maps to the *Marketing Consent* custom field) · marketing consent tick-box (CMS-controlled, remembers choice) · form validation/cleaning/spam protection · privacy policy updated for CRM/tracking/consent · client guide, migration checklist, GHL plan, systems diagram (editable Excalidraw).

## Open items (in priority order)
1. **Resend is not live.** Needs Alex: create the Resend account under his email, verify `vitalfascia.com.au`, add DNS records, add `RESEND_API_KEY` secret. The user said the key is added, but the domain is unverified. Until then emails fail, so a `MAIL_DRY_RUN=true` secret may be set in the Worker (forms then show success and send nothing). **Check the Cloudflare Worker secrets before testing emails.** `MAIL_TEST_TO` (secret) redirects all mail to one address for testing (sandbox sender; only works to the Resend account owner's email).
2. **Domain switch (Part 4 of `docs/migration-to-client-cloudflare.md`)**, done together with Resend. Record all DNS records (especially MX/email TXT) first. Share-preview thumbnails only work once the real domain points at the site (or temporarily set the build var `SITE_URL`).
3. **Auth Worker config drift:** variables were edited in the dashboard; deploy only with `keep_vars`. Disconnect the failed Git build on the `sveltia-cms-auth` Worker (red banner; retrying never works).
4. **GoHighLevel to-dos for Alex:** spam-filter workflow; field mappings; dedicated sending domain (currently sends from GATHR's shared `marketing.gathrspace.com.au`); confirm with GATHR plan limits/API token. Upgrade path if tracking proves noisy: Worker sends each lead to GHL via API (option A in `docs/ghl-integration-plan.md`).
5. **Needs Alex's/an adviser's approval:** privacy policy edits (CRM, overseas providers, tracking, consent, localStorage), consent wording, cookie-banner decision.
6. **Cloudflare WAF rate-limit rule** on `/api/*` (10 per minute per IP) after the domain moves; Turnstile if spam persists.
7. **Content still placeholder:** Terms of Service and Refund Policy pages; 8-week page copy; see `docs/content-todos.md`. The Double Bay Cliniko form still shows old Muscle Medicine text/policy (edit inside Cliniko).
8. Optional: Cliniko to GHL booking-status sync (scheduled Worker polling the Cliniko API; Cliniko has no webhooks).

## Gotchas learned
- **GHL External Tracking** can only map to built-in fields (no custom fields); it maps a checkbox to Terms & Conditions; it reacts to the submit *click* (before validation), which is why `forms.ts` has the capture-phase guard; the same contact is merged by matching email or phone, so re-tests need a **new email and new phone** and don't overwrite existing names.
- The auto-mode safety check blocked: writing Cloudflare secrets, some big combined commands, and `git push` once. Permission rules for git are in `.claude/settings.local.json` (gitignored). Secrets are added by the user in the dashboard.
- `wrangler` OAuth login needs the callback on `localhost:8976` to be alive when the user clicks Allow (start the login, then send the link immediately).
- Cloudflare had an API incident on 6 Nov that caused 503s and failed builds; check cloudflarestatus.com before debugging.
- The `.excalidraw` MCP export is restricted to `/Users/james/Documents/Excalidraw`; copy from there into `docs/`.
- `docs/systems-diagram.mmd` and `docs/Systems_Diagram.excalidraw` were deliberately deleted by the user; don't restore.

## GitHub project board IDs (for `gh project item-edit`)
Owner `Vital-Fascia`, project number 2, project id `PVT_kwDOFGddts4BnGf9`, Status field `PVTSSF_lADOFGddts4BnGf9zhlsqAk`; options: Backlog `f75ad846`, Ready `61e4505c`, In progress `47fc9ee4`, Alex to review `df73e18b`, Done `98236657`. New issues are auto-added to the board.

## People and context
James is the developer/agency owner and has admin access to Alex's Cloudflare, GitHub org and VentraIP. Alex (the client, physio-style soft-tissue therapist, non-technical) will use the CMS and GoHighLevel. Alex is not actively using the site yet. Issues #47 to #68 cover this session's work.
