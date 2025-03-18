import { imgur } from '@blitzkit/core';
import { DEFAULT_LOCALE } from '@blitzkit/i18n';
import type { APIRoute, GetStaticPaths } from 'astro';
import { fetchGlossary } from '../../../core/blitz/fetchGlossary';

export const getStaticPaths = (async () => {
  const glossary = await fetchGlossary(DEFAULT_LOCALE);
  const avatarKeys = Object.keys(glossary)
    .filter((key) => key.startsWith('avatar_'))
    .map((key) => key.replace('avatar_', ''));

  return avatarKeys.map((avatar) => ({ params: { avatar } }));
}) satisfies GetStaticPaths;

const glossary = await fetchGlossary(DEFAULT_LOCALE);

/**
 * Test comment.
 * Test comment.
 * Test comment.
 * Test comment.
 * Test comment.
 * Test comment.
 */
export const GET: APIRoute<{}, { avatar: string }> = async ({ params }) => {
  const image =
    glossary[`avatar_${params.avatar}`].image_url ??
    imgur('uXBiK05', { format: 'jpeg' });

  if (import.meta.env.MODE === 'development') {
    return Response.redirect(image);
  } else {
    const response = await fetch(image);
    const blob = await response.blob();
    return new Response(blob, { headers: response.headers });
  }
};
