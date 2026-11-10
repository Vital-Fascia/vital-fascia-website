# Project status and handoff (as of 10 Nov 2026)

Read this at the start of a new session. `CLAUDE.md` holds the standing rules; this file holds the **current state**.

## Where things run
| Thing | Where |
| --- | --- |
| **Live site** (auto-deploys from `main`) | **`https://www.vitalfascia.com.au`** (Worker `vital-fascia-website` in Alex's Cloudflare account; also reachable at `https://vital-fascia-website.alex-c56.workers.dev`). The bare domain `vitalfascia.com.au` 301-redirects to `www` (Cloudflare redirect rule "Bare domain to www") |
| Editor | `/admin` on the live address (tested working). Login worker: `https://sveltia-cms-auth.alex-c56.workers.dev` (deployed from the command line; `ALLOWED_DOMAINS` = `www.vitalfascia.com.au,vital-fascia-website.alex-c56.workers.dev`) |
| Domain and DNS | Registered at **VentraIP** (registrar only). **DNS is served by Cloudflare** (Alex's account; nameservers `aryanna.ns.cloudflare.com` and `martin.ns.cloudflare.com`, set at VentraIP on 10 Nov 2026). Email is Google Workspace (MX `SMTP.GOOGLE.COM`), tested working. Mailchimp DKIM CNAMEs, DMARC (`p=none`) and Google verification records kept. Rollback (only practical within 72 hours, when VentraIP deletes its old zone): set the old nameservers `ns1/ns2/ns3.nameserver.net.au` back under VentraIP > Domains > Manage DNS > Custom Nameservers |
| Form email | Resend, domain `vitalfascia.com.au` **Verified** (region Tokyo; records: TXT `resend._domainkey`, CNAME `send`, CNAME `rsend`, all DNS only). Worker secret `RESEND_API_KEY`; plain vars `MAIL_FROM` and `NOTIFY_TO` (alex@). Test mode secrets `MAIL_DRY_RUN` and `MAIL_TEST_TO` were **deleted** and must stay deleted |
| Cloudflare security | Rate limit on `/api/*` (5 per 10 s per IP, block 10 s), Always Use HTTPS, min TLS 1.2, Bot Fight Mode, Web Analytics (automatic setup, cookieless). HSTS deliberately **not** enabled yet. Details in `docs/client-guide.md` > *Security and monitoring* |
| GitHub | `Vital-Fascia/vital-fascia-website`, branch `main`. Project board "vitalfascia.com.au" (project number 2) |
| CRM | GoHighLevel, white-labelled by the agency GATHR (`app.gathrspace.com.au`). Tracking script is on every public page |
| Bookings | Cliniko (CBD: `vital-fascia.au5`; Double Bay: `the-muscle-group.au1`, business 63731, practitioner 171156) |
| Wrangler | The user may still be logged in on this machine to Alex's account (`npx wrangler logout` to remove) |

## Done this project (high level)
Real Google reviews carousel (22, priority 10 first, expandable long ones) · Cancellation and Privacy policy pages · Work With Me / 8-week / FAQ copy · two-location booking page (`/book`, Cliniko embeds) · two-location footer with single source of hours · CMS reorganised into 7 collections with a live preview panel on every entry (emails render live) · private `/admin/email-previews` page · form Worker (+ Resend) for all three forms with editable email templates · GoHighLevel External Tracking (field mapping done in GHL, consent maps to the *Marketing Consent* custom field) · marketing consent tick-box (CMS-controlled, remembers choice) · form validation/cleaning/spam protection · privacy policy updated for CRM/tracking/consent · client guide, migration checklist, GHL plan, systems diagram (editable Excalidraw) · **10 Nov 2026: domain migrated to Cloudflare DNS and live on `www.vitalfascia.com.au`, Resend verified and all three form emails tested end to end, security hardening (rate limit, HTTPS, TLS 1.2, Bot Fight Mode), Cloudflare Web Analytics, Workers Logs, privacy policy updated for analytics.**

## Open items (in priority order)
1. **Part 5 tidy-up of the migration** (`docs/migration-to-client-cloudflare.md`): keep Squarespace about a week then cancel it; delete the old `vital-fascia-website` and `sveltia-cms-auth` Workers (and the old GitHub OAuth app) in James's own Cloudflare account; confirm Alex's Cloudflare login has two-factor authentication; update Google Business Profile / Search Console with the sitemap `https://www.vitalfascia.com.au/sitemap-index.xml`. Check the share-preview thumbnail now the real domain is live.
2. **HSTS:** enable after one to two trouble-free weeks (short max-age, no subdomains, no preload). See the client guide.
3. **DMARC** is `p=none`; tighten to `quarantine` after checking reports (client guide).
4. **Auth Worker config drift:** variables were edited in the dashboard; deploy only with `keep_vars`. Disconnect the failed Git build on the `sveltia-cms-auth` Worker (red banner; retrying never works).
5. **GoHighLevel to-dos for Alex:** spam-filter workflow; field mappings; dedicated sending domain (currently sends from GATHR's shared `marketing.gathrspace.com.au`); confirm with GATHR plan limits/API token. Upgrade path if tracking proves noisy: Worker sends each lead to GHL via API (option A in `docs/ghl-integration-plan.md`).
6. **Needs Alex's/an adviser's approval:** privacy policy edits (CRM, overseas providers, tracking, consent, localStorage, and the new Cloudflare Web Analytics / hosting wording in section 7), consent wording, cookie-banner decision.
7. **Turnstile** on the three forms if spam gets past the rate limit and hidden trap field (needs a Turnstile site key plus form and Worker changes). Documented as a later option in the client guide.
8. **Content still placeholder:** Terms of Service and Refund Policy pages; 8-week page copy; see `docs/content-todos.md`. The Double Bay Cliniko form still shows old Muscle Medicine text/policy (edit inside Cliniko).
9. Optional: Cliniko to GHL booking-status sync (scheduled Worker polling the Cliniko API; Cliniko has no webhooks).

## Gotchas learned
- **GHL External Tracking** can only map to built-in fields (no custom fields); it maps a checkbox to Terms & Conditions; it reacts to the submit *click* (before validation), which is why `forms.ts` has the capture-phase guard; the same contact is merged by matching email or phone, so re-tests need a **new email and new phone** and don't overwrite existing names.
- The auto-mode safety check blocked: writing Cloudflare secrets, some big combined commands, and `git push` once. Permission rules for git are in `.claude/settings.local.json` (gitignored). Secrets are added by the user in the dashboard.
- `wrangler` OAuth login needs the callback on `localhost:8976` to be alive when the user clicks Allow (start the login, then send the link immediately).
- Cloudflare had an API incident on 6 Nov that caused 503s and failed builds; check cloudflarestatus.com before debugging.
- The `.excalidraw` MCP export is restricted to `/Users/james/Documents/Excalidraw`; copy from there into `docs/`.
- `docs/systems-diagram.mmd` and `docs/Systems_Diagram.excalidraw` were deliberately deleted by the user; don't restore.

- **Resend sandbox sender:** when `MAIL_TEST_TO` is set the Worker sends from `onboarding@resend.dev`, which Resend only delivers to the account owner's own address (Alex's). Sending to any other address returns **403** and the form shows "Sorry, something went wrong". With the domain verified, don't use test mode; the real sender is `bookings@vitalfascia.com.au`.
- Resend has no Sydney region for this account (it shows Tokyo); that doesn't affect delivery. Resend verifies the domain from three records (TXT `resend._domainkey`, CNAMEs `send` and `rsend`), added manually as DNS only. The DKIM TXT value is long; check it with `dig TXT resend._domainkey.vitalfascia.com.au`.
- **Cloudflare free plan limits:** only one rate-limiting rule, with a 10-second window and 10-second block, so "10 per minute" isn't possible; the live rule is 5 per 10 s per IP. Rate-limit tests: GET `/api/contact` returns 405 normally, 429 once limited.
- **Cloudflare dashboard automation:** the auto-mode safety check blocked deleting DNS records from Claude (James did that part by hand). Adding records, attaching Worker custom domains, redirect/rate-limit rules and deleting secrets worked when the user had explicitly asked. Layout of the "Add record" panel shifts after typing a long name or target; take a screenshot before clicking the proxy toggle (it must be **DNS only** for mail and Resend records).
- The form name field rejects punctuation such as brackets (`clean.ts` rule), so use plain letters in test submissions.
- Adding a Worker custom domain (`www`, bare) creates the proxied DNS records automatically; the Squarespace A and `www` CNAME records had to be deleted first.
- Live form tests on 10 Nov 2026 (contact, request-a-call, waitlist, visitor `getjameswebb@gmail.com`, marketing consent unticked) all delivered: 3 notifications to alex@ and 3 confirmations. GoHighLevel tracking was assumed working (tested earlier by James).

## GitHub project board IDs (for `gh project item-edit`)
Owner `Vital-Fascia`, project number 2, project id `PVT_kwDOFGddts4BnGf9`, Status field `PVTSSF_lADOFGddts4BnGf9zhlsqAk`; options: Backlog `f75ad846`, Ready `61e4505c`, In progress `47fc9ee4`, Alex to review `df73e18b`, Done `98236657`. New issues are auto-added to the board.

## People and context
James is the developer/agency owner and has admin access to Alex's Cloudflare, GitHub org and VentraIP. Alex (the client, physio-style soft-tissue therapist, non-technical) will use the CMS and GoHighLevel. Alex is not actively using the site yet. Issues #47 to #71 cover the work so far.
