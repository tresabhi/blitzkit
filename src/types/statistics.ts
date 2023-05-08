import { AllStats, SpecialStats } from './accountInfo.js';

export interface PeriodStatistics {
  all: AllStats;
  special: SpecialStats;

  wn7: number;
  wn8: number;
  avg_tier: number;
  pwp: number;
}

export interface PlayerStatistics {
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
