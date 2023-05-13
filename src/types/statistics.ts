import { AllStats, SpecialStats } from './accountInfo.js';

export interface BlitzStartsComputedPeriodicStatistics {
  all: AllStats;

  wn7: number;
  wn8: number;
  avg_tier: number;
}

export interface PeriodStatistics
  extends BlitzStartsComputedPeriodicStatistics {
  special: SpecialStats;
  pwp: number;
}

export interface PlayerPeriodicStatsCollection {
  statistics: PeriodStatistics;
  period30d: PeriodStatistics;
  period90d: PeriodStatistics;

  _id: string;
  nickname: string;
  nickname_lowercase: string;
  region: string;
  last_battle_time: number;
  __v: number;
  updatedAt: string;
  createdAt: string;
}
