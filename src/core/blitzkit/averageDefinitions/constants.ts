import { AverageDefinitionsAllStats, Samples } from '.';
import { emptyAllStats } from '../../blitzstars/getStatsInPeriod/constants';

export const emptyAverageDefinitionsAllStats: AverageDefinitionsAllStats = {
  ...emptyAllStats,
  battle_life_time: 0,
};

export const averageDefinitionsAllStatsKeys = Object.keys(
  emptyAverageDefinitionsAllStats,
) as (keyof AverageDefinitionsAllStats)[];

export const emptySamples: Samples = {
  d_1: 0,
  d_7: 0,
  d_30: 0,
  d_60: 0,
  d_90: 0,
  d_120: 0,
  total: 0,
};
