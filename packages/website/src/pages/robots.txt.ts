import { assertSecret } from '@blitzkit/core';
import type { APIContext } from 'astro';

export async function GET({ request }: APIContext) {
  const allowRobots = assertSecret(import.meta.env.ALLOW_ROBOTS) === 'true';
  const flags: Record<string, string | null> = {
    'User-agent': '*',
    [allowRobots ? 'Allow' : 'Disallow']: '/',

    space: null,
    Sitemap: `${new URL(request.url).origin}/sitemap-index.xml`,
  };

  return new Response(
    Object.entries(flags)
      .map(([key, value]) => (value === null ? '' : `${key}: ${value}`))
      .join('\n'),
  );
}
