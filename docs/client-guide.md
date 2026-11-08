# Vital Fascia website: owner's guide

This guide is for **Alex** (the owner). **Part A** is everyday editing and needs no technical knowledge. **Part B** explains how everything is built and run, so you (or any developer or AI assistant you hire) can maintain it, move it, or take it over without the original developer.

**Contents**
- Part A: Everyday use. [Log in](#log-in) · [Edit text and photos](#change-some-text) · [Hours, locations and booking](#update-your-contact-details-hours-and-booking-link) · [Forms and automatic emails](#forms-and-automatic-emails) · [Email previews](#preview-the-emails-the-admin-preview-page) · [Marketing consent](#marketing-consent-tick-box) · [CRM and spam filter](#your-crm-gohighlevel-and-the-website-forms) · [Google and link sharing](#change-what-google-and-link-sharing-show)
- Part B: [The big picture](#the-big-picture) · [Accounts you own](#accounts-and-who-owns-what) · [Tech stack](#tech-stack) · [How a change goes live](#how-a-change-goes-live) · [Style guide](#style-guide) · [Using Claude to make changes](#using-claude-to-edit-content-or-code) · [Handing over to a new developer](#handing-over-to-a-new-developer) · [Moving the site or domain](#moving-the-site-or-the-domain) · [Troubleshooting](#troubleshooting)

---

# Part A: Everyday use

## Log in

1. Go to **your website address followed by /admin**, for example `www.vitalfascia.com.au/admin`.
2. Click **Sign in with GitHub** and log in with the GitHub account you were invited with.
3. You'll see a menu on the left with seven groups:
   1. **Home page**: every section of the home page
   2. **Signature program (8-week landing page)**
   3. **Booking page**
   4. **Legal pages**: five separate entries (privacy, cancellation, terms, refund policy, site map page)
   5. **Email templates**: three separate entries, one for each automatic email clients receive
   6. **Forms**: the Contact page form
   7. **Business details & site settings**: contact details, locations and hours, menu and footer, Google and link-sharing settings

## Change some text

1. Click a group on the left (for example **Home page**), then pick the section you want, for example *1. Top banner (Hero)*.
2. Click into a box and type your changes. Small grey hints under each box explain what it's for.
3. Click **Save** at the top right.
4. Wait about 1-2 minutes. Your live website updates automatically.

## Preview what you're changing

Every page and section in the editor has a **preview panel** next to the wording.
- **As you type:** the top part redraws your text, lists and photos in the website's colours as you edit. The real website's layout is a little different, so treat it as a check of the *content*.
- **Show this on the website:** click this to open the page as it is currently published, jumped to the section you're editing. After you save, it updates in about a minute.
- **Hide or show the whole panel:** use the **Editor Options** button at the top of the editor (next to Save) and switch **Show Preview** on or off.
- The **Email templates** preview is special: it draws the finished emails live (see *Preview the emails* below).

## Change or add a photo

1. Open the section with the photo (for example *Top banner* or *About*).
2. Click the photo box, then **Upload** to choose a picture from your computer, or pick one you've already uploaded.
3. **Always fill in "Photo description"**. It helps people using screen readers and helps Google. Describe the picture in one sentence.
4. Click **Save**.

Tip: use clear, bright photos. Large files are fine; the website shrinks them automatically. The recommended sizes are in `docs/image_spec.md`.

## Add, remove or re-order items

Lists (services, testimonials, steps, menu links) show an **Add** button, a bin icon to delete, and a drag handle to re-order. **For testimonials, the order is the order on the website**: the first ten are the most visible, so drag your best reviews to the top.

## Hide a section

Most home page sections have a **Show this section on the website** switch. Turn it off and save to hide the whole section.

## Update your contact details, hours and booking link

Go to **Business details & site settings > Contact details & opening hours**. Under **Clinic locations** you will find Sydney CBD and Double Bay. Each has its own address, **opening hours**, map and Cliniko booking links.

- **Opening hours are entered once, here.** The website footer and the booking page both use them, so change them in this one place only.
- Every "Book" button on the site opens the booking page (`/book`), where visitors choose a location and the right Cliniko booking form appears. Its wording is under **Booking page**.
- The Cliniko booking forms themselves (services, prices shown inside the form, cancellation text inside the form) are edited **in Cliniko**, not here.

## Open or close the "Before your first visit" questions

On the website the questions are hidden until a visitor clicks the heading. Edit them under **Home page > Pricing & offers**. Leave a blank line between paragraphs in an answer.

## Forms and automatic emails

The website has three forms: **Request a call** (home page), the **Contact** page and the **8-Week Program waitlist**. They all work the same way.

### What happens when someone fills one in

1. A visitor fills in the form and presses the button.
2. The website sends their details to a small program that runs on Cloudflare (the "Worker").
3. The Worker sends **two emails** straight away:
   - **To you** (alex@vitalfascia.com.au): a summary of what they entered, for example "New call request: *Name*", "New website message: *Name*" or "New waitlist sign-up: *Name*". Phone numbers are tap-to-call. Press **Reply** to write straight back to them.
   - **To the visitor**: a confirmation in the website's colours with a short "what happens next" list.
4. The visitor sees a thank-you message on the page.

Nothing is stored on the website. **Your inbox is the record of requests.**

### Change the wording of the confirmation emails

Go to **Email templates**. There is one entry for each form's email (call request, contact message, waitlist). You can edit the subject, greeting, steps and sign-off. Put `{name}` in the greeting and it becomes the visitor's first name. Changes go live a minute or two after you save. The emails sent *to you* are fixed.

### Preview the emails

**While you edit:** in **Email templates**, open an email and look at the preview panel next to the wording (if you can't see it, use the preview/eye button at the top of the editor). It draws that finished email as you type, using a sample person called "Jordan", and has an **Open the full preview page** button.

**The full preview page (the admin preview page):** to see every email, including the ones sent *to you*, open the private page at **`your-website-address/admin/email-previews`**. Bookmark it. It also has an **Edit the wording** button, and a link back to the editor.

- It has a dark bar across the top that says **ADMIN AREA**, so you always know you're in the private part of the site. Use **← Back to the website editor** to return.
- Click any email in the list on the left to see it, and use **Computer / Phone** to see how it looks on each.
- The emails are shown with a sample person, "Jordan Smith". Real emails use whatever the visitor typed.
- After you save changes in the editor, the preview updates in a minute or two.
- The page is not linked from the public website, is hidden from Google, and holds no private data (only the wording of emails that anyone who fills in a form receives). If you ever want it locked behind a login, see *Locking the admin area* in Part B.

### If something goes wrong with forms

- **Visitors see an error / no emails arrive:** check the Resend dashboard (resend.com) > **Logs**, which shows every email and why one failed. Check the domain shows *Verified* there.
- **Emails land in spam:** confirm the domain is verified in Resend; ask the visitor to add bookings@vitalfascia.com.au to their contacts.
- **Spam submissions:** the forms have a hidden trap field that blocks most bots. If it becomes a problem, ask a developer to add Cloudflare Turnstile (a free, invisible CAPTCHA).

## Marketing consent tick-box

Under each website form there is a small tick-box asking whether the person is happy to receive updates and offers. Australian law (the Spam Act) says you need a person's consent before sending them marketing email or SMS, so this is how you collect it.

Go to **Business details & site settings > Marketing consent tick-box** to control it:
- **Show the tick-box on the website forms:** one switch to turn it on or off everywhere. Keep it on if you send newsletters, offers or SMS.
- **Tick the box by default:** off by default, and we recommend leaving it off. In Australia, agreeing to marketing generally has to be an active choice, so a pre-ticked box may not count as consent. Get advice before turning this on.
- **Wording, extra small words, and the Privacy Policy link text:** edit freely. Keep it short and clear.
- **Show on each form:** separate switches for *Request a call*, the *Contact page* and the *8-Week Program waitlist*.

What happens to the answer: the notification email you receive says whether they ticked it ("Marketing updates: Yes/No"), and GoHighLevel receives it as a form field. Only send marketing to people who ticked it, and always include an unsubscribe link. **Messages about someone's own appointment or enquiry are not marketing.**

## Your CRM (GoHighLevel) and the website forms

A small tracking script from GoHighLevel is on every page, so each form submission creates a contact in your CRM (with the form name, the page, and where the visitor came from). You can switch the script off under **Business details & site settings > GoHighLevel tracking**.

One-off setup inside GoHighLevel (done once per form): map the form fields to contact fields, as in the table below. Don't map the hidden field called `website`.

| Form (name in GoHighLevel) | Fields to map |
| --- | --- |
| `request-a-call-form` | `name` to full name, `phone` to phone, `email` to email, `marketing_consent` to a "Marketing consent" field |
| `contact-form` | `name`, `email`, `phone`, `message` (to a "Message" custom field), `marketing_consent` |
| `waitlist-form` | `first_name` to first name, `email`, `marketing_consent` |

**To do for Alex: set up a spam filter in GoHighLevel.** The tracking script sees every submission in the visitor's browser, including spam and bots. The website's own email notifications are already filtered, but the CRM is not. In GoHighLevel, create a workflow (Automation > Workflows) that starts when an external form is submitted and checks the details: for example, if the phone number is empty or invalid, or the name looks like random letters, add the tag `possible-spam` and stop. Review that tag now and then and delete the contacts. If spam becomes a real problem, ask a developer to add Cloudflare Turnstile (an invisible CAPTCHA) or to send leads to GoHighLevel from the website's server instead, where bots are already filtered out.

## Change what Google and link sharing show

Go to **Business details & site settings > Google search & link-sharing preview**.

- The *Page title* and *Page description* for each page are what people see in Google results.
- **Link-sharing preview image** is the picture shown when someone shares your website link on WhatsApp, Facebook, iMessage and similar. Use a wide picture, **1200 × 630 pixels**, with the important part in the middle. Apps remember old previews, so changes can take a while to show up.

## Tips

- Only publish true information: prices, results and testimonials (with the person's permission).
- Changes can take 1-2 minutes to appear. Refresh the page if you don't see them.
- Made a mistake? Every change is saved and can be undone by a developer (see *Undo a change* below).
- Trouble logging in or something looks broken? See *Troubleshooting* in Part B, or contact your web developer.

---

# Part B: How it all works

## The big picture

- The website is a **static site**: pages are built ahead of time and served from Cloudflare's network, so it is fast and cheap to run. There is no database and no WordPress.
- **The code and all content live in one GitHub repository**: `Vital-Fascia/vital-fascia-website`. The content you edit in the editor is saved as text files in that repository.
- When anything is saved to the `main` branch (by you in the editor, or by a developer), **Cloudflare automatically rebuilds and publishes the site** in about a minute.
- A small **Worker** (code that runs on Cloudflare) handles the form emails. Booking happens in **Cliniko**, which is embedded on the booking page.

```
 You (editor at /admin) ─┐
 Developer / Claude ─────┼─►  GitHub repo (main)  ─►  Cloudflare builds + publishes  ─►  www.vitalfascia.com.au
                         │                                    │
 Visitors fill a form ───┴───────────────────────────────►  Worker  ─►  Resend  ─►  emails to you + the visitor
 Visitors book ───────────────────────────────────────────►  Cliniko (embedded on /book)
```

## Accounts and who owns what

Make sure the **business owner (Alex) owns every account** below and that any developer is added as a team member, not the other way round.

| Service | What it does | Who should own it | Cost |
| --- | --- | --- | --- |
| **GitHub** (organisation `Vital-Fascia`) | Stores the code and content, and its history | Alex (organisation owner) | Free plan |
| **Cloudflare** | Hosts the website and the Worker, runs the DNS for the domain | Alex | Free plan covers a site this size (check Cloudflare's current limits) |
| **Resend** (resend.com) | Sends the form emails | Alex's email address | Free plan (3,000 emails a month at the time of writing) |
| **Cliniko** | Appointment booking and client records | Alex | Cliniko subscription |
| **VentraIP** | Where the domain `vitalfascia.com.au` is registered | Alex | Yearly domain renewal. Keep auto-renew on |
| **TyroHealth** | Health-fund rebate claims | Alex | Per Tyro's terms |

Keep a password manager entry for each, and turn on two-factor authentication for GitHub, Cloudflare and VentraIP.

**Secret values** (never put these in the code or in chat): the Resend API key (`RESEND_API_KEY`) and the GitHub OAuth client secret for the editor login (`GITHUB_CLIENT_SECRET`). They live only in the Cloudflare dashboard, as *Secrets*.

## Tech stack

| Part | Choice |
| --- | --- |
| Framework | **Astro 7**, static output, TypeScript |
| Styling | Plain CSS with design tokens (`src/styles/tokens.css`) and scoped styles per component. No Tailwind, no UI framework |
| Client JavaScript | Kept minimal: menu, testimonial carousel, collapsible sections, forms, booking page |
| Fonts | Newsreader (headings) and Work Sans (body), self-hosted via `@fontsource-variable` |
| Editor / CMS | **Sveltia CMS** at `/admin`, configured in `public/admin/config.yml`. Saves straight to GitHub |
| Editor login | A tiny Worker (`sveltia-cms-auth`) plus a GitHub OAuth app owned by the `Vital-Fascia` organisation |
| Hosting | **Cloudflare Workers with static assets**, deployed from GitHub (`wrangler.jsonc`) |
| Form emails | Worker `worker/index.ts` + email templates `worker/emails.ts`, sent through **Resend** |
| Booking | **Cliniko** embedded on `/book` (one booking form per location) |
| Markdown | `marked` renders the legal pages |
| Requirements | Node 22.12 or newer |

### Where things live in the repository

| Path | What |
| --- | --- |
| `src/content/*.yaml` | **All the wording, images, hours and prices.** One file per section (each legal page and each email has its own file). This is what the editor changes |
| `src/content.config.ts` | The "shape" (schema) of each content file. Must match the editor config |
| `public/admin/config.yml` | The editor's menus, labels and hints. Must match the schemas |
| `src/components/` | Page sections (Hero, Offers, Footer and so on) |
| `src/pages/` | Pages: home, book, contact, 8-week program, legal, site map, `admin/email-previews` |
| `src/styles/tokens.css` | Colours, fonts, spacing: **the single source of truth for the design** |
| `src/styles/global.css` | Shared styles (buttons, forms, headings) |
| `src/assets/uploads/` | All photos (and only here) |
| `worker/` | The Cloudflare Worker (form handling) and the email templates |
| `wrangler.jsonc` | Cloudflare configuration |
| `docs/` | This guide, image specs, content to-dos, the migration checklist |
| `CLAUDE.md` | House rules for AI assistants working on the code |

**The three-places rule:** adding or changing an editable field means updating the YAML file, the schema in `src/content.config.ts`, and the editor config `public/admin/config.yml` together.

### Useful commands (for developers)

```bash
git pull            # always first: editor saves commit straight to main
npm install
npm run dev         # local site at http://localhost:4321
npm run build       # production build into dist/
npx astro check     # type-check
```

Test the form Worker locally: run `npm run build`, put `MAIL_DRY_RUN=true` in a `.dev.vars` file, run `npx wrangler dev`, then POST to `/api/discovery-call`, `/api/contact` or `/api/waitlist`. Emails are printed to the console instead of sent.

## How a change goes live

1. Someone saves in the editor, or pushes a commit to `main`.
2. Cloudflare's build (connected to the GitHub repository) runs `npm run build` and publishes the result. The build setting `SITE_URL` should be `https://www.vitalfascia.com.au`. It is used for the sitemap and for share-preview links.
3. About a minute later the live site shows the change. Build history is in Cloudflare: **Workers & Pages > vital-fascia-website > Deployments**. A red build means the change did not publish; the previous version stays live.

### Undo a change

Every save is a commit in GitHub. A developer can open the repository's **Commits** list, find the change and use **Revert**, which publishes the previous version again.

## Style guide

The design source of truth is `src/styles/tokens.css`. Use these values rather than inventing new ones.

**Mood:** calm, grounded, professional. Natural earthy colours, generous white space, an editorial serif for headings, a clean sans-serif for reading.

### Colours

| Name | Value | Use |
| --- | --- | --- |
| Olive | `#4a5240` | Brand colour: buttons, links, accents, dark sections |
| Olive dark / deep | `#3a4033` / `#333b2c` | Hover states, darker bands |
| Bone | `#f5f1e7` | Main page background |
| Sand | `#eae1cd` | Alternate section background |
| Cream | `#f2ecdd` | Text on dark backgrounds |
| Ink | `#241f1a` | Main text |
| Ink muted | `#5c5548` | Secondary text |
| Charcoal | `#221e19` / `#19160f` | Footer, darkest bands |
| Stone | `#b3a890` | Borders and dividers |
| Gold | `#c9a96c` | Small highlights (stars, the admin bar) |
| Sage | `#8fa07c` | Soft accent |

### Typography

- **Headings:** Newsreader (a serif), medium weight; italics for emphasis words.
- **Body and buttons:** Work Sans.
- **Eyebrow labels:** small, uppercase, widely spaced, in olive, above a heading.
- Body text is about 17-19px; use plain, warm, specific language.

### Components

- **Buttons:** solid olive (primary), outlined olive (secondary), outlined cream (on dark). Slightly squared corners (3px).
- **Cards:** white on bone/sand, a hairline border, 2px radius, a soft lift on hover.
- **Spacing:** sections have generous vertical padding (`--band-pad`); content is at most 1180px wide with side gutters that shrink on phones.
- **Motion:** slow, calm fades and slides; all animation turns off for visitors who prefer reduced motion.

### Voice and content rules

- Plain English, friendly and confident, never salesy. Explain the "why" (the pattern behind the pain), not just the treatment.
- **Never invent** prices, credentials, results or testimonials. Only publish real, confirmed information.
- Photos: real photos of Alex, the clinic and treatments; always add a description (alt text). Sizes are in `docs/image_spec.md`.
- Quality bar: works well on a phone first, readable contrast, usable with a keyboard.

## Using Claude to edit content or code

You can ask an AI assistant such as Claude to make changes, with your review before they go live. Everything it needs is in the repository (`CLAUDE.md` tells it the rules: where content lives, never to invent business details, and so on).

### What you need

1. A **GitHub account with write access** to the `Vital-Fascia/vital-fascia-website` repository (or the organisation).
2. A Claude account (claude.ai). Product names and screens change, so check Anthropic's current documentation (docs.claude.com) if a step below looks different.

### Option 1: Claude Code (most capable, on a computer)

1. Install **Git** and **Node 22.12+**, then install Claude Code (see docs.claude.com for the current install command) and the GitHub command line tool (`gh`).
2. Log in to GitHub from the terminal: `gh auth login`.
3. Download the project and open Claude Code inside it:
   ```bash
   gh repo clone Vital-Fascia/vital-fascia-website
   cd vital-fascia-website
   npm install
   claude
   ```
4. Ask in plain English, for example: *"Change the Friday Sydney CBD hours to 7am - 3pm"* or *"Add a new FAQ about parking."* Claude reads `CLAUDE.md`, edits the right files, can run `npm run build` to check, and can commit.
5. **Review before publishing.** Ask Claude to *"make a branch and open a pull request"* instead of pushing straight to `main`. Pushing to `main` publishes the website within a minute.

### Option 2: Claude on the web, connected to GitHub

claude.ai can connect to a GitHub repository (via the Claude GitHub app) so you can work on the code from a browser or phone without installing anything. Connect GitHub in Claude's settings, choose the repository, describe the change, and review the pull request it creates before merging.

### Option 3: Ask Claude from a GitHub issue or pull request

Claude Code can also be added to the repository (run `/install-github-app` inside Claude Code) so you can mention `@claude` in an issue or pull request and it will propose the change. This needs an Anthropic API key stored as a GitHub secret, so ask a developer to set it up.

### Good habits when using AI to change the site

- Start with `git pull`, because edits made in the editor commit directly to `main`.
- Ask for small, specific changes and look at the **diff** (what changed) before approving.
- Content changes should go through the YAML files (never hard-coded into pages). Claude is told this in `CLAUDE.md`.
- Never paste passwords, API keys or the GitHub client secret into a chat. Secrets are only added in the Cloudflare dashboard.
- After a change, check the live site on a phone as well as a computer.

## Handing over to a new developer

Give them:
1. **GitHub:** invite them to the `Vital-Fascia` organisation (write access to the repository).
2. **Cloudflare:** add them as a member of Alex's account (Manage Account > Members). Prefer a role that can manage Workers rather than full administrator.
3. **Resend, Cliniko, VentraIP:** only if their work touches them (email deliverability, booking forms, DNS/domain).
4. **This guide, `README.md`, `CLAUDE.md`, `docs/migration-to-client-cloudflare.md` and `docs/content-todos.md`.**

A competent developer comfortable with Astro, TypeScript and Cloudflare can pick it up in an hour. Items worth telling them up front:
- All client-facing content is in `src/content/*.yaml` and must never be hard-coded in components.
- The editor config and the schemas must be kept in sync with the YAML (see the three-places rule).
- Pushing to `main` deploys to production.
- Opening hours exist in exactly one place (`src/content/contact.yaml`).
- `docs/content-todos.md` lists content that still needs confirming with the client.

## Moving the site or the domain

### Locking the admin area (optional)

`/admin` (the editor) already needs a GitHub login to save changes, but the page itself, and `/admin/email-previews`, can be loaded by anyone who knows the address. The previews contain nothing private. To lock both behind a login anyway, use **Cloudflare Zero Trust > Access > Applications**, add a *Self-hosted* application for `www.vitalfascia.com.au/admin*`, and allow only Alex's email address (the free plan covers small teams). Do not lock `/admin/config.yml` or the editor's GitHub callback if editing starts failing; test after enabling.

### Moving to another Cloudflare account

Follow `docs/migration-to-client-cloudflare.md`. It covers: creating the site from the GitHub repository, the editor login Worker, Resend, and the domain.

### Moving the domain

- The domain is registered with **VentraIP**; the registration (renewals, ownership) stays there unless you choose to transfer it.
- **DNS** (the settings that point the domain at the website, email and Resend) is managed in **Cloudflare**. To point the domain somewhere else, change the nameservers at VentraIP.
- **Before changing DNS**, write down every existing record, especially **MX** and email **TXT** records (SPF, DKIM, DMARC) so email keeps working.
- A `.com.au` domain can be transferred to another registrar using an authorisation code from VentraIP; Cloudflare itself does not register `.com.au` domains.

### Moving to a different host

The website is plain static files, so it can run on any static host (Netlify, Vercel, GitHub Pages and others) with `npm run build` and the `dist/` folder. What would need replacing:
- the **form Worker** (`worker/`): re-implement the three `/api/*` endpoints on the new host (the code in `worker/emails.ts` is plain TypeScript and reusable);
- the **editor login** (`sveltia-cms-auth`) for the new address;
- the headers and redirects files in `public/_headers` and `public/_redirects`.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Saved in the editor but the site didn't change | Wait 2 minutes, hard-refresh. Then check Cloudflare > Deployments for a red (failed) build |
| Can't log in to `/admin` | You need GitHub access to the repository. The login Worker's `ALLOWED_DOMAINS` must include the website address you're using |
| "Sign in" opens then closes with no login | The GitHub OAuth app's callback URL or the login Worker's variables are wrong; see the migration checklist |
| Form shows an error | Resend: is the domain *Verified* and does the `RESEND_API_KEY` secret exist? Check Resend > Logs and Cloudflare > the Worker > Logs |
| Emails go to spam | Resend domain verification (SPF/DKIM) incomplete |
| A Cliniko booking form shows old text | That text is inside Cliniko; edit it there |
| Share preview has no picture | The domain must point at this site, and the sharing image must be set. Apps cache old previews |
| Build fails after a content change | A field was left empty or has a typo (for example a quote mark in a YAML value). A developer can read the build log |
