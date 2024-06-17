import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

const withVanillaExtract = createVanillaExtractPlugin({ tests: /\.css$/ });

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...withVanillaExtract({
    webpack: (config) => {
      config.module.rules.push({
        test: /\.glsl$/,
        type: 'asset/source',
      });
      return config;
    },
  }),

  async headers() {
    return [
      {
        source: '/(.*)?',
        headers: [{ key: 'X-Frame-Options', value: 'DENY' }],
      },
    ];
  },

  distDir: 'dist/website',
  reactStrictMode: false,

  experimental: {
    workerThreads: false,
  },
};

export default nextConfig;
