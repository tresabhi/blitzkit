import locales from '@blitzkit/i18n/locales.json' with { type: 'json' };
import type { APIRoute, GetStaticPaths, GetStaticPathsItem } from 'astro';
import { getStrings } from 'packages/website-ue/src/core/i18n/getStrings';

export const getStaticPaths: GetStaticPaths = () => {
  return locales.supported.map(
    ({ locale }) => ({ params: { locale } }) satisfies GetStaticPathsItem,
  );
};

export const GET: APIRoute = async ({ params, request }) => {
  const strings = await getStrings(params.locale!);
  return Response.json(strings);
};
