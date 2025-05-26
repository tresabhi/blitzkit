// @ts-check

import partytown from '@astrojs/partytown';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import locales from '@blitzkit/i18n/locales.json' with { type: 'json' };
import { defineConfig } from 'astro/config';

export default defineConfig({
  i18n: {
    defaultLocale: locales.default,
    locales: locales.supported.map(({ locale }) => locale),
    routing: {
      prefixDefaultLocale: false,
    },
  },

  devToolbar: { enabled: false },
  output: 'static',
  site: 'https://blitzkit.app',
  outDir: '../../dist/website',
  prefetch: true,

  integrations: [react(), sitemap(), partytown()],
  vite: {
    resolve: {
      alias: {
        '.prisma/client/index-browser':
          '../../node_modules/.prisma/client/index-browser.js',
      },
    },
    ssr: {
      noExternal: [/^d3.*$/, /^@nivo.*$/],
    },
  },
});
