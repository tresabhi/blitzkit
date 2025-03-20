import { asset } from '@blitzkit/core';
import type { APIRoute } from 'astro';
import { blobMirror } from '../../../../../core/blitzkit/blobMirror';

export { getStaticPaths } from '../meta.json';

/**
 * Returns the small icon for a tank, the image that appears in the team list in a battle or the loading screen. Use tanks/list.json for all valid ids.
 *
 * @param id The tank id.
 * @returns PNG.
 */
export const GET: APIRoute<{}, { id: string }> = async ({ params }) => {
  return await blobMirror(asset(`/tanks/${params.id}/icons/small.png`));
};
