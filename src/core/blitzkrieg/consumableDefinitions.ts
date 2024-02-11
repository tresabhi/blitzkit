import { asset } from './asset';
import { fetchCdonLz4 } from './fetchCdonLz4';

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
    }
  | {
      type: 'nation';
      nations: string[];
    };

export interface ConsumableEntry {
  id: number;
  name: string;
  include: TankFilterDefinition[];
  exclude?: TankFilterDefinition[];
}

export interface ConsumableDefinitions {
  [key: string]: ConsumableEntry;
}

export const consumableDefinitions = fetchCdonLz4<ConsumableDefinitions>(
  asset('definitions/consumables.cdon.lz4'),
);

consumableDefinitions.then(console.log);
