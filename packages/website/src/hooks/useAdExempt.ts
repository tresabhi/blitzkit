import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { $patreonLogin } from '../stores/patreonLogin';

let cache: Record<string, boolean | Promise<boolean>> = {};

export function useAdExempt() {
  const patreon = useStore($patreonLogin);
  const [exempt, setExempt] = useState(false);

  useEffect(() => {
    (async () => {
      if (!patreon.token) return setExempt(false);

      if (!(patreon.token in cache)) {
        cache[patreon.token] = new Promise<boolean>(async (resolve) => {
          const response = await fetch(
            `/api/patreon/membership/${patreon.token}`,
            { cache: 'force-cache' },
          );

          if (!response.ok) return resolve(false);

          const json = await response.json();
          const exempt = typeof json === 'boolean' && json;

          cache[patreon.token] = exempt;
          resolve(exempt);
        });
      }

      setExempt(await cache[patreon.token]);
    })();
  }, []);

  return exempt;
}
