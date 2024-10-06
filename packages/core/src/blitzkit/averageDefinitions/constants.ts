import { emptyAllStats } from '../../blitz/constants';
import { Samples } from '../../protos';
import { BlitzkitStats } from '../../statistics';

export const emptyAverageDefinitionsAllStats: BlitzkitStats = {
  ...emptyAllStats,
  battle_life_time: 0,
};

export const averageDefinitionsAllStatsKeys = Object.keys(
  emptyAverageDefinitionsAllStats,
) as (keyof BlitzkitStats)[];

export const emptySamples: Samples = {
  d1: 0,
  d7: 0,
  d30: 0,
  d60: 0,
  d90: 0,
  d120: 0,
  total: 0,
};
