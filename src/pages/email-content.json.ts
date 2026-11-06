// Build-time JSON copy of the editable email wording. The form Worker (worker/index.ts)
// reads this at send time, so edits made in the CMS reach the emails after the next deploy.
import { getContent } from '../lib/content';

export async function GET() {
  const emails = await getContent('emails');
  const site = await getContent('site');
  const contact = await getContent('contact');
  return new Response(
    JSON.stringify({ ...emails, businessName: site.businessName, ownerEmail: contact.email }),
    { headers: { 'Content-Type': 'application/json' } },
  );
}
