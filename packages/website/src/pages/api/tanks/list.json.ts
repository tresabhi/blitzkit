import { fetchTanks } from '@blitzkit/core';
import type { APIRoute } from 'astro';

/**
 * Returns a list of all tank ids. There is no guarantee of order.
 *
 * @returns JSON.
 */
export const GET: APIRoute = async () => {
  const tanks = await fetchTanks();
  return Response.json(tanks.tanks);
};
