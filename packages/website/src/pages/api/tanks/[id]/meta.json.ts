import { fetchTanks, Tank } from '@blitzkit/core';
import type { APIRoute, GetStaticPaths } from 'astro';
import { jsonMirror } from '../../../../core/blitzkit/blobMirror';

export const getStaticPaths = (async () => {
  const tanks = await fetchTanks();
  return tanks.tanks.map((id) => ({ params: { id } }));
}) satisfies GetStaticPaths;

/**
 * Identical to tanks/[id]/meta.pb but in JSON.
 *
 * @param id The tank id.
 * @returns JSON.
 */
export const GET: APIRoute<{}, { id: string }> = ({ params }) =>
  jsonMirror(`/tanks/${params.id}.pb`, Tank);
