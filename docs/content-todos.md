# Content that still needs confirming with the client

The home page copy was taken from the design prototype, which contains wording that is **not confirmed** by the client. Replace or hide each item before launch (everything is editable in the CMS).

| Where in the CMS | Item | Status |
| --- | --- | --- |
| Home page > Key numbers | "3+ yrs", "500+ sessions", "4.9 / 5 average client rating" | Unconfirmed, from the design. Verify or hide |
| Home page > Client testimonials | Heading "Loved by clients" | Placeholder wording, flag for Alex |
| Home page > Services | Longer treatment descriptions | Placeholder filler |
| Contact details | TikTok link | Placeholder; replace with the real account (blank hides the icon). YouTube and Facebook icons are not shown |
| Home page > Free discovery call | Copy, "2 hours" call-back promise, form endpoint | Confirm with client; form submission still to be connected |
| Home page > The process | Steps 5-7 | Placeholder titles and text |
| Legal pages | Terms of Service, Refund Policy | Template text only; replace before launch. Privacy and Cancellation Policy are real copy (Nov 2026) |
| Location | Two locations: Sydney CBD (Mezzanine, 309 George St) and Double Bay (Suite 6/21-25 Knox St) | Confirm both map pins. The Double Bay booking form is on the "The Muscle Group" Cliniko account and still shows old Muscle Medicine text/policy (a $65 fee, 24 hours) inside the form; Alex needs to update that in Cliniko |
| Home page > Client testimonials | 22 real Google reviews from docs/Reviews.md (top 10 first) | Full names as on Google. Reviews naming the old clinics (Muscle Medicine / Movement Laboratory) and two incomplete ones were left out |
| Home page > About | "Roughly nine in ten clients report a noticeable improvement..." | Unconfirmed claim. Verify or delete |
| Home page > About | Alex May's story / bio | Written for the prototype. Client to approve |
| Contact details | Google Maps embed | Uses an address search embed; replace with the official embed link if wanted |
| Other pages > 8-Week Program | Whole page | Placeholder copy, no design |
| All photos | Hero, About portrait, social sharing image | Placeholders until the client supplies photos |

Facts taken from the live Squarespace site: address (Suite 6/21-25 Knox St, Double Bay NSW 2028), email, Facebook and Instagram links, the six treatments.
The live site's own hero/intro wording was **not** used; the design's copy was (client decision). The live site's longer treatment descriptions were also not used.

Note: when the client saves in the CMS, the `# TODO` comments inside the YAML files are removed. This file is the source of truth for open items.

| Privacy Policy | Nov 2026 updates: CRM/marketing platforms, overseas storage (US-based services), website tracking linked to enquiries, marketing consent and how to withdraw it. Added "Last updated: November 2026" | **Needs Alex's approval, ideally a privacy adviser's review.** Edited by the developer, not a lawyer |
| Marketing consent tick-box | One tick-box ("I agree to receive occasional offers & updates from Vital Fascia" + small print and Privacy Policy link), unticked by default, remembers the choice across forms and pages (browser storage), sends exactly `Consent` / `No consent` via a hidden radio pair, on all 3 forms | Alex to confirm wording and that he'll honour unsubscribes. Pre-ticking is NOT recommended under the Spam Act. Re-check the GHL field mapping (Automatic mapping to the Marketing Consent custom field) after this change |
| GoHighLevel | **TODO for Alex: set up a spam filter workflow** (see the client guide, "Your CRM") and map the form fields for each form | Open. The tracking script captures junk submissions that the website's own email filter already rejects |
| GoHighLevel | Confirm with GATHR: dedicated sending domain, API token availability, plan limits | Open (see docs/ghl-integration-plan.md) |
| Cookies / tracking | The GHL tracking script tracks page visits. Decide whether a cookie banner is wanted | Open. Currently no banner; wording in the Privacy Policy covers the tracking |
| Forms | Rate limiting rule on `/api/*` in Cloudflare (WAF > Rate limiting rules), and optionally Cloudflare Turnstile | Open. Done after the domain moves to Alex's Cloudflare. See the client guide, "How the forms are protected" |
| GoHighLevel | Consent not reaching a custom field | Open. External Tracking can't map custom fields. Test Automatic mapping to the *Marketing Consent* field; if it fails, move lead capture to a server-side API call (needs a GATHR API token) |
