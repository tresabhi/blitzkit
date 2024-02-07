import { asset } from './asset';
import { TankFilterDefinition } from './consumableDefinitions';
import { fetchCdonLz4 } from './fetchCdonLz4';

export interface ProvisionEntry {
  id: number;
  name: string;
  effects?: Record<string, number>;
  include: TankFilterDefinition[];
  exclude?: TankFilterDefinition[];
}

export interface ProvisionDefinitions {
  [key: string]: ProvisionEntry;
}

export const provisionDefinitions = fetchCdonLz4<ProvisionDefinitions>(
  asset('definitions/provisions.cdon.lz4'),
);
