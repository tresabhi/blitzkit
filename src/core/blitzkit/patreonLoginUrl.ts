export function patreonLoginUrl() {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.NEXT_PUBLIC_PATREON_CLIENT_ID as string,
    redirect_uri: process.env.NEXT_PUBLIC_PATREON_REDIRECT_URI as string,
    scope: 'identity',
  });

  return `https://www.patreon.com/oauth2/authorize?${params}`;
}
