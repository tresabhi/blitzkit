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

export interface AverageDefinitionsEntryWithId extends AverageDefinitionsEntry {
  id: number;
}

export interface AverageDefinitionsEntrySubPartial {
  samples: number;
  mu: Partial<AverageDefinitionsAllStats>;
  sigma: Partial<AverageDefinitionsAllStats>;
  r: Partial<AverageDefinitionsAllStats>;
}

export interface AverageDefinitions {
  averages: Record<number, AverageDefinitionsEntry>;
  sampled_players: number;
  scanned_players: number;
}

export const averageDefinitions = fetch(asset('definitions/averages.pb'))
  .then((response) => response.arrayBuffer())
  .then((buffer) => {
    return decode<AverageDefinitions>(
      'blitzkit.AverageDefinitions',
      new Uint8Array(buffer),
    );
  });

export const averageDefinitionsArray = averageDefinitions.then((data) =>
  Object.entries(data.averages).map(
    ([key, value]) =>
      ({
        id: Number(key),
        ...(value as AverageDefinitionsEntry),
      }) satisfies AverageDefinitionsEntryWithId,
  ),
);
