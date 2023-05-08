import { AllStats } from './accountInfo.js';

export type PlayerStats = {
  clan: {
    clan_id: number;
    name: string;
    tag: string;
  };
  statistics: {
    all: AllStats;
    wn8: number;
    wn7: number;
    average_tier: number;
  };
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
