# Moving the site to Alex's Cloudflare account (James's checklist)

> **Status (10 Nov 2026): Parts 1 to 4 are DONE.** The domain `vitalfascia.com.au` is on Cloudflare DNS (nameservers changed at VentraIP), `www.vitalfascia.com.au` serves the site, the bare domain redirects to `www`, Resend is verified and all three forms were tested live, and email for alex@ was confirmed. Only **Part 5 (tidy-up)** remains. The paragraph below is the older (6 Nov) status, kept for history.
>
> **Older status (6 Nov 2026):** The site runs from Alex's account at `https://vital-fascia-website.alex-c56.workers.dev` and auto-deploys from GitHub `main` (Part 1 done). The CMS login Worker is on Alex's account at `https://sveltia-cms-auth.alex-c56.workers.dev`, `public/admin/config.yml` points at it, and its `ALLOWED_DOMAINS` must be `www.vitalfascia.com.au,vital-fascia-website.alex-c56.workers.dev` (Part 3 done). **Part 2 (Resend) is on hold until Alex is available and will be done together with Part 4 (domain)**, because the Resend DNS records need the domain on Cloudflare first. Until then the form emails fail with an error message. Link-sharing previews (the thumbnail) only work once the real domain points at the site, or temporarily if the build variable `SITE_URL` is set to the workers.dev address.

Written for James, who is already a Super Administrator in Alex's Cloudflare account. Allow about 1.5 hours of work plus DNS waiting time. Do it in the order below, and do the domain (Part 4) last so the live site is never down.

## What is being moved

| Piece | Where it is now | Where it ends up |
| --- | --- | --- |
| Website (Worker with static assets, `vital-fascia-website`) | James's Cloudflare account, built from GitHub | Alex's account, built from the same GitHub repo |
| CMS login helper (`sveltia-cms-auth` Worker) | James's account (`sveltia-cms-auth.getjameswebb.workers.dev`) + a GitHub OAuth app | Alex's account + a GitHub OAuth app owned by the `Vital-Fascia` GitHub organisation |
| Form emails (Resend) | Not set up yet | Resend account on Alex's email, key stored in Alex's Cloudflare |
| Domain `vitalfascia.com.au` | Live on the old Squarespace site (DNS wherever it is registered) | DNS managed in Alex's Cloudflare, pointing at the new site |

The code needs no changes for the move except one line (the CMS login URL, Part 3). The GitHub repository is already in the `Vital-Fascia` organisation, so it does not move.

Before starting, have ready: access to the registrar/domain control panel for `vitalfascia.com.au` (the domain is registered with **VentraIP**; James has admin access), and Alex's email login (for Resend verification emails).

---

## Part 1: Create the website in Alex's account

1. Log in to Cloudflare and switch to **Alex's account** (account picker top-left). Check the name in the sidebar before creating anything.
2. **Workers & Pages > Create application > Import a repository** (connect to Git). Authorise the Cloudflare GitHub app for the **Vital-Fascia** organisation and select `vital-fascia-website`. (You need to be an owner of that GitHub organisation to authorise this.)
3. Project name: `vital-fascia-website` (the name must match `name` in `wrangler.jsonc`, otherwise the build fails).
4. Settings:
   - Production branch: `main`
   - Build command: `npm run build`
   - Deploy command: leave the default (`npx wrangler deploy`)
   - Environment variable (build): `SITE_URL` = `https://www.vitalfascia.com.au`
