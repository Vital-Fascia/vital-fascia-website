import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Every client-editable piece of content is a single YAML file in src/content/.
 * Each file is its own collection and holds exactly one entry (id = file name).
 * Keep this file in sync with public/admin/config.yml.
 */

const link = z.object({ label: z.string(), href: z.string() });
const cta = link;
const seo = z.object({
  title: z.string(),
  description: z.string(),
});

/** Section on/off switch + shared heading fields. */
const section = { visible: z.boolean().default(true) };

export const collections = {
  site: defineCollection({
    loader: glob({ pattern: 'site.yaml', base: './src/content' }),
    schema: z.object({
      businessName: z.string(),
      tagline: z.string(),
      navLinks: z.array(link),
      bookButtonLabel: z.string(),
      footerNote: z.string(),
    }),
  }),

  contact: defineCollection({
    loader: glob({ pattern: 'contact.yaml', base: './src/content' }),
    schema: z.object({
      visitHeading: z.string(),
      addressLines: z.array(z.string()),
      hours: z.string(),
      mapEmbedUrl: z.string().optional(),
      mapLinkUrl: z.string().optional(),
      getInTouchHeading: z.string(),
      email: z.string(),
      instagramHandle: z.string(),
      instagramUrl: z.string(),
      facebookUrl: z.string().optional(),
      bookingUrl: z.string(),
      bookingLabel: z.string(),
      contactFormLabel: z.string(),
    }),
  }),

  seo: defineCollection({
    loader: glob({ pattern: 'seo.yaml', base: './src/content' }),
    schema: ({ image }) =>
      z.object({
        home: seo,
        program: seo,
        contact: seo,
        socialImage: image().optional(),
        socialImageAlt: z.string().optional(),
      }),
  }),

  hero: defineCollection({
    loader: glob({ pattern: 'hero.yaml', base: './src/content' }),
    schema: ({ image }) =>
      z.object({
        eyebrow: z.string(),
        headingStart: z.string(),
        headingEmphasis: z.string(),
        headingEnd: z.string(),
        intro: z.string(),
        primaryButton: cta,
        secondaryButton: cta,
        photo: image().optional(),
        photoAlt: z.string().optional(),
        photoPlaceholder: z.string(),
      }),
  }),

  highlights: defineCollection({
    loader: glob({ pattern: 'highlights.yaml', base: './src/content' }),
    schema: z.object({
      ...section,
      items: z.array(z.object({ value: z.string(), label: z.string() })),
    }),
  }),

  whoItsFor: defineCollection({
    loader: glob({ pattern: 'who-its-for.yaml', base: './src/content' }),
    schema: z.object({
      ...section,
      eyebrow: z.string(),
      heading: z.string(),
      intro: z.string(),
      signs: z.array(z.string()),
      closing: z.string(),
    }),
  }),

  services: defineCollection({
    loader: glob({ pattern: 'services.yaml', base: './src/content' }),
    schema: z.object({
      ...section,
      eyebrow: z.string(),
      heading: z.string(),
      issues: z.array(z.object({ title: z.string(), description: z.string() })),
      treatmentsEyebrow: z.string(),
      treatmentsHeading: z.string(),
      treatments: z.array(z.object({ name: z.string(), description: z.string() })),
    }),
  }),

  approach: defineCollection({
    loader: glob({ pattern: 'approach.yaml', base: './src/content' }),
    schema: z.object({
      ...section,
      eyebrow: z.string(),
      heading: z.string(),
      body: z.string(),
      diagramTitle: z.string(),
      diagramPoints: z.array(z.object({ label: z.string(), highlight: z.boolean().default(false) })),
      diagramCaption: z.string(),
    }),
  }),

  process: defineCollection({
    loader: glob({ pattern: 'process.yaml', base: './src/content' }),
    schema: z.object({
      ...section,
      eyebrow: z.string(),
      heading: z.string(),
      intro: z.string(),
      steps: z.array(z.object({ title: z.string(), description: z.string() })),
    }),
  }),

  offers: defineCollection({
    loader: glob({ pattern: 'offers.yaml', base: './src/content' }),
    schema: z.object({
      ...section,
      eyebrow: z.string(),
      heading: z.string(),
      session: z.object({
        badge: z.string(),
        title: z.string(),
        details: z.string(),
        price: z.string(),
        priceNote: z.string(),
        includes: z.array(z.string()),
        buttonLabel: z.string(),
      }),
      program: z.object({
        badge: z.string(),
        title: z.string(),
        description: z.string(),
        buttonLabel: z.string(),
        buttonHref: z.string(),
      }),
    }),
  }),

  testimonials: defineCollection({
    loader: glob({ pattern: 'testimonials.yaml', base: './src/content' }),
    schema: z.object({
      ...section,
      eyebrow: z.string(),
      heading: z.string(),
      items: z.array(
        z.object({
          quote: z.string(),
          name: z.string(),
          detail: z.string().optional(),
          source: z.string().optional(),
          rating: z.number().min(1).max(5).default(5),
        }),
      ),
    }),
  }),

  about: defineCollection({
    loader: glob({ pattern: 'about.yaml', base: './src/content' }),
    schema: ({ image }) =>
      z.object({
        ...section,
        eyebrow: z.string(),
        heading: z.string(),
        paragraphs: z.array(z.string()),
        signature: z.string(),
        photo: image().optional(),
        photoAlt: z.string().optional(),
        photoPlaceholder: z.string(),
      }),
  }),

  freeResource: defineCollection({
    loader: glob({ pattern: 'free-resource.yaml', base: './src/content' }),
    schema: z.object({
      ...section,
      eyebrow: z.string(),
      heading: z.string(),
      paragraphs: z.array(z.string()),
      nameLabel: z.string(),
      namePlaceholder: z.string(),
      emailLabel: z.string(),
      emailPlaceholder: z.string(),
      buttonLabel: z.string(),
      finePrint: z.string(),
      successMessage: z.string(),
    }),
  }),

  finalCta: defineCollection({
    loader: glob({ pattern: 'final-cta.yaml', base: './src/content' }),
    schema: z.object({
      ...section,
      heading: z.string(),
      text: z.string(),
      buttonLabel: z.string(),
    }),
  }),

  programPage: defineCollection({
    loader: glob({ pattern: 'program-page.yaml', base: './src/content' }),
    schema: z.object({
      badge: z.string(),
      heading: z.string(),
      intro: z.string(),
      primaryButton: cta,
      includesHeading: z.string(),
      includes: z.array(z.object({ title: z.string(), description: z.string() })),
      forWhoHeading: z.string(),
      forWhoText: z.string(),
      detailsHeading: z.string(),
      details: z.array(z.object({ label: z.string(), value: z.string() })),
      waitlistHeading: z.string(),
      waitlistText: z.string(),
      nameLabel: z.string(),
      emailLabel: z.string(),
      buttonLabel: z.string(),
      finePrint: z.string(),
      successMessage: z.string(),
    }),
  }),

  contactPage: defineCollection({
    loader: glob({ pattern: 'contact-page.yaml', base: './src/content' }),
    schema: z.object({
      eyebrow: z.string(),
      heading: z.string(),
      intro: z.string(),
      nameLabel: z.string(),
      emailLabel: z.string(),
      phoneLabel: z.string(),
      messageLabel: z.string(),
      messageHint: z.string(),
      buttonLabel: z.string(),
      successMessage: z.string(),
    }),
  }),
};
