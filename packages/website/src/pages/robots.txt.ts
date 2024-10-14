import { assertSecret } from '@blitzkit/core';
import type { APIContext } from 'astro';

export async function GET({}: APIContext) {
  const allowRobots = assertSecret(import.meta.env.ALLOW_ROBOTS) === 'true';

  return new Response(`
User-agent: *
${allowRobots ? 'Allow' : 'Disallow'}: /

${
  allowRobots
    ? `
Host: https://blitzkit.app
Sitemap: https://blitzkit.app/sitemap.txt
`
    : ''
}
`);
}
