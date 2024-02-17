import { useTankopediaTemporary } from '../stores/tankopedia';

export function useConsumable(id: number) {
  const consumables = useTankopediaTemporary((state) => state.consumables);
  return consumables.includes(id);
}
