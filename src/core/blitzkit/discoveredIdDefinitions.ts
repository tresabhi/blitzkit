import { asset } from './asset';
import isDev from './isDev';

export interface DiscoveredIdsDefinitions {
  time: number;
  chunks: number;
  count: number;
}

export const discoveredIdsDefinitions = fetch(
  asset('ids/manifest.json', isDev()),
).then((response) => response.json() as Promise<DiscoveredIdsDefinitions>);
