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
const navLink = z.object({ label: z.string(), href: z.string(), tag: z.string().optional() });
const seo = z.object({
  title: z.string(),
  description: z.string(),
});


const legalPage = z.object({
  title: z.string(),
  intro: z.string(),
  sections: z.array(z.object({ heading: z.string(), body: z.string() })),
});

/** Section on/off switch + shared heading fields. */
const section = { visible: z.boolean().default(true) };

export const collections = {
  site: defineCollection({
    loader: glob({ pattern: 'site.yaml', base: './src/content' }),
    schema: z.object({
      businessName: z.string(),
      tagline: z.string(),
      navLinks: z.array(navLink),
      bookButtonLabel: z.string(),
      bookButtonShortLabel: z.string(),
      menuNote: z.string(),
      showLabel: z.string(),
      hideLabel: z.string(),
      footerNote: z.string(),
    }),
  }),

  contact: defineCollection({
    loader: glob({ pattern: 'contact.yaml', base: './src/content' }),
    schema: z.object({
      visitHeading: z.string(),
      addressLines: z.array(z.string()),
      hours: z.array(z.object({ days: z.string(), time: z.string() })),
      mapEmbedUrl: z.string().optional(),
      mapLinkUrl: z.string().optional(),
      getInTouchHeading: z.string(),
      email: z.string(),
      instagramHandle: z.string(),
      instagramUrl: z.string(),
      facebookUrl: z.string().optional(),
      tiktokUrl: z.string().optional(),
      whatsappUrl: z.string().optional(),
      bookingUrl: z.string(),
      bookingLabel: z.string(),
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
    schema: ({ image }) =>
      z.object({
        ...section,
        eyebrow: z.string(),
        heading: z.string(),
        intro: z.string(),
        signs: z.array(z.string()),
        closing: z.string(),
        photo: image().optional(),
        photoAlt: z.string().optional(),
        photoPlaceholder: z.string(),
      }),
  }),

  services: defineCollection({
    loader: glob({ pattern: 'services.yaml', base: './src/content' }),
    schema: ({ image }) =>
      z.object({
        ...section,
        eyebrow: z.string(),
        heading: z.string(),
        issues: z.array(
          z.object({
            title: z.string(),
            icon: z.enum(['neck', 'back', 'hips', 'running', 'posture', 'mobility']).default('posture'),
            description: z.string(),
          }),
        ),
        treatmentsStartOpen: z.boolean().default(false),
        treatmentsEyebrow: z.string(),
        treatmentsHeading: z.string(),
        treatments: z.array(
          z.object({
            name: z.string(),
            icon: z.enum(['massage', 'web', 'target', 'cup', 'needle', 'exercise']).default('massage'),
            description: z.string(),
            detail: z.string(),
            photo: image().optional(),
            photoAlt: z.string().optional(),
            photoPlaceholder: z.string(),
          }),
        ),
      }),
  }),

  approach: defineCollection({
    loader: glob({ pattern: 'approach.yaml', base: './src/content' }),
    schema: z.object({
      ...section,
      startOpen: z.boolean().default(true),
      eyebrow: z.string(),
      heading: z.string(),
      body: z.string(),
      diagramTitle: z.string(),
      diagramHint: z.string(),
      figureTitle: z.string(),
      regions: z.array(
        z.object({
          id: z.enum(['jaw', 'neck', 'upperback', 'core', 'hip', 'knee', 'ankle']),
          label: z.string(),
          symptom: z.enum(['neck-tension', 'jaw-clenching', 'lower-back-pain', 'knee-pain']),
        }),
      ),
      symptoms: z.array(
        z.object({
          id: z.enum(['neck-tension', 'jaw-clenching', 'lower-back-pain', 'knee-pain']),
          label: z.string(),
          nodes: z.array(z.enum(['jaw', 'neck', 'upperback', 'core', 'hip', 'knee', 'ankle'])),
          caption: z.string(),
        }),
      ),
      diagramCaption: z.string(),
      compareHeading: z.string(),
      compareLeft: z.object({ title: z.string(), points: z.array(z.string()) }),
      compareRight: z.object({ title: z.string(), points: z.array(z.string()) }),
    }),
  }),

  process: defineCollection({
    loader: glob({ pattern: 'process.yaml', base: './src/content' }),
    schema: z.object({
      ...section,
      startOpen: z.boolean().default(false),
      eyebrow: z.string(),
      heading: z.string(),
      intro: z.string(),
      steps: z.array(
        z.object({
          title: z.string(),
          icon: z.enum(['conversation', 'posture', 'hands', 'movement', 'compass', 'massage', 'web', 'target', 'cup', 'needle', 'exercise', 'neck', 'back', 'hips', 'running', 'mobility']).default('compass'),
          description: z.string(),
          detail: z.string().optional(),
        }),
      ),
    }),
  }),

  offers: defineCollection({
    loader: glob({ pattern: 'offers.yaml', base: './src/content' }),
    schema: ({ image }) =>
      z.object({
        ...section,
        eyebrow: z.string(),
        heading: z.string(),
        items: z.array(
          z.object({
            status: z.enum(['active', 'soon']),
            badge: z.string(),
            title: z.string(),
            details: z.string().optional(),
            description: z.string().optional(),
            price: z.string().optional(),
            priceNote: z.string().optional(),
            includes: z.array(z.string()).default([]),
            expect: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
            rebate: z.string().optional(),
            photo: image().optional(),
            photoAlt: z.string().optional(),
            photoPlaceholder: z.string().optional(),
            buttonLabel: z.string(),
            buttonHref: z.string(),
          }),
        ),
        faqHeading: z.string(),
        faqs: z.array(z.object({ question: z.string(), answer: z.string() })),
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
        pullQuote: z.string(),
        paragraphs: z.array(z.string()),
        signature: z.string(),
        photo: image().optional(),
        photoAlt: z.string().optional(),
        photoPlaceholder: z.string(),
      }),
  }),

  discoveryCall: defineCollection({
    loader: glob({ pattern: 'discovery-call.yaml', base: './src/content' }),
    schema: z.object({
      ...section,
      eyebrow: z.string(),
      heading: z.string(),
      paragraphs: z.array(z.string()),
      stepsHeading: z.string(),
      steps: z.array(z.string()),
      nameLabel: z.string(),
      namePlaceholder: z.string(),
      phoneLabel: z.string(),
      phonePlaceholder: z.string(),
      emailLabel: z.string(),
      emailPlaceholder: z.string(),
      buttonLabel: z.string(),
      finePrint: z.string(),
      successMessage: z.string(),
    }),
  }),

  finalCta: defineCollection({
    loader: glob({ pattern: 'final-cta.yaml', base: './src/content' }),
    schema: ({ image }) =>
      z.object({
        ...section,
        heading: z.string(),
        text: z.string(),
        buttonLabel: z.string(),
        photo: image().optional(),
        photoAlt: z.string().optional(),
        photoPlaceholder: z.string(),
      }),
  }),

  legal: defineCollection({
    loader: glob({ pattern: 'legal.yaml', base: './src/content' }),
    schema: z.object({
      privacy: legalPage,
      terms: legalPage,
      refund: legalPage,
      sitemap: z.object({ title: z.string(), intro: z.string() }),
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
