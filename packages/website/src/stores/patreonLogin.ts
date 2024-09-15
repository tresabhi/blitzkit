import { persistentMap } from '@nanostores/persistent';

type PatreonLogin =
  | {
      token: undefined;
    }
  | {
      token: string;
      refreshToken: string;
      expires: string;
    };

export const $patreonLogin = persistentMap<PatreonLogin>('patreon:', {
  token: undefined,
});
