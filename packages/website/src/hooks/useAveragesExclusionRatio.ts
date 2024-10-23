import {
  fetchAverageDefinitions,
  fetchDiscoveredIdsDefinitions,
} from '@blitzkit/core';

const awaitedDiscoveredIdsDefinitions = await fetchDiscoveredIdsDefinitions();
const awaitedAverageDefinitions = await fetchAverageDefinitions();

export function useAveragesExclusionRatio() {
  return (
    awaitedDiscoveredIdsDefinitions.count /
    awaitedAverageDefinitions.samples.total
  );
}
