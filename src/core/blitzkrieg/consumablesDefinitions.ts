import { asset } from './asset';

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
      categories: string[];
    };

export interface ConsumableDefinitions {
  [key: string]: {
    id: number;
    name: string;
    effects?: Record<string, number>;
    include: ConsumableDefinitionFilter[];
    exclude?: ConsumableDefinitionFilter[];
  };
}

export const consumableDefinitions = fetch(
  asset('definitions/consumables.json'),
  {
    cache: 'no-cache',
  },
).then(async (response) => response.json() as Promise<ConsumableDefinitions>);
