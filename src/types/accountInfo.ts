export interface AllStats {
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
}

export interface SpecialStats {
  winrate: number;
  damageRatio: number;
  kdr: number;
  dpb: number;
  kpb: number;
  hpb: number;
  spb: number;
  hitRate: number;
  survivalRate: number;
}

export interface ClanStats {
  spotted: number;
  max_frags_tank_id: number;
  hits: number;
  frags: number;
  max_xp: number;
  max_xp_tank_id: number;
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
}

export type AccountInfo = {
  [accountId: number]: {
    statistics: {
      clan: ClanStats;
      all: AllStats;
      frags: null;
    };
    account_id: number;
    created_at: number;
    updated_at: number;
    private: null;
    last_battle_time: number;
    nickname: string;
  };
};
