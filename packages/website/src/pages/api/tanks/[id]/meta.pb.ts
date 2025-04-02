import { fetchTanks } from '@blitzkit/core';
import type { APIRoute, GetStaticPaths } from 'astro';
import { apiBlobProxy } from '../../../../core/blitzkit/blobMirror';

export const getStaticPaths = (async () => {
  const tanks = await fetchTanks();
  return tanks.tanks.map((id) => ({ params: { id } }));
}) satisfies GetStaticPaths;

/**
 * Returns the meta data on a tank which includes its modules, characteristics,
 * ancestry, descendants, equipment, characteristics, etc. However, this does
 * not include information on the tank model. Use tanks/list.json to get all
 * valid ids.
 *
 * @param id The tank id.
 * @proto tank
 */
export const GET: APIRoute<{}, { id: string }> = ({ params }) =>
  apiBlobProxy(`/tanks/${params.id}.pb`);
