import { use } from 'react';
import { provisionDefinitions } from '../core/blitzkrieg/provisionDefinitions';
import { useDuel } from '../stores/duel';

export function useProvisions() {
  const provisions = useDuel((state) => state.protagonist!.provisions);
  const awaitedProvisionDefinitions = use(provisionDefinitions);
  return provisions.map((id) => awaitedProvisionDefinitions[id]);
}
