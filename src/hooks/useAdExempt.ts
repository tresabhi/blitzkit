import { use, useMemo } from 'react';
import { useApp } from '../stores/app';

let cache: Record<string, boolean> = {};

export function useAdExempt() {
  const patreon = useApp((state) => state.logins.patreon);
  const promise = useMemo(
    () =>
      new Promise<boolean>(async (resolve) => {
        if (!patreon) return resolve(false);
        if (patreon.token in cache) return resolve(cache[patreon.token]);

        const response = await fetch(
          `/api/patreon/membership/${patreon.token}`,
          { cache: 'force-cache' },
        );
        const json = await response.json();
        const exempt = typeof json === 'boolean' && json;
        cache[patreon.token] = exempt;

        resolve(exempt);
      }),
    [patreon?.token],
  );
  return use(promise);
}
