import { useStore } from '@nanostores/react';
import { useLayoutEffect, useState } from 'react';
import { $patreonLogin } from '../stores/patreonLogin';

let cache: Record<string, boolean | Promise<boolean>> = {};

export function useAdExempt() {
  const patreonLogin = useStore($patreonLogin);
  const [exempt, setExempt] = useState(false);

  useLayoutEffect(() => {
    (async () => {
      if (!patreonLogin.token) return setExempt(false);

      if (!(patreonLogin.token in cache)) {
        cache[patreonLogin.token] = new Promise<boolean>(async (resolve) => {
          const response = await fetch(
            `/api/patreon/membership/${patreonLogin.token}`,
            { cache: 'force-cache' },
          );

          if (!response.ok) return resolve(false);

          const json = await response.json();
          const exempt = typeof json === 'boolean' && json;

          cache[patreonLogin.token] = exempt;
          resolve(exempt);
        });
      }

      setExempt(await cache[patreonLogin.token]);
    })();
  }, []);

  return exempt;
}
