import { fetchPB } from '../../protobuf';
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
  return await fetchPB(
    asset(`averages/${manifestJson.latest}.pb`),
    AverageDefinitions,
  );
}

export * from './constants';
