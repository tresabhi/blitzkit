import { asset } from './asset';

export type TankFilterDefinitionCategory = 'clip';

export type TankFilterDefinition =
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
      categories: TankFilterDefinitionCategory[];
    };

export interface ConsumableEntry {
  id: number;
  name: string;
  effects?: Record<string, number>;
  include: TankFilterDefinition[];
  exclude?: TankFilterDefinition[];
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
