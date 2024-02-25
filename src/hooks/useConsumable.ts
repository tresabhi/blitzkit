import { useDuel } from '../stores/duel';

export function useConsumable(id: number) {
  const consumables = useDuel((state) => state.protagonist!.consumables);
  return consumables.includes(id);
}
