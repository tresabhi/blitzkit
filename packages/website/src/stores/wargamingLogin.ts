import { persistentMap } from '@nanostores/persistent';

type WargamingLogin =
  | {
      token: undefined;
    }
  | {
      token: string;
      id: string;
      expires: string;
    };

export const $wargamingLogin = persistentMap<WargamingLogin>('wargaming:', {
  token: undefined,
});
