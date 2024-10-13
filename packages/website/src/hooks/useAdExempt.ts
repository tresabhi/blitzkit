import { useEffect, useState } from 'react';
import { App } from '../stores/app';

let cache: Record<string, boolean | Promise<boolean>> = {};

export function useAdExempt() {
  const patreon = App.use((state) => state.logins.patreon);
  const [exempt, setExempt] = useState(true);

  useEffect(() => {
    (async () => {
      if (!patreon) return setExempt(false);

      if (!(patreon.token in cache)) {
        cache[patreon.token] = new Promise<boolean>(async (resolve) => {
          const response = await fetch(`/api/patreon/membership`, {
            cache: 'default',
            headers: { token: patreon.token },
          });

          if (!response.ok) return resolve(false);

          const json = await response.json();

          console.log(json);

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
