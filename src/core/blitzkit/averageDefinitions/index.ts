import { AllStats } from '../../blitz/getAccountInfo';
import { asset } from '../asset';
import { fetchCdonLz4 } from '../fetchCdonLz4';

export interface AverageDefinitionsAllStats extends AllStats {
  battle_life_time: number;
}

export interface AverageDefinitions {
  [id: number]: {
    samples: number;

    // average
    mu: AverageDefinitionsAllStats;
    // standard deviation
    sigma: AverageDefinitionsAllStats;
    // correlation coefficient
    r: AverageDefinitionsAllStats;
    // least squares regression line slope
    m: AverageDefinitionsAllStats;
    // least squares regression line y-intercept
    b: AverageDefinitionsAllStats;
  };
}

export const averageDefinitions = fetchCdonLz4<AverageDefinitions>(
  asset('definitions/averages.cdon.lz4'),
);
