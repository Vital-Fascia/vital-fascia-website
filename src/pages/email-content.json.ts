// Build-time JSON copy of the editable email wording. The form Worker (worker/index.ts)
// reads this at send time, so edits made in the CMS reach the emails after the next deploy.
import { getContent } from '../lib/content';

export async function GET() {
  const callRequest = await getContent('emailCallRequest');
  const contactMessage = await getContent('emailContactMessage');
  const waitlist = await getContent('emailWaitlist');
  const site = await getContent('site');
  const contact = await getContent('contact');
  return new Response(
    JSON.stringify({ callRequest, contactMessage, waitlist, businessName: site.businessName, ownerEmail: contact.email }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
