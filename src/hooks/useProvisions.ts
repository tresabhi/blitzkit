import { use } from 'react';
import { provisionDefinitions } from '../core/blitzkrieg/provisionDefinitions';
import { useTankopediaTemporary } from '../stores/tankopedia';

export function useProvisions() {
  const provisions = useTankopediaTemporary((state) => state.provisions);
  const awaitedProvisionDefinitions = use(provisionDefinitions);
  return provisions.map((id) => awaitedProvisionDefinitions[id]);
}
