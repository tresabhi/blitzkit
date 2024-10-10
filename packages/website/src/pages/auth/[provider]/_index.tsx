import { useEffect } from 'react';
import { $patreonLogin } from '../../../stores/patreonLogin';
import { $wargamingLogin } from '../../../stores/wargamingLogin';

export const AUTH_PROVIDERS = ['wargaming', 'patreon'] as const;

type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const AUTH_PROVIDER_NAMES: Record<AuthProvider, string> = {
  patreon: 'Patreon',
  wargaming: 'Wargaming',
};

export interface PatreonAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: 'Bearer';
  scope: string;
  refresh_token: string;
  version: string;
}

interface AuthorizeProps {
  provider: AuthProvider;
}

export function Authorize({ provider }: AuthorizeProps) {
  useEffect(() => {
    (async () => {
      const searchParams = new URLSearchParams(window.location.search);

      switch (provider) {
        case 'wargaming': {
          if (
            !searchParams.has('expires_at') ||
            !searchParams.has('access_token') ||
            !searchParams.has('account_id')
          ) {
            break;
          }

          $wargamingLogin.set({
            expires: `${Number(searchParams.get('expires_at')) * 1000}`,
            token: searchParams.get('access_token')!,
            id: searchParams.get('account_id')!,
          });

          break;
        }

        case 'patreon': {
          if (!searchParams.get('code')) break;

          const response = await fetch(
            `/api/patreon/auth/${searchParams.get('code')}`,
          );
          const data = (await response.json()) as PatreonAuthResponse;

          $patreonLogin.set({
            token: data.access_token,
            refreshToken: data.refresh_token,
            expires: `${Date.now() + data.expires_in * 1000}`,
          });

          break;
        }

        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      window.location.href = searchParams.get('return') ?? '/';
    })();
  }, []);

  return null;
}
