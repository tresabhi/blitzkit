import { use } from 'react';
import { averageDefinitions } from '../core/blitzkit/averageDefinitions';
import { discoveredIdsDefinitions } from '../core/blitzkit/discoveredIdDefinitions';

export function useAveragesExclusionRatio() {
  const awaitedDiscoveredIdsDefinitions = use(discoveredIdsDefinitions);
  const awaitedAverageDefinitions = use(averageDefinitions);

  return (
    awaitedDiscoveredIdsDefinitions.count /
    awaitedAverageDefinitions.scanned_players
  );
}
