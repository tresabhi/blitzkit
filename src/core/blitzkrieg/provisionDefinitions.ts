import { asset } from './asset';
import { TankFilterDefinition } from './consumableDefinitions';

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

export const provisionDefinitions = fetch(
  asset('definitions/provisions.json'),
  {
    cache: 'no-cache',
  },
).then(async (response) => response.json() as Promise<ProvisionDefinitions>);
