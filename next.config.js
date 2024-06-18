import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin';
import { readdirSync, writeFileSync } from 'fs';

const withVanillaExtract = createVanillaExtractPlugin({ tests: /\.css$/ });

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...withVanillaExtract({
    webpack: (config, { isServer }) => {
      config.module.rules.push({
        test: /\.glsl$/,
        type: 'asset/source',
      });

      if (isServer) {
        writeFileSync(
          'public/assets/versions.json',
          JSON.stringify(
            readdirSync('docs/changelogs').map((file) =>
              file.replace('.md', ''),
            ),
          ),
        );
      }

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
