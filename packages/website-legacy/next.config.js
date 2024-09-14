import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

const withVanillaExtract = createVanillaExtractPlugin({ tests: /\.css$/ });

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  ...withVanillaExtract({
    webpack: (config) => {
      config.module.rules.push(
        {
          test: /\.glsl$/,
          type: 'asset/source',
        },
        {
          test: /\.proto$/,
          type: 'asset/source',
        },
      );

      return config;
    },
  }),

  distDir: 'dist/website',
  reactStrictMode: true,

  experimental: {
    workerThreads: false,
  },
};

export default nextConfig;
