import { assertSecret, type BlitzkitResponse } from '@blitzkit/core';
import type { APIContext } from 'astro';

export const prerender = false;

export async function GET({ request, params }: APIContext) {
  const code = request.headers.get('code');

  if (!code) {
    return Response.json({
      status: 'error',
      error: 'UNDEFINED_CODE',
    } satisfies BlitzkitResponse);
  }

  const response = await fetch(
    `https://www.patreon.com/api/oauth2/token?code=${
      code
    }&grant_type=authorization_code&client_id=${assertSecret(
      import.meta.env.PUBLIC_PATREON_CLIENT_ID,
    )}&client_secret=${assertSecret(
      import.meta.env.PATREON_CLIENT_SECRET,
    )}&redirect_uri=${assertSecret(
      import.meta.env.PUBLIC_PATREON_REDIRECT_URI,
    )}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  );
  const json = await response.json();

  return Response.json(json);
}
