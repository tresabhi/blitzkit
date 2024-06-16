import { use, useMemo } from 'react';
import { useApp } from '../stores/app';

let cache: boolean | undefined = undefined;

export function useAdExempt() {
  if (cache !== undefined) return cache;

  const patreon = useApp((state) => state.logins.patreon);

  if (!patreon) return false;

  const promise = useMemo(
    () =>
      fetch(`/api/patreon/membership/${patreon.token}`, {
        cache: 'force-cache',
      }).then((response) => response.json()),
    [patreon.token],
  );
  const data = use(promise);

  const exempt = typeof data === 'boolean' && data;
  cache = exempt;

  return exempt;
}
