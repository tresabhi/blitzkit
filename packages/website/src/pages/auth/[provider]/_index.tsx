import { useEffect } from 'react';
import { App } from '../../../stores/app';

export const AUTH_PROVIDERS = ['wargaming'] as const;

type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export const AUTH_PROVIDER_NAMES: Record<AuthProvider, string> = {
  wargaming: 'Wargaming',
};

interface AuthorizeProps {
  provider: AuthProvider;
}

export function Authorize(props: AuthorizeProps) {
  return (
    <App.Provider>
      <Content {...props} />
    </App.Provider>
  );
}

function Content({ provider }: AuthorizeProps) {
  const mutateApp = App.useMutation();

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

          mutateApp((draft) => {
            draft.logins.wargaming = {
              expires: Number(searchParams.get('expires_at')) * 1000,
              token: searchParams.get('access_token')!,
              id: Number(searchParams.get('account_id'))!,
            };
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
