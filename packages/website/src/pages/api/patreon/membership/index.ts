import type { APIContext } from 'astro';

export const prerender = false;

export async function GET({}: APIContext) {
  return Response.json({ hello: Math.random() });
}
