import { BlitzStats } from '@blitzkit/core';
import { context } from '@blitzkit/core/src/blitzkit/context';

interface SpecialStats {
  winrate: number;
  damageRatio: number;
  kdr: number;
  damagePerBattle: number;
  killsPerBattle: number;
  hitsPerBattle: number;
  spotsPerBattle: number;
  wpm: number;
  dpm: number;
  kpm: number;
  hitRate: number;
  survivalRate: number;
}

export type Percentiles = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface SpecialPercentiles {
  winRate: Percentiles;
  damageRatio: Percentiles;
  kdr: Percentiles;
  damagePerBattle: Percentiles;
  killsPerBattle: Percentiles;
  hitsPerBattle: Percentiles;
  spotsPerBattle: Percentiles;
  wpm: Percentiles;
  dpm: Percentiles;
  kpm: Percentiles;
  hitRate: Percentiles;
  survivalRate: Percentiles;
}

export interface MeanSd {
  winrateMean: number;
  winrateSd: number;
  hitRateMean: number;
  hitRateSd: number;
  survivalRateMean: number;
  survivalRateSd: number;
  damageRatioMean: number;
  damageRatioSd: number;
  kdrMean: number;
  kdrSd: number;
  dpbMean: number;
  dpbSd: number;
  kpbMean: number;
  kpbSd: number;
  hpbMean: number;
  hpbSd: number;
  spbMean: number;
  spbSd: number;
}

export interface IndividualTankAverage {
  _id: number;
  battle_life_time: number;
  total_battle_life_time: number;
  number_of_players: number;
  tank_id: number;
  all: BlitzStats;
  special: SpecialStats;
  percentiles: SpecialPercentiles;
  percentiles_player_count: number;
  meanSd: MeanSd;
  shotEff: number;
  last_update: number;
}

export type BlitzStarsTankAverages = Record<number, IndividualTankAverage>;

export const blitzStarsTankAverages = fetch(
  'https://www.blitzstars.com/api/tankaverages.json',
)
  .then((response) => response.json())
  .then((json) => {
    if (context === 'server') {
      const partialTankAverages: BlitzStarsTankAverages = {};

      (json as IndividualTankAverage[]).forEach((individualTankAverage) => {
        partialTankAverages[individualTankAverage.tank_id] =
          individualTankAverage;
      });

      return partialTankAverages;
    } else {
      return json as BlitzStarsTankAverages;
    }
  });
