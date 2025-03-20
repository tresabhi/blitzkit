import { imgur } from '@blitzkit/core';
import { DEFAULT_LOCALE } from '@blitzkit/i18n';
import type { APIRoute, GetStaticPaths } from 'astro';
import { fetchGlossary } from '../../../core/blitz/fetchGlossary';
import { blobMirror } from '../../../core/blitzkit/blobMirror';

export const getStaticPaths = (async () => {
  const glossary = await fetchGlossary(DEFAULT_LOCALE);
  const avatarKeys = Object.keys(glossary)
    .filter((key) => key.startsWith('avatar_'))
    .map((key) => key.replace('avatar_', ''));

  return avatarKeys.map((avatar) => ({ params: { avatar } }));
}) satisfies GetStaticPaths;

const glossary = await fetchGlossary(DEFAULT_LOCALE);

/**
 * Returns an in-game avatar image. Use gallery/list.json to get all valid ids.
 * Some images may be animated. Not all images share the same dimensions.
 *
 * @warning Not all ids have images due to lousy Wargaming CDN.
 * @param avatar The avatar id.
 * @returns WEBP.
 */
export const GET: APIRoute<{}, { avatar: string }> = async ({ params }) => {
  return await blobMirror(
    glossary[`avatar_${params.avatar}`].image_url ??
      imgur('uXBiK05', { format: 'jpeg' }),
  );
};
