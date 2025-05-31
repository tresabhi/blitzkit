import locales from '@blitzkit/i18n/locales.json';
import type { APIRoute, GetStaticPaths } from 'astro';
import { getStrings } from 'packages/website-ue/src/core/i18n/getStrings';

export const getStaticPaths: GetStaticPaths = () => {
  return locales.supported.map(({ locale }) => ({
    params: { locale },
  }));
};

export const GET: APIRoute<{}, { locale: string }> = async ({ params }) => {
  return Response.json(await getStrings(params.locale));
};
