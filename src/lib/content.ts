import { getEntry } from 'astro:content';

/** Content collections that hold exactly one file each (see content.config.ts). */
type Single =
  | 'site' | 'contact' | 'seo' | 'hero' | 'highlights' | 'whoItsFor' | 'services'
  | 'approach' | 'process' | 'offers' | 'testimonials' | 'about' | 'discoveryCall'
  | 'finalCta' | 'privacy' | 'cancellation' | 'terms' | 'refund' | 'sitemapPage' | 'programPage' | 'contactPage' | 'bookingPage' | 'emailCallRequest' | 'emailContactMessage' | 'emailWaitlist';

const ids: Record<Single, string> = {
  site: 'site', contact: 'contact', seo: 'seo', hero: 'hero', highlights: 'highlights',
  whoItsFor: 'who-its-for', services: 'services', approach: 'approach', process: 'process',
  offers: 'offers', testimonials: 'testimonials', about: 'about', discoveryCall: 'discovery-call',
  finalCta: 'final-cta', privacy: 'privacy-policy', cancellation: 'cancellation-policy', terms: 'terms-of-service', refund: 'refund-policy', sitemapPage: 'site-map', programPage: 'program-page', contactPage: 'contact-page', bookingPage: 'booking-page', emailCallRequest: 'email-call-request', emailContactMessage: 'email-contact-message', emailWaitlist: 'email-waitlist',
};

export async function getContent<K extends Single>(name: K) {
  const entry = await getEntry(name as any, ids[name]);
  if (!entry) throw new Error(`Missing content file for "${name}" (src/content/${ids[name]}.yaml)`);
  return entry.data as any;
}
