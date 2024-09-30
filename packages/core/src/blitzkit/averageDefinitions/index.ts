import { AverageDefinitions } from '../../protos';
import { asset } from '../asset';

export interface AverageDefinitionsManifest {
  version: 1;
  /**
   * epoch in days
   */
  latest: number;
}

export async function fetchAverageDefinitions() {
  const manifestResponse = await fetch(asset('averages/manifest.json'));
  const manifestJson =
    (await manifestResponse.json()) as AverageDefinitionsManifest;
  const averageDefinitionsResponse = await fetch(
    asset(`averages/${manifestJson.latest}.pb`),
  );
  const averageDefinitionsBuffer =
    await averageDefinitionsResponse.arrayBuffer();
  const averageDefinitionsArray = new Uint8Array(averageDefinitionsBuffer);

  return AverageDefinitions.deserializeBinary(averageDefinitionsArray);
}

export * from './constants';
