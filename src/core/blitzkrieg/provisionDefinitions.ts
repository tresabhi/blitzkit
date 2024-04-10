import { asset } from './asset';
import { TankFilterDefinition } from './consumableDefinitions';
import { fetchCdonLz4 } from './fetchCdonLz4';

export interface ProvisionEntry {
  id: number;
  name: string;
  include: TankFilterDefinition[];
  exclude?: TankFilterDefinition[];
  crew?: number;
}

export interface ProvisionDefinitions {
  [key: string]: ProvisionEntry;
}

export const provisionDefinitions = fetchCdonLz4<ProvisionDefinitions>(
  asset('definitions/provisions.cdon.lz4'),
);

provisionDefinitions.then(console.log);
