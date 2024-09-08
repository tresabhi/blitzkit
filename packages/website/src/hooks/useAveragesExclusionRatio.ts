import { averageDefinitions } from '@blitzkit/core';
import { use } from 'react';
import { discoveredIdsDefinitions } from '../core/blitzkit/discoveredIdDefinitions';

export function useAveragesExclusionRatio() {
  const awaitedDiscoveredIdsDefinitions = use(discoveredIdsDefinitions);
  const awaitedAverageDefinitions = use(averageDefinitions);

  return (
    awaitedDiscoveredIdsDefinitions.count /
    awaitedAverageDefinitions.samples.total
  );
}
