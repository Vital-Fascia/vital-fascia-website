/**
 * Form submission endpoints.
 * Handled by the Cloudflare Worker in worker/index.ts (see docs/how-the-forms-work.md).
 * Empty = form is not connected.
 */
export const formEndpoints = {
  contact: '/api/contact',
  discoveryCall: '/api/discovery-call',
  programWaitlist: '/api/waitlist',
};
