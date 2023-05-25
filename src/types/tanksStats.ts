import { AllStats } from './accountInfo.js';

export interface IndividualTankStats {
  all: AllStats;
  last_battle_time: number;
  account_id: number;
  max_xp: number;
  in_garage_updated: number;
  max_frags: number;
  frags: number | null;
  mark_of_mastery: number;
  battle_life_time: number;
  in_garage: number | null;
  tank_id: number;
}

export type TanksStats = {
  [accountId: number]: IndividualTankStats[];
};
