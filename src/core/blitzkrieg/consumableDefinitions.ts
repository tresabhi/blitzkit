import { asset } from './asset';
import { fetchBkonLz4 } from './fetchBkonLz4';

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
  effects?: Record<string, number>;
  include: TankFilterDefinition[];
  exclude?: TankFilterDefinition[];
}

export interface ConsumableDefinitions {
  [key: string]: ConsumableEntry;
}

export const consumableDefinitions = fetchBkonLz4<ConsumableDefinitions>(
  asset('definitions/consumables.bkon.lz4'),
);
