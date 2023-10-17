// a cleaner simplification of Blitz Stars' histories because it's a mess there

import { AllStats } from '../core/blitz/getAccountInfo';

export interface History {
  all: AllStats;
  last_battle_time: number;
}

export type Histories = History[];

export interface GetHistoriesOptions {
  start: number;
  end: number;
  includeLatestHistories: boolean;
  includePreviousHistories: boolean;
}

export const getHistoriesDefaultOptions: GetHistoriesOptions = {
  start: -Infinity,
  end: Infinity,
  includeLatestHistories: false,
  includePreviousHistories: false,
};
