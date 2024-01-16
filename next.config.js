import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

const withVanillaExtract = createVanillaExtractPlugin({ tests: /\.css$/ });

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...withVanillaExtract({
    // TODO: this is deprecated but the only way to fix build call stack overflow
    outputFileTracing: false,
    webpack: (config) => {
      config.module.rules.push({
        test: /\.glsl$/,
        type: 'asset/source',
      });
      return config;
    },
  }),

  distDir: 'dist/website',
  reactStrictMode: false,
};

export default nextConfig;
