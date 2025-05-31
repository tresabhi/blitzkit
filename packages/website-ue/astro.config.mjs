// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

export default defineConfig({
  integrations: [react(), sitemap()],
  devToolbar: { enabled: false },
  outDir: '../../dist/website',

  prefetch: true,
  site: 'https://blitzkit.app',
});
