import type { APIRoute } from 'astro';
import packageJSON from '../../../../../package.json';

/**
 * Returns information on the current build of BlitzKit like the version
 * number, date of compilation, the game version used, etc.
 *
 * @todo Add more meta data.
 * @returns JSON.
 */
export const GET: APIRoute = async () => {
  return Response.json({ version: packageJSON.version });
};
