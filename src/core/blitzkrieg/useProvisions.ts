import { use } from 'react';
import { useTankopediaTemporary } from '../../stores/tankopedia';
import { provisionDefinitions } from './provisionDefinitions';

export function useProvisions() {
  const provisions = useTankopediaTemporary((state) => state.provisions);
  const awaitedProvisionDefinitions = use(provisionDefinitions);
  return provisions.map((id) => awaitedProvisionDefinitions[id]);
}
