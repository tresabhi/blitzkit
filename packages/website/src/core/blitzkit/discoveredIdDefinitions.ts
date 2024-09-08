import { asset } from '@blitzkit/core';

export interface DiscoveredIdsDefinitions {
  time: number;
  chunks: number;
  count: number;
}

export const discoveredIdsDefinitions = fetch(asset('ids/manifest.json')).then(
  (response) => response.json() as Promise<DiscoveredIdsDefinitions>,
);
