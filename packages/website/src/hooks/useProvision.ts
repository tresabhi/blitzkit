import { Duel } from '../stores/duel';

export function useProvision(id: number) {
  const provisions = Duel.use((state) => state.protagonist.provisions);
  return provisions.includes(id);
}
