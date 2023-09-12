import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';

const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...withVanillaExtract(),
  distDir: 'dist/website',
};

export default nextConfig;
