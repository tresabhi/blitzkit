import { asset } from '@blitzkit/core';
import type { APIRoute } from 'astro';

export { getStaticPaths } from '../meta.json';

/**
 * Returns the small icon for a tank, the image that appears in the team list in a battle or the loading screen. Use tanks/list.json for all valid ids.
 *
 * @param id The tank id.
 * @returns PNG.
 */
export const GET: APIRoute<{}, { id: string }> = async ({ params }) => {
  const response = await fetch(asset(`tanks/${params.id}/icons/small.png`));
  const blob = await response.blob();
  return new Response(blob, { headers: response.headers });
};
