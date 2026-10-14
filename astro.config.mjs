// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO: confirm the production domain once DNS is pointed at Cloudflare.
const site = process.env.SITE_URL ?? 'https://www.vitalfascia.com.au';

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
