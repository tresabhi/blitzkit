// @ts-check

import react from '@astrojs/react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [react()],
  vite: { plugins: [vanillaExtractPlugin()] },

  devToolbar: { enabled: false },
  outDir: '../../dist/website',
});
