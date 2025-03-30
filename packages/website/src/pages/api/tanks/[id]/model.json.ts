import { fetchTankModel } from '@blitzkit/core';
import type { APIRoute } from 'astro';

export { getStaticPaths } from './meta.json';

/**
 * Returns information on the 3D model of the tank. i.e. how to assemble and
 * position the meshes.
 *
 * @param id The tank id.
 * @returns JSON.
 */
export const GET: APIRoute<{}, { id: string }> = async ({ params }) => {
  const tank = await fetchTankModel(params.id);
  return Response.json(tank);
};
