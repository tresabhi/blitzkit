import type { APIRoute } from 'astro';
import packageJSON from '../../../../../package.json';
import { TOOLS } from '../../constants/tools';

/**
 * Returns information on the current build of BlitzKit like the version
 * number, date of compilation, the game version used, etc.
 *
 * @todo Add more meta data.
 * @returns JSON.
 */
export const GET: APIRoute = async ({ request }) => {
  return Response.json({
    url: new URL(request.url).origin,
    version: packageJSON.version,
    tools: TOOLS.map((tool) => tool.id),
  });
};
