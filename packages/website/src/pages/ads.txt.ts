import { assertSecret } from '@blitzkit/core';
import type { APIContext } from 'astro';

export const prerender = false;

export async function GET({}: APIContext) {
  const response = await fetch(
    `https://api.nitropay.com/v1/ads-${assertSecret(
      import.meta.env.PUBLIC_NITROPAY_ID,
    )}.txt`,
  );
  const text = await response.text();
  const date = new Date();
  const content = `# Generated on ${date.toUTCString()}\n\n${text}`;

  return new Response(content);
}
