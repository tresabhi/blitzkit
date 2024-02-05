import { asset } from './asset';
import { TankFilterDefinition } from './consumableDefinitions';
import { fetchBkonLz4 } from './fetchBkonLz4';

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

export const provisionDefinitions = fetchBkonLz4<ProvisionDefinitions>(
  asset('definitions/provisions.bkon.lz4'),
);
