import { useDuel } from '../stores/duel';

export function useProvision(id: number) {
  const provisions = useDuel((state) => state.protagonist!.provisions);
  return provisions.includes(id);
}
