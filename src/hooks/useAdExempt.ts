import { use } from 'react';
import { useApp } from '../stores/app';

let cache: boolean | undefined = undefined;

export function useAdExempt() {
  if (cache !== undefined) return cache;

  const patreon = useApp((state) => state.logins.patreon);

  if (!patreon) return false;

  const json = use(
    fetch(`/api/patreon/membership/${patreon.token}`, {
      cache: 'force-cache',
    }).then((response) => response.json()),
  );

  const exempt = typeof json === 'boolean' && json;
  cache = exempt;

  return exempt;
}
