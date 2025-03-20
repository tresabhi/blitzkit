import locales from '@blitzkit/i18n/locales.json';
import type { APIRoute } from 'astro';

/**
 * Returns a list of all locales (languages) supported by BlitzKit along with
 * the default language (English) and the locale codes for Blitz if they differ
 * from what BlitzKit uses internally.
 *
 * @returns JSON.
 */
export const GET: APIRoute = async () => {
  return Response.json(locales);
};
