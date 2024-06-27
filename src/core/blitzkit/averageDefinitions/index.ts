import { AllStats } from '../../blitz/getAccountInfo';
import { asset } from '../asset';
import { fetchCdonLz4 } from '../fetchCdonLz4';

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

export const averageDefinitions = fetchCdonLz4<AverageDefinitions>(
  asset('definitions/averages.cdon.lz4'),
);
