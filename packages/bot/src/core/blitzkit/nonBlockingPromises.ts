import {
  fetchDiscoveredIdsDefinitions,
  fetchGameDefinitions,
  fetchMapDefinitions,
  fetchTankDefinitions,
  fetchTankNames,
} from '@blitzkit/core';

export const tankDefinitions = fetchTankDefinitions();
export const gameDefinitions = fetchGameDefinitions();
export const tankNames = fetchTankNames();
export const mapDefinitions = fetchMapDefinitions();
export const discoveredIdsDefinitions = fetchDiscoveredIdsDefinitions();
