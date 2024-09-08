import { TankFilterDefinition } from '@blitzkit/core/src/blitzkit/consumableDefinitions';
import { asset } from './asset';
import { fetchCdonLz4 } from './fetchCdonLz4';

export type ProvisionEntry = {
  id: number;
  name: string;
  crew?: number;
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

export interface ProvisionDefinitions {
  [key: string]: ProvisionEntry;
}

export const provisionDefinitions = fetchCdonLz4<ProvisionDefinitions>(
  asset('definitions/provisions.cdon.lz4'),
);