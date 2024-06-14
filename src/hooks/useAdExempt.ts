import { useApp } from '../stores/app';

export function useAdExempt() {
  const patreon = useApp((state) => state.logins.patreon);

  if (!patreon) return false;

  fetch(`/api/patreon/membership/${patreon.token}`)
    .then((response) => response.json())
    .then(console.log);
}
