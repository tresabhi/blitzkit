import { fetchTankArmor } from '@blitzkit/core';
import type { APIRoute } from 'astro';

export { getStaticPaths } from './meta.json';

/**
 * Returns the thicknesses and types of all armor plates on a tank chunked into
 * groups.
 *
 * @param id The tank id.
 * @returns JSON.
 */
export const GET: APIRoute<{}, { id: string }> = async ({ params }) => {
  const tank = await fetchTankArmor(params.id);
  return Response.json(tank);
};
