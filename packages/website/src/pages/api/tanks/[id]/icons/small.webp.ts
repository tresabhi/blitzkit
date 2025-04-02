import type { APIRoute } from 'astro';
import { apiBlobProxy } from '../../../../../core/blitzkit/blobMirror';

export { getStaticPaths } from '../meta.json';

/**
 * Returns the small icon for a tank, the image that appears in the tank carousal in the garage. Use tanks/list.json for all valid ids.
 *
 * @param id The tank id.
 * @returns PNG.
 */
export const GET: APIRoute<{}, { id: string }> = async ({ params }) => {
  return await apiBlobProxy(`/tanks/${params.id}/icons/small.webp`);
};
