import { fetchTank, fetchTanks } from '@blitzkit/core';
import type { APIRoute, GetStaticPaths } from 'astro';

export const getStaticPaths = (async () => {
  const tanks = await fetchTanks();
  return tanks.tanks.map((id) => ({ params: { id } }));
}) satisfies GetStaticPaths;

/**
 * Returns the meta data on a tank which includes its modules, characteristics, ancestry, descendants, equipment, characteristics, etc. However, this does not include information on the tank model.
 *
 * @param avatar The avatar id.
 * @returns A webp image.
 */
export const GET: APIRoute<{}, { id: string }> = async ({ params }) => {
  const tank = await fetchTank(params.id);
  return Response.json(tank);
};
