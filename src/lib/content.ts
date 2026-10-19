import { getEntry } from 'astro:content';

/** Content collections that hold exactly one file each (see content.config.ts). */
type Single =
  | 'site' | 'contact' | 'seo' | 'hero' | 'highlights' | 'whoItsFor' | 'services'
  | 'approach' | 'process' | 'offers' | 'testimonials' | 'about' | 'discoveryCall'
  | 'finalCta' | 'legal' | 'programPage' | 'contactPage';

const ids: Record<Single, string> = {
  site: 'site', contact: 'contact', seo: 'seo', hero: 'hero', highlights: 'highlights',
  whoItsFor: 'who-its-for', services: 'services', approach: 'approach', process: 'process',
  offers: 'offers', testimonials: 'testimonials', about: 'about', discoveryCall: 'discovery-call',
  finalCta: 'final-cta', legal: 'legal', programPage: 'program-page', contactPage: 'contact-page',
};

export async function getContent<K extends Single>(name: K) {
  const entry = await getEntry(name as any, ids[name]);
  if (!entry) throw new Error(`Missing content file for "${name}" (src/content/${ids[name]}.yaml)`);
  return entry.data as any;
}
