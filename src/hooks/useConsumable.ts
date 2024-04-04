export function useConsumable(id: number, consumables: number[]) {
  return consumables.includes(id);
}
