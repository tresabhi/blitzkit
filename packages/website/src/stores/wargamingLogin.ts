import { persistentMap } from '@nanostores/persistent';

type PatreonLogin =
  | {
      token: undefined;
    }
  | {
      token: string;
      id: string;
      expires: string;
    };

export const $wargamingLogin = persistentMap<PatreonLogin>('wargaming:', {
  token: undefined,
});
