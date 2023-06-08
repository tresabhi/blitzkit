import { AllStats } from '../../types/accountInfo.js';

export interface SpecialStats {
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
  all: AllStats;
  special: SpecialStats;
  percentiles: SpecialPercentiles;
  percentiles_player_count: number;
  meanSd: MeanSd;
  shotEff: number;
  last_update: number;
}

export const tankAverages: Record<number, IndividualTankAverage> = {};

console.log('Caching tank averages...');
fetch('https://www.blitzstars.com/api/tankaverages.json')
  .then((response) => response.json() as Promise<IndividualTankAverage[]>)
  .then((individualTankAverages) => {
    individualTankAverages.forEach((individualTankAverage) => {
      tankAverages[individualTankAverage.tank_id] = individualTankAverage;
    });
    console.log('Tank averages cached');
  });
