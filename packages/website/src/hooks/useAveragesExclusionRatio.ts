import { averageDefinitions, discoveredIdsDefinitions } from '@blitzkit/core';
import { use } from 'react';

export function useAveragesExclusionRatio() {
  const awaitedDiscoveredIdsDefinitions = use(discoveredIdsDefinitions);
  const awaitedAverageDefinitions = use(averageDefinitions);

  return (
    awaitedDiscoveredIdsDefinitions.count /
    awaitedAverageDefinitions.samples.total
  );
}
