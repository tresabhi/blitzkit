import { AllStats } from '../../blitz/getAccountInfo';
import { asset } from '../asset';
import { fetchCdonLz4 } from '../fetchCdonLz4';

export interface AverageDefinitionsAllStats extends AllStats {
  battle_life_time: number;
}

export interface AverageDefinitions {
  [id: number]: {
    n: number; // sample size
    r: AverageDefinitionsAllStats; // correlation coefficient
    mu: AverageDefinitionsAllStats; // mean
    sigma: AverageDefinitionsAllStats; // standard deviation
  };
}

export const averageDefinitions = fetchCdonLz4<AverageDefinitions>(
  asset('definitions/averages.cdon.lz4'),
);
