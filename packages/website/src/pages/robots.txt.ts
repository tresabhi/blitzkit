import type { APIContext } from 'astro';

export async function GET({ request }: APIContext) {
  const flags: Record<string, string | null> = {
    'User-agent': '*',
    Allow: '/',

    space: null,
    Sitemap: `${new URL(request.url).origin}/sitemap-index.xml`,
  };

  return new Response(
    Object.entries(flags)
      .map(([key, value]) => (value === null ? '' : `${key}: ${value}`))
      .join('\n'),
  );
}
