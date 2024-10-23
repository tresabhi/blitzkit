// @ts-check

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'astro/config';

export default defineConfig({
  devToolbar: { enabled: false },
  output: 'static',
  site: 'https://blitzkit.app',
  outDir: '../../dist/website',

  integrations: [react(), sitemap()],
  vite: {
    plugins: [vanillaExtractPlugin()],
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
