import { assertSecrete } from './secrete';

export function patreonLoginUrl() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: assertSecrete(process.env.NEXT_PUBLIC_PATREON_CLIENT_ID),
    redirect_uri: assertSecrete(process.env.NEXT_PUBLIC_PATREON_REDIRECT_URI),
    scope: 'identity',
  });

  return `https://www.patreon.com/oauth2/authorize?${params}`;
}
