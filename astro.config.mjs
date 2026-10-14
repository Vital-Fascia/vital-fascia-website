// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO: confirm the production domain once DNS is pointed at Cloudflare.
const defaultSite = 'https://www.vitalfascia.com.au';
/** Use SITE_URL if it is a valid absolute URL (adds https:// if missing), else the default. */
function resolveSite(/** @type {string | undefined} */ raw) {
  const value = raw?.trim();
  if (!value) return defaultSite;
  try {
    return new URL(/^https?:\/\//.test(value) ? value : `https://${value}`).origin;
  } catch {
    return defaultSite;
  }
}
const site = resolveSite(process.env.SITE_URL);

/** Dev only: the dev server doesn't serve public/admin/index.html at /admin (Cloudflare does). */
const serveAdminIndex = {
  name: 'serve-admin-index',
  configureServer(/** @type {import('vite').ViteDevServer} */ server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/admin' || req.url === '/admin/') req.url = '/admin/index.html';
      next();
    });
  },
};

export default defineConfig({
  site,
  output: 'static',
  integrations: [sitemap()],
  vite: { plugins: [serveAdminIndex] },
});
