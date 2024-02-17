import { useTankopediaTemporary } from '../stores/tankopedia';

export function useProvision(id: number) {
  const provisions = useTankopediaTemporary((state) => state.provisions);
  return provisions.includes(id);
}
