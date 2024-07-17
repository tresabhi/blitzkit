import { AllStats } from '../../blitz/getAccountInfo';
import { decode } from '../../protobuf/decode';
import { asset } from '../asset';

export interface AverageDefinitionsAllStats extends AllStats {
  battle_life_time: number;
}

export interface AverageDefinitionsEntry {
  mu: AverageDefinitionsAllStats;
  sigma: AverageDefinitionsAllStats;
  r: AverageDefinitionsAllStats;
  samples: Samples;
}

export interface AverageDefinitionsEntrySubPartial {
  mu: Partial<AverageDefinitionsAllStats>;
  sigma: Partial<AverageDefinitionsAllStats>;
  r: Partial<AverageDefinitionsAllStats>;
  samples: Samples;
}

export interface AverageDefinitionsEntryWithId extends AverageDefinitionsEntry {
  id: number;
}

export interface AverageDefinitions {
  averages: Record<number, AverageDefinitionsEntry>;
  samples: Samples;
  time: number;
}

export interface Samples {
  d_1: number;
  d_7: number;
  d_30: number;
  d_60: number;
  d_90: number;
  d_120: number;
  total: number;
}

export interface AverageDefinitionsManifest {
  version: 1;
  /**
   * epoch in days
   */
  latest: number;
}

export const averageDefinitions = fetch(asset('averages/manifest.json'), {
  cache: 'no-store',
})
  .then((response) => response.json() as Promise<AverageDefinitionsManifest>)
  .then((manifest) => fetch(asset(`averages/${manifest.latest}.pb`)))
  .then((response) => response.arrayBuffer())
  .then((buffer) =>
    decode<AverageDefinitions>(
      'blitzkit.AverageDefinitions',
      new Uint8Array(buffer),
    ),
  );

export const averageDefinitionsArray = averageDefinitions.then((data) =>
  Object.entries(data.averages).map(
    ([key, value]) =>
      ({
        id: Number(key),
        ...(value as AverageDefinitionsEntry),
      }) satisfies AverageDefinitionsEntryWithId,
  ),
);
