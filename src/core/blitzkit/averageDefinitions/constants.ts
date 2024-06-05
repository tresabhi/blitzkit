import { AverageDefinitionsAllStats } from '.';

import { emptyAllStats } from '../../blitzstars/getStatsInPeriod/constants';

export const emptyAverageDefinitionsAllStats: AverageDefinitionsAllStats = {
  ...emptyAllStats,
  battle_life_time: 0,
};

export const averageDefinitionsAllStatsKeys = Object.keys(
  emptyAverageDefinitionsAllStats,
) as (keyof AverageDefinitionsAllStats)[];
