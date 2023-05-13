import { BlitzStartsComputedPeriodicStatistics } from './statistics.js';

export type PlayerStats = {
  clan: {
    clan_id: number;
    name: string;
    tag: string;
  };
  statistics: BlitzStartsComputedPeriodicStatistics;
  _id: string;
  last_battle_time: number;
  nickname: string;
  account_id: number;
  achievements: {
    account_id: string;
    medalLafayettePool: number;
    medalRadleyWalters: number;
    warrior: number;
    jointVictoryCount: number;
  };
  region: string;
  __v: number;
}[];
