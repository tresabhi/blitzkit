import { averageDefinitions, discoveredIdsDefinitions } from '@blitzkit/core';

const awaitedDiscoveredIdsDefinitions = await discoveredIdsDefinitions;
const awaitedAverageDefinitions = await averageDefinitions;

export function useAveragesExclusionRatio() {
  return (
    awaitedDiscoveredIdsDefinitions.count /
    awaitedAverageDefinitions.samples.total
  );
}
