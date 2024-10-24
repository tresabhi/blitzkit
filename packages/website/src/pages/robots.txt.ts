import { assertSecret } from '@blitzkit/core';
import type { APIContext } from 'astro';

export async function GET({}: APIContext) {
  const allowRobots = assertSecret(import.meta.env.ALLOW_ROBOTS) === 'true';
  const site = assertSecret(import.meta.env.SITE);

  return new Response(`
    User-agent: *
    ${allowRobots ? 'Allow' : 'Disallow'}: /

    ${
      allowRobots
        ? `
          Host: ${site}
          Sitemap: ${site}/sitemap-index.xml
          `
        : ''
    }
  `);
}
