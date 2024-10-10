// @ts-check

import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'astro/config';

export default defineConfig({
  devToolbar: { enabled: false },
  output: 'hybrid',
  adapter: vercel(),

  integrations: [react()],
  vite: {
    plugins: [vanillaExtractPlugin()],
    resolve: {
      alias: {
        '.prisma/client/index-browser':
          '../../node_modules/.prisma/client/index-browser.js',
      },
    },
  },
});
