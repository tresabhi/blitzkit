// @ts-check

import react from '@astrojs/react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import purgecss from 'astro-purgecss';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [react(), purgecss()],
  vite: { plugins: [vanillaExtractPlugin()] },

  devToolbar: { enabled: false },
  outDir: '../../dist/website',
});
