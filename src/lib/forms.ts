/**
 * Form submission endpoints.
 * Handled by the Cloudflare Worker in worker/index.ts (see docs/how-the-forms-work.md).
 * Empty = form is not connected. The contact and waitlist forms are not connected yet.
 */
export const formEndpoints = {
  contact: '',
  discoveryCall: '/api/discovery-call',
  programWaitlist: '',
};
