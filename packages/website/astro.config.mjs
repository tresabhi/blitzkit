// @ts-check

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { SUPPORTED_LOCALES } from '@blitzkit/core';
import { defineConfig } from 'astro/config';

export default defineConfig({
  i18n: {
    defaultLocale: 'en',
    locales: SUPPORTED_LOCALES,
  },

  devToolbar: { enabled: false },
  output: 'static',
  site: 'https://blitzkit.app',
  outDir: '../../dist/website',
  prefetch: true,

  integrations: [react(), sitemap()],
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
