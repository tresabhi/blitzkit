import { AllStats } from '../../blitz/getAccountInfo';
import { decode } from '../../protobuf/decode';
import { asset } from '../asset';

export interface AverageDefinitionsAllStats extends AllStats {
  battle_life_time: number;
}

export interface AverageDefinitionsEntry {
  samples: number;
  mu: AverageDefinitionsAllStats;
  sigma: AverageDefinitionsAllStats;
  r: AverageDefinitionsAllStats;
}

export interface AverageDefinitionsEntrySubPartial {
  samples: number;
  mu: Partial<AverageDefinitionsAllStats>;
  sigma: Partial<AverageDefinitionsAllStats>;
  r: Partial<AverageDefinitionsAllStats>;
}

export interface AverageDefinitions {
  [id: number]: AverageDefinitionsEntry;
}

interface AverageDefinitionsProto {
  averages: AverageDefinitions;
}

export const averageDefinitions = fetch(asset('definitions/averages.pb'))
  .then((response) => response.arrayBuffer())
  .then((buffer) => {
    return decode<AverageDefinitionsProto>(
      'blitzkit.AverageDefinitions',
      new Uint8Array(buffer),
    );
  })
  .then((data) => data.averages);

export const averageDefinitionsArray = averageDefinitions.then((data) =>
  Object.entries(data).map(([key, value]) => ({
    id: Number(key),
    ...(value as AverageDefinitionsEntry),
  })),
);
