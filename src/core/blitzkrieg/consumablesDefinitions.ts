import { asset } from './asset';

export type ConsumableDefinitionFilterCategory = 'clip';

type ConsumableDefinitionFilter =
  | {
      type: 'tier';
      min: number;
      max: number;
    }
  | {
      type: 'ids';
      ids: number[];
    }
  | {
      type: 'category';
      categories: ConsumableDefinitionFilterCategory[];
    };

export interface ConsumableEntry {
  id: number;
  name: string;
  effects?: Record<string, number>;
  include: ConsumableDefinitionFilter[];
  exclude?: ConsumableDefinitionFilter[];
}

export interface ConsumableDefinitions {
  [key: string]: ConsumableEntry;
}

export const consumableDefinitions = fetch(
  asset('definitions/consumables.json'),
  {
    cache: 'no-cache',
  },
).then(async (response) => response.json() as Promise<ConsumableDefinitions>);
