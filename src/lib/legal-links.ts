import { getContent } from './content';

/** The legal pages, in the order they appear in the footer and on the site map. */
export async function getLegalLinks() {
  const [privacy, cancellation, terms, refund, sitemap] = await Promise.all([
    getContent('privacy'), getContent('cancellation'), getContent('terms'), getContent('refund'), getContent('sitemapPage'),
  ]);
  return [
    { label: privacy.title, href: '/privacy-policy' },
    { label: cancellation.title, href: '/cancellation-policy' },
    { label: terms.title, href: '/terms-of-service' },
    { label: refund.title, href: '/refund-policy' },
    { label: sitemap.title, href: '/site-map' },
  ];
}
