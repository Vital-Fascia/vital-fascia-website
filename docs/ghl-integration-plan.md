# GoHighLevel (GHL) integration plan

**Purpose:** work out what we can connect to Alex's GoHighLevel account, what is worth connecting for a clinic like Vital Fascia, and a phased plan that fits how the site is built. Written for James to talk through with Alex.

**Status (updated 8 Nov 2026):** option D (GHL External Tracking script) is built, live on the test site and working for all three forms; field mapping, consent tick-box and privacy updates are done (final verification pending James's re-test). Resend emails are built and waiting on the Resend domain. A one-page picture for Alex is in `docs/systems-diagram.md`. The sections below were written as research and keep their original wording.

**Original status:** research and recommendation only. Nothing had been built or connected. Research date: 8 Nov 2026. Updated with Alex's real GHL screenshot (white-labelled by the agency **GATHR**).

**How confident is this?** The site/Cliniko/Resend facts come from the project and the vendors' own docs. For GHL I could mostly find third-party guides and a few official pages, so anything marked **(verify)** should be checked in Alex's actual GHL account or GHL's help centre before we build on it. Sources are listed at the end.

---

## 1. The short version

1. **Keep the architecture we have, and add GHL as the CRM behind it.** The website forms already post to our Cloudflare Worker. Add one step there: after the emails are sent, also create or update the person in GHL (with tags saying where they came from). Nothing about the visitor experience changes.
2. **Forms and email templates do not have to go through GHL.** They can stay as they are (our branding, our preview page, instant delivery). GHL then handles what it is good at: follow-up, nurture sequences, SMS, pipeline, marketing emails.
3. **Resend and GHL overlap only a little, and using both is normal.** Resend sends the instant one-to-one "we got your request" email from code. GHL runs campaigns and sequences to lists. Keep them on **separate sending (sub)domains** so one can't damage the other's reputation.
4. **The deliverability warning in GHL is real and does apply to us** (section 4): set up a dedicated sending domain *before* sending any marketing email from GHL, and warm it up slowly.
5. **Cliniko is the weak link for tracking.** It has no webhooks in its public API docs and the booking form runs in an iframe we cannot read. The practical way to know "this person booked / attended" is a small scheduled job that checks the Cliniko API and updates GHL (section 5).
6. **Analytics:** start with free, privacy-friendly traffic stats plus Google Search Console, and add GA4 only when Alex wants conversion tracking or paid ads (section 6).

---

## 2. What each tool is for

| Tool | Role in this business | Source of truth for |
| --- | --- | --- |
| **Website** (Astro + Cloudflare Worker) | Brand, content, lead capture forms, booking page | Wording, hours, locations |
| **Cliniko** | Practice management: appointments, patient records, clinical notes, reminders, payments | Who is a patient, bookings, clinical info |
| **GHL** | CRM and marketing automation: leads, pipeline, follow-ups, SMS, campaigns, reputation/reviews | Leads, marketing consent, campaign history |
| **Resend** | Developer email API for instant automatic emails sent from our code | Nothing (it just delivers) |
| **Google (Search Console, GA4)** | How people find and use the website | Traffic and conversion stats |

**Principle: keep clinical information in Cliniko only.** GHL should hold contact details, lead source, marketing consent and appointment status (booked / attended), never symptoms or treatment notes. See section 7.

---

## 3. Your questions

### Q1. Do the forms and email templates need to go through GHL?

**No.** There are three ways to do it:

| Option | How it works | Pros | Cons |
| --- | --- | --- | --- |
| **A. Worker sends emails *and* pushes the lead to GHL (recommended)** | Today's flow, plus one API call to create/update the contact in GHL | Our designed emails stay; instant, reliable confirmations; we control the form UX; GHL still gets every lead | One more integration to maintain; needs a GHL API token stored as a secret |
| **B. Worker posts to a GHL workflow webhook, GHL does everything** | The Worker sends the details to a GHL "Inbound Webhook" workflow; GHL creates the contact, sends confirmation email/SMS and notifies Alex | Alex can change automations inside GHL without a developer | The inbound webhook trigger may be a premium feature **(verify)**; we lose the CMS email templates and live previews; one more thing to rebuild in GHL's email builder |
| **C. Replace our forms with GHL's embedded forms** | iframe/script from GHL | Fast to set up; GHL attribution works natively | Looks and feels less like the site (we have a carefully built form UX); less control over spam, accessibility and mobile; another third-party script on the page |

| **D. GHL External Tracking script** (found by James) | Paste one GHL script into every page. It auto-detects ordinary HTML forms and, on submit, creates/updates the GHL contact, records UTM/page/session data, and fires GHL workflow triggers ([GHL article](https://help.gohighlevel.com/support/solutions/articles/155000006092-tracking-external-forms-with-gohighlevel)) | **Simplest**: no API token, no Worker code, no Cloudflare secret. Captures attribution (UTMs, page, session) automatically, so we don't hand-build it. Tracks anonymous page views too (workflow triggers). "External Tracking" is already in Alex's GHL settings menu | Runs in the visitor's browser: blocked by ad blockers/tracking protection, so some leads will be missed. Can't tell real submissions from spam or failed ones (see section 3a). Third-party script on every page raises cookie/consent questions. Iframes (the Cliniko booking form) are not read. Plan/premium requirements aren't stated in the article **(verify)** |

**Recommendation:** start with **D** (see section 3a for how it fits our forms), keep **A** as the upgrade if D proves unreliable or noisy. If Alex prefers to manage all automations himself in GHL later, we can move to **B** without touching the website forms (only the Worker's last step changes).

### 3a. Does GHL External Tracking suit our forms? (James's find)

**Your reading is right, and it is a good option we should have listed.** It needs no API token or code in the Worker, and it is the easiest way to get leads, source and page-view data into GHL. How it fits our site, from the article:

| Check | Result for us |
| --- | --- |
| Script placement | One script before `</body>` on every page. Easy: we'd add it to the base layout, with the script address stored in the CMS settings (so Alex can change/remove it) |
| Form detection | Needs a standard `<form>`, inputs with `name`, visible, and an email field for contact creation. **Our forms qualify** (Request a call, Contact, Waitlist all have named fields and an email) |
| JavaScript-submitted forms | The article doesn't say. Ours are submitted by JavaScript (`fetch`) and we call `preventDefault()` on the submit event. GHL's script *probably* still sees the submit event, but **we must test this first** |
| Field mapping | By name/label. Our fields: `name`, `phone`, `email`, `message`, and `first_name` (waitlist). Expect to check how a single `name` field is split into first/last name in GHL |
| Attribution | Captures UTM parameters, page URLs and session data automatically. This replaces the hidden UTM/referrer fields I proposed. The "Source" field behaviour isn't described **(verify)** |
| Hidden fields | The article says fields must be visible and doesn't say whether hidden inputs are captured |
| Plan/premium | Not stated **(verify)** with GATHR. The menu item exists in Alex's account, which is a good sign |
| Consent | Not covered |

**Real downsides to be aware of**
1. **Spam goes straight into the CRM.** Our Worker discards bot submissions (hidden trap field, origin check, validation), but the GHL script runs in the browser before any of that: a bot that submits the form is still seen by GHL. Failed or invalid submissions are seen too. Fix options: filter in a GHL workflow (for example require a valid-looking phone), or later move to option A where only Worker-approved submissions are sent. Alex's notification emails stay clean either way, because they come from the Worker.
2. **Blocked scripts = missing leads.** Ad blockers and some privacy browsers block third-party tracking scripts. A browser-side capture will miss those people. The Worker's email to Alex still arrives, so no enquiry is lost, but the CRM can be incomplete.
3. **Cookies and consent.** The script tracks page views of anonymous visitors, so it is tracking, with its own cookies/identifiers **(verify)**. That changes our earlier "no cookie banner needed" analytics position (section 6) unless the script only loads after consent. Update the Privacy Policy either way.
4. **Don't double up.** Use either D or A to create contacts, not both, or you will get duplicates and conflicting tags (unless we deliberately dedupe by email).
5. **Cliniko is still separate.** It can't see inside the booking iframe, so "booked/attended" still needs the Cliniko sync in phase 2.

**Test results (8 Nov 2026, normal browser with an ad blocker on)**
- All three forms were detected, and the contact mapped correctly (first name, last name, email, phone). Contact source was set to `external_form`. Page visits also appear on the contact's activity timeline.
- The ad blocker did not stop the script (it is served from GATHR's own link domain). Other privacy tools (Brave, Safari with strict tracking protection) are untested.
- Every submission showed as "Unidentified Form". Fixed by giving each form an id and name (`Request a call`, `Contact message`, `8-Week Program waitlist`), which also lets GHL workflows filter by form name.
- Attribution showed "Direct traffic" because the test did not include UTM parameters, and the contact already existed (first attribution `CRM UI` is set only when a contact is first created). Re-test with a **brand-new email** and a landing link with `?utm_source=...&utm_medium=...&utm_campaign=...`.

**Round 2 test results (8 Nov 2026, incognito, UTM link)**
- Forms detected with the correct names (`request-a-call-form`, `contact-form`). Email, phone, UTM campaign and page visits arrived. Contact source `external_form`.
- **First/last name did not arrive** until the form fields were **mapped inside GHL** (External form settings). It was a mapping step, not a code fault. Mapping is done once per form; see the table in the client guide. Existing test contacts stay blank (and GHL won't overwrite the name of a contact it merges by matching email or phone).
- **Outcome:** option D (External Tracking script) works for our forms. We keep it, and keep option A (Worker API) as the upgrade path if spam or missed leads become a problem.

**Added in response (8 Nov 2026)**
- A marketing consent tick-box, controlled in the editor (on/off, default unticked, wording, per-form switches). The notification email records the answer, and GHL receives `marketing_consent` as a form field to map.
- Privacy Policy updated for the CRM, overseas providers, tracking and marketing consent (needs Alex's approval).
- TODO for Alex: a spam-filter workflow in GHL (see the client guide).

**Findings after mapping (9 Nov 2026)**
- **External Tracking can only map to built-in fields** (names, phone, email, address fields, organization, website, Terms & Conditions, Source, Captcha). It **cannot map to custom fields**, and it auto-maps a consent checkbox to "Terms & Conditions", which is not a per-contact field, so it can't drive automations or smart lists.
- **It captured a form the browser had rejected** (an email with no `@`). The script appears to react to the submit-button click, before validation. Mitigated on our side by validating in a window-level capture handler that stops the click before any other script sees it. Not yet verified against GHL; re-test with an invalid email.
- **Changes made:** the consent control is now a Yes/No choice (values `Consent` / `No consent`, "No consent" selected by default) so it can be matched by name to a *Marketing Consent* custom field via Automatic mapping, and every submission carries an explicit answer. All forms now clean and validate data (names, phones, emails, messages) in the browser and on the server, with bot traps, an origin check and spam heuristics on the server.
- **If Automatic mapping doesn't fill the custom field, move to option A** (Worker sends each lead to GHL via the API with the custom field and a tag). That also stops spam reaching the CRM and gives exact control over the data. It needs a GATHR-provided token with contact read/write scopes.

**Proposed test (about an hour)**
1. In GHL: Settings > External Tracking > copy the script. Add it to a *test* copy of the site only (the workers.dev address), not production.
2. Submit each of the three forms with a test email/phone and a `?utm_source=test` link.
3. In GHL check **Sites > Forms > Submissions > External Forms**, the contact record, and unmapped fields.
4. Check: was our JavaScript-submitted form detected? Was the name split correctly? Did the trap field (`website`) show up as an unmapped field? Were UTMs captured? Does it work with an ad blocker off and on?
5. Decide: keep D, or move to A.

### Q2. Is Resend doing exactly the same job as GHL? Can we use both?

**Partly overlapping, different jobs, and yes you can use both.**

- **Resend** is a developer email delivery service. Our code calls it to send an email immediately: "your request came through." It has no contacts, campaigns, pipeline or SMS. Its free plan covers 100 emails a day / 3,000 a month for transactional email; marketing has separate limits ([Resend limits](https://resend.com/docs/knowledge-base/resend-sending-limits)).
- **GHL** is a CRM with a built-in email and SMS marketing engine: lists, sequences ("3 days after they request a call, send X"), SMS, a sales pipeline, unsubscribe handling, reporting.
- **They can be chained:** GHL can use any SMTP provider for its own sending, and third-party guides describe pointing GHL at Resend's SMTP (`smtp.resend.com`, port 587) **(verify)**. But we would not recommend it: GHL's own SMTP help says SMTP only reports sent/open/click/bounce (no "delivered" event) and support for it is best-effort ([GHL SMTP article](https://gohighlevelassist.freshdesk.com/support/solutions/articles/48001059689-setting-up-smtp-providers)), and it adds a dependency without much benefit.

**Decision (8 Nov 2026): keep Resend and our own templates, alongside GHL.** Now that GHL capture works, this is still the recommendation, mainly for resilience:
- **The base site works without GHL.** If GHL has an outage, is blocked in a visitor's browser, or Alex changes CRM, the website still emails Alex every enquiry and still confirms to the visitor.
- **Server-side beats browser-side for the essentials.** The GHL script runs in the visitor's browser, so it can be blocked and it sees spam. The Worker sees only real, validated submissions, so Alex's notification emails are clean and complete.
- **Branded, instant, previewable.** The templates are editable in the CMS with live previews, and Resend's free plan covers the volume.
- **Separate reputations.** Instant emails and marketing emails are sent from different domains, so a marketing problem can't stop confirmations.
- **Costs:** two systems to keep in mind and a one-time domain setup. Avoid duplicate confirmations by having GHL automations start *after* the website's instant email.
- Revisit only if Alex wants every email, including instant confirmations, managed inside GHL. The Worker's email step could then be switched off without touching the forms.

**Recommended split**
- **Resend:** instant automatic confirmations from the website forms, and the notification email to Alex (what we have now).
- **GHL:** everything *after* that: follow-up sequences, SMS, newsletters/offers, re-engagement, review requests.
- **Avoid doubling up:** decide that the website confirmation comes only from our Worker, and set GHL workflows to *not* send their own instant confirmation for those leads (otherwise people receive two).

### Q3. GHL says a dedicated sending domain is important. Is that relevant to us?

**Yes. And the screenshot of Alex's account shows it applies right now.**

**What the screenshot shows (Settings > Email Services > SMTP Service):**
- The account is a **white-labelled GHL called "GATHR"** (the agency who set it up), and the sub-account is "Vital Fascia, Sydney NSW".
- The default provider is the **LeadConnector Email System**, and its sending domain is **`marketing.gathrspace.com.au`**. That is the *agency's* domain, not `vitalfascia.com.au`. Any email sent from this account today goes out from Gathr's shared domain, alongside whatever Gathr's other clients send.
- GHL's warning says: "Not having a dedicated sending domain can lead to several issues when it comes to email communication", for example deliverability problems because "shared or unknown domains lack a positive email reputation" (the box has a "Show More" with more issues).
- There is a **Dedicated Domain And IP** button in the top right. There is also **Add Service** (to plug in your own SMTP) and tabs for Email Analytics, Risk Assessment, Bounce Classification and Postmaster Tools, which are useful for monitoring once it's set up.

**So the answer is: set up a dedicated sending domain for Vital Fascia before any marketing email goes out**, using the button above (and ask Gathr whether a dedicated IP is included or an extra cost **(verify)**).

What the research says:
- By default, GHL's "LC Email" sends from shared infrastructure. Even with an LC Email *dedicated sending domain*, one source notes you still share the sending IP address with other HighLevel users, and that using your own SMTP/Mailgun account gives you a reputation that is yours alone ([InboxAlly](https://www.inboxally.com/blog/gohighlevel-email-deliverability), [Mailreach](https://www.mailreach.co/blog/gohighlevel-email-warmup)). These are vendors with their own interests, so treat the strength of the claims with care.
- A new sending domain needs gradual **warm-up**: start with low volume and build up. GHL's built-in warm-up is described as a daily send cap rather than real reputation-building ([Mailreach](https://www.mailreach.co/blog/gohighlevel-email-warmup)).
- If you use a non-LC SMTP provider, the in-app dedicated-domain tools are not available and the domain is managed on the provider's side ([GHL email sending guide](https://gohighlevelassist.freshdesk.com/support/solutions/articles/155000001021-email-sending-guide-email-best-practices-email-warm-up)).

**What this means for us**
1. **Never send GHL marketing email from the root domain or from Alex's personal mailbox address.** Use a dedicated **sub**domain, for example `mail.vitalfascia.com.au` for GHL. Resend should use its own (it defaults to a `send.` subdomain). Alex's normal inbox mail stays on the main domain. Separate subdomains mean a spam problem in one stream can't poison the others.
2. **Set SPF, DKIM and DMARC** for each sending domain (GHL and Resend each give you the DNS records; we add them in Cloudflare DNS). Start DMARC in monitoring mode (`p=none`) and tighten later.
3. **Warm up:** begin with the people who just requested a call or booked (engaged, small numbers) before sending to any bigger list. Do not import an old, unconsented list.
4. **Our volume is small.** A single clinic sending a few hundred emails a month is low risk. The thing that causes trouble is a cold, unauthenticated domain, so the setup above is the whole job.
5. **Decision for Alex:** use GHL's built-in LC Email with a dedicated domain (the **Dedicated Domain And IP** button; simplest, one bill) or plug in his own Mailgun/SMTP via **Add Service** (more control, more setup). For a single clinic, **LC Email with a dedicated subdomain is the sensible default**; revisit if deliverability problems show up. Because the account is run by an agency, ask them to enable it and confirm any extra cost.

### Q4. What makes sense to track in GHL from a business point of view?

**Suggested pipeline ("Client journey")**

| Stage | Meaning | How it gets set |
| --- | --- | --- |
| New lead | Someone filled in a form | Website Worker (automatic) |
| Call requested | Used "Request a call" | Worker, tag `lead:call-request` |
| Called / qualified | Alex spoke to them | Alex moves it, or a task completes |
| First session booked | A Cliniko booking exists | Cliniko sync (see below) |
| First session attended | Appointment happened | Cliniko sync |
| Active client | Rebooked / ongoing | Cliniko sync (2+ appointments) |
| Program waitlist | Joined the 8-week waitlist | Worker, tag `lead:waitlist` |
| Lapsed | No appointment in N weeks | GHL automation |

**What is useful to record on each contact:** name, email, phone, **lead source** (which form, plus where they came from: Google, Instagram, referral), preferred location (Sydney CBD / Double Bay), treatment interest, whether they consented to marketing, and the appointment status above. **Do not store symptoms or treatment notes** (section 7).

**What GHL then lets Alex do:** follow-up reminders for unreturned calls, "you booked, here's what to expect" sequences, rebooking nudges after N weeks, a waitlist announcement when the 8-week program opens, review requests after a good session, and seeing which sources actually produce paying clients.

**Can we track when a client books in?**
Not directly, and here is why:
- **Cliniko has no webhooks** in its public API documentation. It offers an API for pulling data (and filtering records by `updated_at`) but does not notify you when a booking is made ([Cliniko API docs](https://docs.api.cliniko.com/)). No Zapier app existed as of a 2022 community thread **(verify)**, and third-party tools like Pipedream and Integrately do it by *polling* ([Pipedream](https://pipedream.com/apps/cliniko/integrations/http), [Integrately](https://integrately.com/integrations/cliniko/webhook-api)).
- **The booking form is embedded in an iframe on `/book`.** The browser's security rules stop our site reading what the patient types inside it, and Cliniko blocks third-party code in its booking pages ([Cliniko help](https://help.cliniko.com/en/articles/4726326-tracking-the-source-in-google-analytics-with-cliniko-bookings-embedded)).

**So how do we capture client details that go through Cliniko?** Three options:

| Option | How | Verdict |
| --- | --- | --- |
| **1. Scheduled sync via the Cliniko API (recommended)** | A Cloudflare Worker on a schedule (e.g. every 15 min) asks Cliniko for appointments created/updated since the last run, and for each one creates/updates the GHL contact and sets tags/pipeline stage (`booked`, `attended`, `active-client`) | Reliable, uses only what Alex already pays for, runs on Cloudflare, we control it. Needs a Cliniko API key (it carries the permissions of whoever created it, so create it from a restricted user if possible). Cliniko's limit is 200 requests a minute, far above our needs. A ~15 minute delay is fine for this use |
| **2. Zapier / Pipedream / Make** | A no-code tool polls Cliniko and writes to GHL | Quicker to try, but adds a monthly subscription and another vendor holding patient data |
| **3. Ask for details *before* the booking form** | On `/book`, after the visitor picks a location, optionally ask name/email/phone (saved to GHL as "started booking") and only then show Cliniko | Lets us follow up people who start but don't finish booking (a valuable list). Adds a step to booking, so only do this if Alex wants the follow-up. Needs a consent line |

**Recommendation:** Option 1 for "booked/attended", and discuss option 3 with Alex as an optional extra.

**Can we capture leads from our other forms?** Yes, that is the easy part. All three forms (Request a call, Contact, 8-week waitlist) already go through our Worker, so each one can create/update a GHL contact with its own tag. We would also pass UTM/referrer information so GHL knows the source (section 6).

### Q5. Web analytics (Google and/or GHL)

See section 6.

---

## 4. Recommended architecture

```
                      ┌────────────────────────────── Cloudflare ───────────────────────────────┐
Visitor ──► website ──►  Worker (/api/*) ──► Resend ──► instant emails (to Alex + the visitor)    │
   │           │      │          │                                                                │
   │           │      │          └──► GHL API: create/update contact + tags + source              │
   │           │      │                                                                           │
   │           │      │  Scheduled Worker (every ~15 min) ──► Cliniko API ──► GHL contact status  │
   │           │      └──────────────────────────────────────────────────────────────────────────┘
   │           └──► /book ──► Cliniko booking form (iframe) ──► appointment in Cliniko
   │
   └──► Analytics: Cloudflare Web Analytics / GA4 / Search Console

GHL (Alex): pipeline, follow-up automations, SMS, newsletters, reviews
```

**What changes in the code (phase 1):**
- The Worker (`worker/index.ts`) gets one extra step after the emails: `upsertGhlContact(...)`. It runs in the background and **must never block or fail the visitor's request**; Alex's notification email stays as the safety net if GHL is down.
- New secrets in Cloudflare (never in the repo): `GHL_PRIVATE_TOKEN` and `GHL_LOCATION_ID`. Non-secret settings (tag names, base URL) go in `wrangler.jsonc`.
- GHL API: create a **Private Integration Token** in the GHL sub-account with only the contact read/write scopes, and call the contact **upsert** endpoint (it creates or updates and returns whether it was new) ([GHL docs](https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact), [guide](https://dev.to/autogencrm/getting-started-with-the-gohighlevel-api-auth-webhooks-and-common-gotchas-5fo3)). Check the exact `Version` header and base URL (`services.leadconnectorhq.com`) in the GHL docs when building **(verify)**.
- Tags and custom fields are best set by a small GHL workflow triggered by the new contact, because the API treats them as lists ([guide](https://dev.to/autogencrm/getting-started-with-the-gohighlevel-api-auth-webhooks-and-common-gotchas-5fo3)).
- Forms get a **marketing consent checkbox** (unticked by default) and hidden fields for UTM/referrer.

---

## 5. Phased plan

| Phase | What | Effort (rough) | Needs from Alex |
| --- | --- | --- | --- |
| **0. Foundations** (after the Resend and domain switch) | Decide GHL's role; create the GHL pipeline and tags; set up GHL dedicated sending **sub**domain (replacing `marketing.gathrspace.com.au`) with SPF/DKIM/DMARC; send a few test emails | Small | GHL login; talk to GATHR about the dedicated domain/IP; decide on sender name/address |
| **1. Website leads into GHL** | **First try the External Tracking script (section 3a)**: add it via a CMS setting, test as above, add a consent checkbox, and one GHL workflow that sets the first pipeline stage. If it proves unreliable or noisy, upgrade to the Worker API option (A): upsert contacts with tags and source | Small (D) / small-medium (A) | GHL External Tracking script (D) or a private integration token + location ID (A) |
| **2. Booking status from Cliniko** | Scheduled Worker syncing appointments to GHL (booked / attended / active); stops "called but already booked" follow-ups | Medium | A Cliniko API key (ideally from a limited user); agree what fields may leave Cliniko |
| **3. Follow-up automations in GHL** | Missed-call chase, post-booking "what to expect", rebooking nudges, review request, waitlist launch email | Medium (mostly done inside GHL, no code) | Alex's wording; SMS sender setup |
| **4. Analytics and conversion tracking** | See section 6 | Small-medium | Google account; decisions on ads and cookie banner |
| **5. Optional extras** | "Started booking" capture on `/book`; GHL reviews/reputation; a small lead dashboard | As wanted | Alex's priorities |

**Phase 1 first** is the best value: Alex gets every enquiry in his CRM with its source, with little risk.

---

## 6. Analytics

### What we need to know
How many people visit, where they come from (Google, Instagram, referral), which pages matter, how many tap "Book", and how many forms and bookings result.

### Options
| Tool | Strengths | Weaknesses |
| --- | --- | --- |
| **Cloudflare Web Analytics** (free) | Privacy-friendly: described as using no cookies and no cross-site tracking, so it can run without a consent banner ([consent vendor's summary](https://www.consentstack.io/vendors/cloudflare)); already in the stack; no performance cost | Basic: visits, pages, referrers. No conversion goals |
| **Google Search Console** (free) | What people searched to find the site; indexing problems; sitemap status | Search data only |
| **Google Analytics 4 (GA4)** | Conversion events, audiences, Google Ads integration | Needs a decision on consent: with Consent Mode, denied consent still sends cookieless pings to Google ([explainer](https://www.uniconsent.com/google-consent-mode-ga4)), so it is not automatically "consent-free"; more setup; heavier script |
| **GHL tracking/attribution** | Good when forms, funnels and calendars live *inside* GHL | Our site is external and booking is in Cliniko, so GHL cannot see most of the journey. We pass the source to GHL ourselves instead |

**Recommendation**
1. **Now:** turn on **Cloudflare Web Analytics** and verify the site in **Search Console** (submit `sitemap-index.xml`). Both are free and need no cookie banner.
2. **Capture the lead source:** if we use GHL External Tracking (section 3a) it records UTMs, page and session for us. Otherwise (Worker API option) on a visitor's first page, store `utm_*` parameters and `document.referrer` for the session and include them as hidden fields in the three forms. The Worker passes them to GHL. This gives Alex "where did this lead come from" without relying on GHL's tracking script.
3. **Add GA4 only when it is needed** (running Google/Meta ads, or wanting funnel reports). Load it through Google Tag Manager with Consent Mode and add a cookie banner. Events to send: `form_submit` (with form type), `booking_location_selected` (Sydney CBD / Double Bay), `click_to_call`, `whatsapp_click`, and `booking_completed`.
4. **Booking completion is the hard one.** Cliniko says the iframe loses the original traffic source (iframes don't support cross-domain tracking) and recommends redirecting to Cliniko's hosted booking page if accurate tracking is essential. A documented workaround exists: the Cliniko iframe sends a `postMessage` when the confirmation page is reached, a script on our page listens and pushes a `clinikoBookingCompleted` event, and GA4 reports it. Cliniko says it can't support that workaround ([Cliniko help](https://help.cliniko.com/en/articles/4726326-tracking-the-source-in-google-analytics-with-cliniko-bookings-embedded), [GA4 embed guide](https://help.cliniko.com/en/articles/5946172-connect-cliniko-bookings-with-google-analytics-4-embedded)). Our `/book` page already listens for Cliniko's `postMessage` events, so this is feasible and we would test it carefully.
5. **A very cheap attribution trick:** add a required "How did you hear about us?" question to the Cliniko booking form (check Cliniko's online-bookings settings for referral-source options **(verify)**). It also shows up in the Cliniko-to-GHL sync.

---

## 7. Privacy and compliance (Australia)

I am not a lawyer; Alex should confirm with a privacy adviser. These are the things to raise.

- **Health information is sensitive under the Australian Privacy Principles.** Keep clinical details in Cliniko. Send GHL only contact details, source, consent and appointment status. Update the Privacy Policy (already live) to mention the CRM and marketing platforms. GHL is a US-based service, so overseas disclosure should be covered in the policy.
- **Spam Act 2003:** marketing email and SMS need consent (express or inferred), must identify the sender, and must include a working unsubscribe. Pre-ticked boxes and bought lists do not count. Keep records of consent. Instant confirmations of something the person just asked for are not marketing, but newsletters and offers are ([Sinch overview](https://sinch.com/engage/resources/sms-compliance/sms-marketing-laws-australia/), [Telerivet](https://www.telerivet.com/blog/australia-sms-compliance-acma-sender-id-spam-act)).
- **Australian SMS sender IDs** must be registered before alphanumeric sender names work reliably. Sources disagree on timing (some say registration is already enforced by carriers, another says mandatory from 1 July 2026), so check with GHL support how SMS senders are set up for Australia **(verify)**.
- **Access control:** use a restricted Cliniko user for the API key, store keys only as Cloudflare secrets, and use two-factor authentication on GHL, Cliniko and Cloudflare.
- **Consent wording on forms** (suggested): "Yes, send me occasional updates and offers from Vital Fascia. I can unsubscribe at any time." Unticked by default. Separate from the "request a call" action, so someone can ask for a call without joining marketing.

---

## 8. Risks and things to decide

| Item | Notes |
| --- | --- |
| **Duplicate emails** | If both GHL workflows and our Worker send a "thanks" message, people get two. Decide the Worker owns the instant confirmation |
| **Data duplication** | GHL and Cliniko will both hold contact details. Cliniko is the master; the sync only writes from Cliniko to GHL |
| **GHL cost** | Subscription plus SMS/email usage charges. Alex should check what his plan includes before we design SMS-heavy automations |
| **Maintenance** | The sync job and the API tokens are code we own. They need an owner (Alex's developer) and basic monitoring (the Worker logs; an email to Alex if the sync fails repeatedly) |
| **GHL API/plan limits** | Some triggers (such as the inbound webhook) may need specific plans or have changed. Confirm in the account |
| **GATHR (the agency)** | Alex's GHL is a white-labelled account run by an agency called GATHR (the screenshot shows their branding and `gathrspace.com.au`). Find out who owns the account, who bills Alex, what the agency controls (users, sending domain, plan limits, whether API/private integration tokens are allowed on this plan), and what happens to Alex's data and automations if the relationship ends. Alex should own his own data and have admin access |

## 9. Questions for Alex

1. What do you want GHL to do for you first: capture every enquiry, follow up calls you miss, run newsletters and offers, send SMS reminders, or collect reviews?
2. Who will use GHL day to day, and who maintains the automations?
3. Do you already have an email list or client list you want to import? (We need to check you have consent before emailing it.)
4. Are you planning paid ads (Google/Meta)? That decides whether we set up GA4 and a cookie banner now.
5. Are you happy for appointment status (booked/attended) to flow from Cliniko into GHL, if no clinical detail is shared?
6. Should clients who start but don't finish booking be followed up? (That needs the optional "started booking" capture.)
7. SMS: do you want it, and what sender name should it show?
8. GATHR: who is the agency, what do they manage for you, what does it cost, and can they enable a dedicated sending domain (and an API token for the website) on your sub-account?

---

## Sources

- Cliniko API documentation (no webhooks listed, 200 requests/minute, key-based auth): <https://docs.api.cliniko.com/>
- Cliniko: tracking the source with embedded bookings (iframe limits, postMessage workaround): <https://help.cliniko.com/en/articles/4726326-tracking-the-source-in-google-analytics-with-cliniko-bookings-embedded>
- Cliniko: connecting embedded bookings with GA4: <https://help.cliniko.com/en/articles/5946172-connect-cliniko-bookings-with-google-analytics-4-embedded>
- Cliniko integration chatter (Pipedream, Integrately, Zapier community): <https://pipedream.com/apps/cliniko/integrations/http>, <https://integrately.com/integrations/cliniko/webhook-api>, <https://community.zapier.com/how-do-i-3/integration-with-cliniko-15361>
- GHL contact upsert endpoint: <https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact>
- GHL API guide (private integration tokens, gotchas): <https://dev.to/autogencrm/getting-started-with-the-gohighlevel-api-auth-webhooks-and-common-gotchas-5fo3>
- GHL SMTP provider help article: <https://gohighlevelassist.freshdesk.com/support/solutions/articles/48001059689-setting-up-smtp-providers>
- GHL email sending/warm-up guide: <https://gohighlevelassist.freshdesk.com/support/solutions/articles/155000001021-email-sending-guide-email-best-practices-email-warm-up>
- GHL deliverability commentary (vendors with their own interests): <https://www.inboxally.com/blog/gohighlevel-email-deliverability>, <https://www.mailreach.co/blog/gohighlevel-email-warmup>
- Resend sending limits: <https://resend.com/docs/knowledge-base/resend-sending-limits>
- GHL: Tracking external forms with GoHighLevel: <https://help.gohighlevel.com/support/solutions/articles/155000006092-tracking-external-forms-with-gohighlevel>
- GHL inbound webhook guides (third-party): <https://chat.salesbot.it.com/blog/get-webhook-from-highlevel-guide>
- Australian SMS and Spam Act summaries: <https://sinch.com/engage/resources/sms-compliance/sms-marketing-laws-australia/>, <https://www.telerivet.com/blog/australia-sms-compliance-acma-sender-id-spam-act>
- Cloudflare Web Analytics and GA4 Consent Mode summaries: <https://www.consentstack.io/vendors/cloudflare>, <https://www.uniconsent.com/google-consent-mode-ga4>