5. Save and deploy. When it finishes, open the `*.workers.dev` address it gives you. The home page, `/book`, `/admin` and the legal pages should load. (Form emails won't work yet, that is Part 2.)
6. In James's account, **do not delete the old site yet**. Keep it as a fallback until Part 5.

## Part 2: Set up Resend (form emails)

The forms send email through Resend. The free plan (3,000 emails/month, 100/day) is plenty.

1. Go to <https://resend.com> and **sign up using Alex's email** (alex@vitalfascia.com.au), so the account belongs to the business. Add yourself as a team member later if you want (Settings > Team).
2. **Domains > Add Domain**: enter `vitalfascia.com.au`, region **Asia Pacific (Sydney)** if offered.
3. Resend shows DNS records (usually 1 TXT for SPF, 1 or more for DKIM, and an MX for bounces, on a `send.` subdomain). You will add these in Cloudflare DNS in Part 4, once the domain is on Cloudflare. Two options:
   - **Easiest:** after Part 4 step 3, click **Auto configure** in Resend and approve the Cloudflare connection. It adds the records for you.
   - **Manual:** copy each record into Cloudflare **DNS > Records** exactly as shown. Set the proxy to **DNS only** (grey cloud) for all of them.
4. Click **Verify DNS Records** in Resend. Status should become **Verified** (can take a few minutes up to a few hours).
5. **API Keys > Create API Key**: name `vital-fascia-website`, permission **Sending access**, domain `vitalfascia.com.au`. **Copy the key now**, it is shown once (starts with `re_`).
6. Add it to the Worker in Alex's Cloudflare: **Workers & Pages > vital-fascia-website > Settings > Variables and Secrets > Add**, Type **Secret**, name `RESEND_API_KEY`, paste the key, **Deploy**.
7. Check the two non-secret settings in `wrangler.jsonc`: `MAIL_FROM` is `Vital Fascia <bookings@vitalfascia.com.au>` (any address at the verified domain works; it doesn't need a real mailbox) and `NOTIFY_TO` is `alex@vitalfascia.com.au`. Change them in the file and push if needed.
8. **Test all three forms** on the live site (home page "Request a call", `/contact`, `/8-week-program#waitlist`) using your own email as the visitor. You should get a notification at alex@... and a confirmation at your address. If not, see Resend **Logs** and Worker **Logs** (Workers & Pages > vital-fascia-website > Logs). Gmail/Outlook spam folder is worth a look the first time.

Optional hardening (ask me to add it): Cloudflare Turnstile on the forms if spam ever appears. There is already a hidden trap field.

## Part 3: Move the CMS login (`sveltia-cms-auth`)

The `/admin` page logs in with GitHub through a small Worker. Right now that Worker and its GitHub OAuth app are tied to James.

1. **Create a GitHub OAuth app owned by the organisation:** GitHub > the `Vital-Fascia` organisation > Settings > Developer settings > OAuth Apps > **New OAuth App**.
   - Application name: `Vital Fascia CMS`
   - Homepage URL: `https://www.vitalfascia.com.au`
   - Authorization callback URL: `https://<new-auth-worker-address>/callback` (you get the address in step 3; come back and edit this field after deploying)
   - After creating it, copy the **Client ID** and generate a **Client secret**.
2. **Deploy the auth Worker in Alex's Cloudflare account, from your own computer (recommended).** The "Deploy to Cloudflare" button builds in the cloud and currently fails with `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` (the upstream project's lockfile doesn't match the pnpm version Cloudflare's builder uses). The Worker has no runtime dependencies (it's one file, `src/index.js`), so deploying from your machine avoids the problem entirely:
   ```bash
   git clone https://github.com/sveltia/sveltia-cms-auth.git
   cd sveltia-cms-auth
   npx wrangler@latest login      # log in, pick Alex's account if asked
   npx wrangler@latest whoami     # confirm it says Alex's account
   npx wrangler@latest deploy
   ```
   It prints the Worker address (`https://sveltia-cms-auth.<alex-subdomain>.workers.dev`). Don't run `pnpm install`; you don't need it. If `whoami` lists more than one account, add `CLOUDFLARE_ACCOUNT_ID=<Alex's account id>` before the command (the id is in the dashboard URL).
   - *If you did use the button/Git build and it already failed:* delete that half-created Worker project in Alex's account (Workers & Pages > it > Settings > Delete), then use the commands above. Alternative fix if you want the Git build: in its **Settings > Build**, set the build command to `pnpm install --no-frozen-lockfile` and add the build variable `SKIP_DEPENDENCY_INSTALL=1`, then retry.
3. In the Worker's **Settings > Variables and Secrets** add:
   - `GITHUB_CLIENT_ID` (the Client ID)
   - `GITHUB_CLIENT_SECRET` (secret; or from the terminal: `npx wrangler@latest secret put GITHUB_CLIENT_SECRET` inside the cloned folder)
   - `ALLOWED_DOMAINS` = `www.vitalfascia.com.au` (add `vital-fascia-website.<alex-subdomain>.workers.dev` too while testing)
4. Back in the GitHub OAuth app, set the callback URL to the Worker's real address + `/callback`.
5. Update the repo, in `public/admin/config.yml`:
   ```yaml
   base_url: https://<new-auth-worker-address>
   ```
   Commit and push to `main` (the site redeploys). Pull first: Alex's CMS edits commit straight to `main`.
6. Test: open `/admin`, **Sign in with GitHub**, edit something trivial and save, check a new commit appears on `main` and the site redeploys. Alex's GitHub account must be a collaborator (write access) on the repo, or a member of the organisation.
7. Once it works, delete the old auth Worker and the old GitHub OAuth app in James's accounts.

### Tips learned doing Part 3

- **"Update your Wrangler configuration with these changes to keep deployments in sync"**: this notice appears because variables were edited in the dashboard but `wrangler.toml` doesn't list them. Harmless on its own, but the next `wrangler deploy` would **wipe dashboard-set plain variables** (secrets are kept). Fix by adding `keep_vars = true` to `wrangler.toml` (or by listing the non-secret variables under `[vars]`) and deploying once.
- **Retrying that failed `sveltia-cms-auth` Git build never works** (the upstream lockfile problem is permanent). Disconnect it instead. A red build on one Worker doesn't affect the other.
- **Red "latest build failed" pill:** left over from the failed Git build. The Worker now deploys from the command line, so disconnect the Git link: Workers & Pages > `sveltia-cms-auth` > Settings > Builds > **Disconnect**. The old failed entry may stay in the history list but stops being "latest" once nothing builds.
- **Secrets from a `.env` file:** `npx wrangler secret bulk .env` uploads every line of a `.env` file as secrets in one go (run inside the project, with the right account logged in). Plain, non-secret values belong in `wrangler.toml` under `[vars]`. Easier than clicking through the dashboard, and good for the Resend key later (`RESEND_API_KEY=...`). Never commit the `.env` file.

## Part 4: Bring the domain over

`vitalfascia.com.au` currently serves the old Squarespace site, and email for alex@vitalfascia.com.au probably runs on this domain too. **Be careful with email records, getting them wrong stops Alex's email.**

**Cloudflare cannot register or transfer `.com.au` domains**, so the plan is to **keep VentraIP as the registrar** and only change its **nameservers** to Cloudflare (Cloudflare then runs DNS, and the registrar stays where it is). No money changes hands and there is no domain "transfer".

1. **Record what exists today, before touching anything.** The domain is registered with **VentraIP**. In the VentraIP client area open the domain and look at its **DNS** (zone) records, but first confirm where DNS is actually served from (`dig NS vitalfascia.com.au` or <https://who.is>): it may be VentraIP's nameservers, or Squarespace's if the site's DNS was pointed there. Screenshot or copy every record from wherever DNS is really served. VentraIP may also host Alex's **email** (e.g. Microsoft 365, Google Workspace, or VentraIP hosting mailboxes), so identify the email provider now. Pay special attention to **MX** (email), **TXT** (SPF, verification, DKIM, `google-site-verification`, etc.), and any CNAMEs for email or other services.
2. In **Alex's Cloudflare account > Add a domain > `vitalfascia.com.au`**, choose the **Free** plan. Cloudflare scans and imports existing records.
3. **Check the imported records against your list** from step 1. Add anything missing. Keep all MX and email-related TXT records, set to **DNS only** (grey cloud). Delete the old A/CNAME records that point at Squarespace for `@` and `www` (the new site replaces them in step 5). Then add Resend's records (Part 2 step 3).
4. Cloudflare shows two **nameservers** (like `xxx.ns.cloudflare.com`). At the **registrar**, replace the current nameservers with those two. At VentraIP: client area > Domains > the domain > **Nameservers** (choose custom nameservers and enter Cloudflare's two). The menu wording may differ slightly. `.com.au` changes normally apply within minutes to a few hours, and up to 24 hours. The Cloudflare dashboard shows **Active** when it's done and emails you.
   - If the registrar asks for a **domain authorisation / auDA key**, that's for a registrar transfer, not needed here.
   - You need the **registrant/admin login** for this step. Ask Alex.
5. **Attach the domain to the new site:** Alex's Cloudflare > Workers & Pages > vital-fascia-website > **Settings > Domains & Routes > Add > Custom domain**: add `www.vitalfascia.com.au`. Then also add `vitalfascia.com.au` (the bare domain) and set it to redirect to `www` (**Rules > Redirect Rules > Create rule**: if hostname equals `vitalfascia.com.au` then dynamic redirect to `concat("https://www.vitalfascia.com.au", http.request.uri.path)`, status 301). Cloudflare creates the DNS records and issues the HTTPS certificate automatically (a few minutes).
   - The site's canonical URLs and the CMS config assume **`www.vitalfascia.com.au`** as the main address.
6. **Verify:**
   - `https://www.vitalfascia.com.au` loads the new site with a padlock; `https://vitalfascia.com.au` redirects to it.
   - Old Squarespace links redirect (try `/about`, `/services`; defined in `public/_redirects`).
   - **Send a test email to alex@vitalfascia.com.au from another account** and have Alex confirm it arrived, and that Alex can send. If not, a record was missed: compare against your step 1 list.
   - Resend domain shows **Verified**, then re-run the form tests from Part 2.
   - `/admin` login still works on the new domain (check `ALLOWED_DOMAINS` in the auth Worker).
7. Lower the risk: in step 4 you can reduce the TTL on the old records beforehand if the old provider allows it.

If something breaks, rollback is to put the **old nameservers back at the registrar** (written down in step 1).

## Part 5: Tidy up

1. Keep the Squarespace subscription until you're sure everything works for a week or so, then cancel it (the domain is with VentraIP, not Squarespace, so cancelling Squarespace shouldn't affect it. Keep the VentraIP registration renewing, ideally with auto-renew on and Alex's billing details).
2. In James's Cloudflare account, delete the old `vital-fascia-website` and `sveltia-cms-auth` Workers (this stops duplicate builds).
3. Confirm Alex's own Cloudflare login has two-factor authentication on, and that Alex is the account owner. Remove yourself later if desired (or leave Super Admin access for support).
4. Google: if Alex has a Google Business Profile or Search Console, update the website URL if it changed, and add the new site in Search Console (<https://search.google.com/search-console>) with the sitemap `https://www.vitalfascia.com.au/sitemap-index.xml`.
5. Update `docs/content-todos.md` and tell Alex how forms and the CMS work (`docs/client-guide.md`, `docs/client-guide.md`).

## Quick reference

| Thing | Value |
| --- | --- |
| GitHub repo | `Vital-Fascia/vital-fascia-website` (branch `main`) |
| Worker name | `vital-fascia-website` (`wrangler.jsonc`) |
| Build | `npm run build`, build env var `SITE_URL=https://www.vitalfascia.com.au` |
| Secrets needed in Cloudflare | `RESEND_API_KEY` (site), `GITHUB_CLIENT_SECRET` (auth Worker) |
| Plain settings | `MAIL_FROM`, `NOTIFY_TO` (`wrangler.jsonc`), `GITHUB_CLIENT_ID`, `ALLOWED_DOMAINS` (auth Worker) |
| Who gets form emails | alex@vitalfascia.com.au |
| Booking forms | Cliniko (separate, nothing to move) |
