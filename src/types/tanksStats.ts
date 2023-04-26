import { WargamingResponse } from './wargamingResponse.js';

export type TanksStats = WargamingResponse<{
  [accountId: number]: {
    all: {
      spotted: number;
      hits: number;
      frags: number;
      max_xp: number;
      wins: number;
      losses: number;
      capture_points: number;
      battles: number;
      damage_dealt: number;
      damage_received: number;
      max_frags: number;
      shots: number;
      frags8p: number;
      xp: number;
      win_and_survived: number;
      survived_battles: number;
      dropped_capture_points: number;
    };
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
  }[];
}>;
