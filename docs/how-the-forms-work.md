# How the "Request a call" form works (for Alex)

## What happens when someone fills it in

1. A visitor enters their name, phone and email in **Request a call** and presses the button.
2. The website sends those details to a small program that runs on Cloudflare (the "Worker").
3. The Worker sends **two emails** straight away:
   - **To you** (alex@vitalfascia.com.au): "New call request: *Name*" with their name, phone (tap to call) and email. Hit **Reply** to write back to them directly.
   - **To the visitor**: a confirmation in the website's colours saying you'll call them, with the "what happens next" steps.
4. The visitor sees a thank-you message on the page.

Nothing is stored on the website. Your inbox is the record of requests.

## Changing the wording of the confirmation email

In the CMS go to **Confirmation email (sent after a call request)**. You can edit the subject, greeting, steps and sign-off. Use `{name}` in the greeting and it becomes the visitor's first name. Changes go live after the site redeploys (a minute or two after you save). The email to you is fixed.

## Where the pieces live

| Piece | Where |
| --- | --- |
| The form on the site | Home page > Free discovery call (CMS) |
| Email wording | CMS > Confirmation email |
| Sending code | `worker/index.ts` in the website repository |
| Sending service | [Resend](https://resend.com) (free plan covers 3,000 emails a month, far more than needed) |
| Secret key | Cloudflare dashboard > Workers & Pages > vital-fascia-website > Settings > Variables and Secrets > `RESEND_API_KEY` |
| Where notifications go | `NOTIFY_TO` in `wrangler.jsonc` (currently alex@vitalfascia.com.au) |
| "From" address | `MAIL_FROM` in `wrangler.jsonc` (bookings@vitalfascia.com.au) |

## One-time setup (needs the Cloudflare account that owns vitalfascia.com.au)

The code is finished. Until these steps are done the form shows "Sorry, something went wrong" and no emails are sent.

1. Create a free Resend account using **Alex's** email, so the account belongs to the business.
2. In Resend, **Domains > Add domain** `vitalfascia.com.au`. Resend lists a few DNS records (SPF, DKIM). Add them in Cloudflare under **DNS** (Resend can do this automatically if you connect Cloudflare). This proves to inboxes that the emails really come from you and keeps them out of spam.
3. In Resend, **API Keys > Create API key** (sending access only). Copy it.
4. In Cloudflare: **Workers & Pages > vital-fascia-website > Settings > Variables and Secrets > Add**, type *Secret*, name `RESEND_API_KEY`, paste the key, save, then redeploy.
5. Test it: submit the form with your own email and check that both emails arrive (look in spam the first time).

## Why do this after moving to the business's Cloudflare account

Do steps 2 and 4 once the site lives in the business's own Cloudflare account. The DNS records have to be added where the domain's DNS is managed, and the secret key belongs to the Worker that will actually run the site. Doing it now on a personal account would mean redoing it later (and the key would be tied to the wrong account). Everything in the code is already in place, so the move is only these few steps.

## If something goes wrong

- **Visitors report an error / no emails:** check the Resend dashboard > **Logs** (shows every email and why one failed), and that the domain shows *Verified* and the `RESEND_API_KEY` secret exists.
- **Emails land in spam:** confirm the domain is verified in Resend; ask the visitor to add bookings@vitalfascia.com.au to contacts.
- **Spam submissions:** the form has a hidden trap field that blocks most bots. If it becomes a problem, ask for Cloudflare Turnstile (free CAPTCHA alternative) to be added.
- **Change who gets the notification:** edit `NOTIFY_TO` in `wrangler.jsonc`.

## Other forms

The Contact page form and the 8-week waitlist form are **not connected yet**. They can use the same system when you're ready.

## For developers

Test locally: `npm run build`, put `MAIL_DRY_RUN=true` in `.dev.vars`, run `npx wrangler dev`, then POST to `/api/discovery-call`. Emails are printed to the console instead of sent. The email wording is built into `/email-content.json` at build time, which the Worker reads.
