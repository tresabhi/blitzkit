import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

const withVanillaExtract = createVanillaExtractPlugin({ tests: /\.css$/ });

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...withVanillaExtract(),

  distDir: 'dist/website',
  reactStrictMode: false,

  webpack: (config) => {
    config.module.rules.push({
      test: /\.glsl$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
