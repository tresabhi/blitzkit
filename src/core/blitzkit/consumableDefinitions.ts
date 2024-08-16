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

export type ConsumableEntry = {
  id: number;
  name: string;
  cooldown: number;
  duration?: number;
} & (
  | {
      gameMode: false;
      include: TankFilterDefinition[];
      exclude?: TankFilterDefinition[];
    }
  | {
      gameMode: true;
    }
);

export interface ConsumableDefinitions {
  [key: string]: ConsumableEntry;
}

export const consumableDefinitions = fetchCdonLz4<ConsumableDefinitions>(
  asset('definitions/consumables.cdon.lz4'),
);
