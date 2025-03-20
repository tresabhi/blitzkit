import { fetchTanksFull } from '@blitzkit/core';
import type { APIRoute } from 'astro';

/**
 * Returns meta data similar to tanks/[id].json but for all tanks as an array. There is no guarantee of order.
 *
 * @warning This is a large response. Consider using tanks/[id]/meta.json for individual tanks.
 * @returns JSON.
 */
export const GET: APIRoute = async () => {
  const tanksFull = await fetchTanksFull();
  return Response.json(tanksFull.tanks);
};
