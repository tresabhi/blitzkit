import { use } from 'react';
import { useApp } from '../stores/app';

export function useAdExempt() {
  const patreon = useApp((state) => state.logins.patreon);

  if (!patreon) return false;

  const json = use(
    fetch(`/api/patreon/membership/${patreon.token}`, {
      cache: 'force-cache',
    }).then((response) => response.json()),
  );

  return typeof json === 'boolean' && json;
}
